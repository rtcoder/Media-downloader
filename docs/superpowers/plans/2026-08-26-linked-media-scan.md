# Linked Media Scan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "linked media" scan that detects downloadable media behind page links, not only media already embedded in the current page DOM.

**Architecture:** Keep the current DOM/style scan as the fast default path, then add a separate content-script pipeline that collects anchors, classifies direct media URLs, probes ambiguous links by HTTP headers, and optionally performs a shallow HTML scan for common preview/download metadata. The new scanner returns normal `MediaItem` objects so the downloader UI can reuse existing grouping, filtering, metadata loading, and download behavior.

**Tech Stack:** Chrome Manifest V3 extension, TypeScript, webpack, Chrome `scripting`/`downloads` APIs, browser `fetch`, `DOMParser`, Vitest with jsdom for content-script unit tests, existing `MediaItem` and `ItemTypeEnum` types.

**Spec:** Requirements come from the 2026-08-26 user-review response in this task: support links to downloadable media files, loaded resources where practical, and avoid promising paywall/DRM/private-server bypassing.

## Global Constraints

- Do not bypass paywalls, login requirements, access controls, DRM, or expiring authenticated URLs.
- Keep linked-file probing bounded: maximum 80 candidate links per scan, 6 concurrent probes, 3500 ms timeout per probe.
- Do not auto-download newly discovered linked media; only list it for user selection through the existing UI.
- Preserve the existing embedded media scan behavior.
- Prefer `HEAD`; fall back to `GET` with `Range: bytes=0-0` only when `HEAD` fails or returns no useful content type.
- Treat `image/*`, `video/*`, and `audio/*` as media, except `image/x-icon` and tiny favicon-like assets.
- Keep shallow HTML scans same-origin or CORS-readable only; failed CORS/network requests must be ignored, not surfaced as user-visible errors.
- Do not add broad new extension permissions unless a task explicitly justifies them.

---

## File Structure

- Modify `extension/src/content-script/regex-pattern.ts` to expand audio/video extension recognition where low risk.
- Modify `extension/src/content-script/filters-fn.ts` to expose URL/content-type classification helpers.
- Create `extension/src/content-script/linked-media-types.ts` for scanner-specific interfaces.
- Create `extension/src/content-script/linked-media-scanner.ts` for anchor collection, URL normalization, bounded probing, and shallow HTML extraction.
- Modify `extension/src/content-script/send_media/send_media.ts` to merge linked media into the existing send flow.
- Modify `extension/src/content-script/send_media/send-media-mappers-fn.ts` only if source labels or fallback metadata require a mapped property.
- Modify `extension/src/types/media-in-tabs.type.ts` only if the UI needs to distinguish embedded vs linked media.
- Modify downloader UI files only if adding a visible "Linked" badge/section is chosen after the scanner works.
- Modify `extension/package.json` to add Vitest/jsdom test tooling for scanner helper tests.

---

### Task 1: Media Classification Helpers

**Files:**
- Modify: `extension/src/content-script/regex-pattern.ts`
- Modify: `extension/src/content-script/filters-fn.ts`
- Create: `extension/src/content-script/linked-media-types.ts`
- Test: `extension/src/content-script/filters-fn.test.ts`

**Interfaces:**
- Produces: `getMediaTypeFromUrl(url: string): ItemTypeEnum | null`
- Produces: `getMediaTypeFromContentType(contentType: string | null): ItemTypeEnum | null`
- Produces: `isIgnoredLinkedAsset(url: string, contentType?: string | null): boolean`
- Produces type: `LinkedMediaCandidate`

- [ ] **Step 1: Add or confirm test tooling**

If the project still has no test runner, add Vitest and jsdom:

```bash
cd extension
npm install --save-dev vitest jsdom
```

Update `extension/package.json` scripts:

```json
{
  "scripts": {
    "build": "webpack --mode production",
    "start": "webpack --watch",
    "test": "vitest --environment jsdom run"
  }
}
```

- [ ] **Step 2: Write failing classification tests**

Create `extension/src/content-script/filters-fn.test.ts`:

```ts
import {describe, expect, it} from 'vitest';
import {ItemTypeEnum} from '../types/media-in-tabs.type';
import {
  getMediaTypeFromContentType,
  getMediaTypeFromUrl,
  isIgnoredLinkedAsset,
} from './filters-fn';

describe('linked media classification', () => {
  it('detects direct media URLs by extension', () => {
    expect(getMediaTypeFromUrl('https://cdn.example.com/photo.webp?size=large')).toBe(ItemTypeEnum.IMAGE);
    expect(getMediaTypeFromUrl('https://cdn.example.com/movie.mp4?token=abc')).toBe(ItemTypeEnum.VIDEO);
    expect(getMediaTypeFromUrl('https://cdn.example.com/audio.m4a')).toBe(ItemTypeEnum.AUDIO);
  });

  it('detects media responses by content type', () => {
    expect(getMediaTypeFromContentType('image/jpeg; charset=binary')).toBe(ItemTypeEnum.IMAGE);
    expect(getMediaTypeFromContentType('video/mp4')).toBe(ItemTypeEnum.VIDEO);
    expect(getMediaTypeFromContentType('audio/mpeg')).toBe(ItemTypeEnum.AUDIO);
    expect(getMediaTypeFromContentType('text/html; charset=utf-8')).toBeNull();
  });

  it('ignores common non-download assets', () => {
    expect(isIgnoredLinkedAsset('https://example.com/favicon.ico', 'image/x-icon')).toBe(true);
    expect(isIgnoredLinkedAsset('https://example.com/icon.svg', 'image/svg+xml')).toBe(false);
    expect(isIgnoredLinkedAsset('javascript:void(0)')).toBe(true);
    expect(isIgnoredLinkedAsset('mailto:test@example.com')).toBe(true);
  });
});
```

- [ ] **Step 3: Run tests and confirm failure**

Run:

```bash
cd extension
npm test -- filters-fn.test.ts
```

Expected: fail because the exported helper functions do not exist yet.

- [ ] **Step 4: Implement helper interfaces**

Create `extension/src/content-script/linked-media-types.ts`:

```ts
import {ItemTypeEnum} from '../types/media-in-tabs.type';

export type LinkedMediaCandidate = {
  src: string;
  type: ItemTypeEnum;
  poster?: string | null;
  sourceUrl: string;
  label?: string;
};

export type ProbeResult = {
  url: string;
  contentType: string | null;
  finalUrl: string;
  ok: boolean;
};
```

Add exports to `extension/src/content-script/filters-fn.ts`:

```ts
import {ItemTypeEnum} from '../types/media-in-tabs.type';

export function getMediaTypeFromUrl(url: string): ItemTypeEnum | null {
  if (isImageURL(url)) {
    return ItemTypeEnum.IMAGE;
  }
  if (isVideoURL(url)) {
    return ItemTypeEnum.VIDEO;
  }
  if (isAudioURL(url)) {
    return ItemTypeEnum.AUDIO;
  }
  return null;
}

export function getMediaTypeFromContentType(contentType: string | null): ItemTypeEnum | null {
  const normalized = (contentType || '').toLowerCase().split(';')[0].trim();
  if (!normalized) {
    return null;
  }
  if (normalized.startsWith('image/') && normalized !== 'image/x-icon') {
    return ItemTypeEnum.IMAGE;
  }
  if (normalized.startsWith('video/')) {
    return ItemTypeEnum.VIDEO;
  }
  if (normalized.startsWith('audio/')) {
    return ItemTypeEnum.AUDIO;
  }
  return null;
}

export function isIgnoredLinkedAsset(url: string, contentType: string | null = null): boolean {
  const normalizedUrl = url.trim().toLowerCase();
  const normalizedContentType = (contentType || '').toLowerCase().split(';')[0].trim();

  return !normalizedUrl
    || normalizedUrl.startsWith('javascript:')
    || normalizedUrl.startsWith('mailto:')
    || normalizedUrl.startsWith('tel:')
    || normalizedUrl.startsWith('#')
    || normalizedUrl.endsWith('/favicon.ico')
    || normalizedContentType === 'image/x-icon';
}
```

Update `extension/src/content-script/regex-pattern.ts` audio regex to include common linked audio extensions:

```ts
export const audioRegex = /(?:([^:\/?#]+):)?(?:\/\/([^\/?#]*))?([^?#]*\.(?:mp3|flac|ogg|oga|opus|wav|aac|m4a|wma))(?:\?([^#]*))?(?:#(.*))?/i;
```

- [ ] **Step 5: Run tests and build**

Run:

```bash
cd extension
npm test -- filters-fn.test.ts
npm run build
```

Expected: tests pass and webpack build completes.

- [ ] **Step 6: Commit**

```bash
git add extension/package.json extension/package-lock.json extension/src/content-script/filters-fn.ts extension/src/content-script/filters-fn.test.ts extension/src/content-script/linked-media-types.ts extension/src/content-script/regex-pattern.ts
git commit -m "feat: add linked media classification helpers"
```

---

### Task 2: Anchor Collection and Direct Linked Media Detection

**Files:**
- Create: `extension/src/content-script/linked-media-scanner.ts`
- Test: `extension/src/content-script/linked-media-scanner.test.ts`

**Interfaces:**
- Consumes: `getMediaTypeFromUrl(url: string): ItemTypeEnum | null`
- Consumes: `isIgnoredLinkedAsset(url: string, contentType?: string | null): boolean`
- Produces: `collectLinkedMediaCandidates(documentRef?: Document): LinkedMediaCandidate[]`
- Produces: `normalizeLinkedUrl(rawUrl: string, baseUrl?: string): string | null`

- [ ] **Step 1: Write failing tests**

Create `extension/src/content-script/linked-media-scanner.test.ts`:

```ts
import {describe, expect, it} from 'vitest';
import {ItemTypeEnum} from '../types/media-in-tabs.type';
import {
  collectLinkedMediaCandidates,
  normalizeLinkedUrl,
} from './linked-media-scanner';

describe('linked media scanner', () => {
  it('normalizes relative links', () => {
    expect(normalizeLinkedUrl('/files/photo.jpg', 'https://example.com/gallery/page.html')).toBe('https://example.com/files/photo.jpg');
    expect(normalizeLinkedUrl('files/video.mp4', 'https://example.com/gallery/page.html')).toBe('https://example.com/gallery/files/video.mp4');
    expect(normalizeLinkedUrl('mailto:test@example.com', 'https://example.com')).toBeNull();
  });

  it('collects direct media anchors and removes duplicates', () => {
    const doc = document.implementation.createHTMLDocument('test');
    doc.body.innerHTML = `
      <a href="/downloads/photo.jpg">Photo</a>
      <a href="/downloads/photo.jpg">Duplicate</a>
      <a href="/downloads/movie.mp4">Movie</a>
      <a href="/page.html">HTML</a>
    `;
    const originalLocation = window.location.href;
    window.history.pushState({}, '', 'https://example.com/gallery/');

    const results = collectLinkedMediaCandidates(doc);

    expect(results).toEqual([
      {
        src: 'https://example.com/downloads/photo.jpg',
        type: ItemTypeEnum.IMAGE,
        poster: null,
        sourceUrl: 'https://example.com/gallery/',
        label: 'Photo',
      },
      {
        src: 'https://example.com/downloads/movie.mp4',
        type: ItemTypeEnum.VIDEO,
        poster: null,
        sourceUrl: 'https://example.com/gallery/',
        label: 'Movie',
      },
    ]);

    window.history.pushState({}, '', originalLocation);
  });
});
```

- [ ] **Step 2: Run tests and confirm failure**

Run:

```bash
cd extension
npm test -- linked-media-scanner.test.ts
```

Expected: fail because the scanner module does not exist.

- [ ] **Step 3: Implement direct anchor collection**

Create `extension/src/content-script/linked-media-scanner.ts`:

```ts
import {ItemTypeEnum} from '../types/media-in-tabs.type';
import {
  getMediaTypeFromUrl,
  isIgnoredLinkedAsset,
} from './filters-fn';
import {LinkedMediaCandidate} from './linked-media-types';

const MAX_LINKED_MEDIA_CANDIDATES = 80;

export function normalizeLinkedUrl(rawUrl: string, baseUrl: string = window.location.href): string | null {
  const trimmed = rawUrl.trim();
  if (isIgnoredLinkedAsset(trimmed)) {
    return null;
  }

  try {
    const url = new URL(trimmed, baseUrl);
    if (!['http:', 'https:', 'data:'].includes(url.protocol)) {
      return null;
    }
    return url.href;
  } catch {
    return null;
  }
}

export function collectLinkedMediaCandidates(documentRef: Document = document): LinkedMediaCandidate[] {
  const anchors = Array.from(documentRef.querySelectorAll<HTMLAnchorElement>('a[href]'));
  const seen = new Set<string>();
  const candidates: LinkedMediaCandidate[] = [];

  for (const anchor of anchors) {
    if (candidates.length >= MAX_LINKED_MEDIA_CANDIDATES) {
      break;
    }

    const src = normalizeLinkedUrl(anchor.getAttribute('href') || '');
    if (!src || seen.has(src)) {
      continue;
    }

    const type = getMediaTypeFromUrl(src);
    if (!type) {
      continue;
    }

    seen.add(src);
    candidates.push({
      src,
      type,
      poster: null,
      sourceUrl: window.location.href,
      label: anchor.textContent?.trim() || anchor.getAttribute('download') || undefined,
    });
  }

  return candidates;
}
```

- [ ] **Step 4: Run tests and build**

Run:

```bash
cd extension
npm test -- linked-media-scanner.test.ts
npm run build
```

Expected: tests pass and webpack build completes.

- [ ] **Step 5: Commit**

```bash
git add extension/src/content-script/linked-media-scanner.ts extension/src/content-script/linked-media-scanner.test.ts
git commit -m "feat: detect direct linked media anchors"
```

---

### Task 3: Header Probing for Ambiguous Links

**Files:**
- Modify: `extension/src/content-script/linked-media-scanner.ts`
- Test: `extension/src/content-script/linked-media-scanner.test.ts`

**Interfaces:**
- Consumes: `getMediaTypeFromContentType(contentType: string | null): ItemTypeEnum | null`
- Produces: `probeLinkedMedia(url: string, fetchFn?: typeof fetch): Promise<LinkedMediaCandidate | null>`
- Produces: `findLinkedMedia(documentRef?: Document, fetchFn?: typeof fetch): Promise<LinkedMediaCandidate[]>`

- [ ] **Step 1: Add failing tests for header probing**

Append to `linked-media-scanner.test.ts`:

```ts
it('detects ambiguous links by response content type', async () => {
  const fetchFn = async () => new Response('', {
    status: 200,
    headers: {'Content-Type': 'video/mp4'},
  });

  const result = await probeLinkedMedia('https://files.example.com/download?id=123', fetchFn as typeof fetch);

  expect(result).toEqual({
    src: 'https://files.example.com/download?id=123',
    type: ItemTypeEnum.VIDEO,
    poster: null,
    sourceUrl: window.location.href,
  });
});

it('falls back to ranged GET when HEAD has no useful type', async () => {
  const calls: string[] = [];
  const fetchFn = async (_url: RequestInfo | URL, init?: RequestInit) => {
    calls.push(init?.method || 'GET');
    if (init?.method === 'HEAD') {
      return new Response('', {status: 200});
    }
    return new Response('', {
      status: 206,
      headers: {'Content-Type': 'audio/mpeg'},
    });
  };

  const result = await probeLinkedMedia('https://files.example.com/download?id=456', fetchFn as typeof fetch);

  expect(calls).toEqual(['HEAD', 'GET']);
  expect(result?.type).toBe(ItemTypeEnum.AUDIO);
});
```

- [ ] **Step 2: Run tests and confirm failure**

Run:

```bash
cd extension
npm test -- linked-media-scanner.test.ts
```

Expected: fail because `probeLinkedMedia` does not exist.

- [ ] **Step 3: Implement bounded probing**

Add to `linked-media-scanner.ts`:

```ts
import {getMediaTypeFromContentType} from './filters-fn';

const LINKED_MEDIA_TIMEOUT_MS = 3500;
const LINKED_MEDIA_CONCURRENCY = 6;

async function fetchWithTimeout(
  fetchFn: typeof fetch,
  url: string,
  init: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), LINKED_MEDIA_TIMEOUT_MS);

  try {
    return await fetchFn(url, {
      ...init,
      signal: controller.signal,
      credentials: 'include',
      redirect: 'follow',
    });
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export async function probeLinkedMedia(
  url: string,
  fetchFn: typeof fetch = fetch,
): Promise<LinkedMediaCandidate | null> {
  if (isIgnoredLinkedAsset(url)) {
    return null;
  }

  const responses: Response[] = [];

  try {
    responses.push(await fetchWithTimeout(fetchFn, url, {method: 'HEAD'}));
  } catch {
    responses.push(null as unknown as Response);
  }

  const headResponse = responses[0];
  const headType = getMediaTypeFromContentType(headResponse?.headers?.get('Content-Type') || null);
  if (headType) {
    return {
      src: headResponse.url || url,
      type: headType,
      poster: null,
      sourceUrl: window.location.href,
    };
  }

  try {
    const getResponse = await fetchWithTimeout(fetchFn, url, {
      method: 'GET',
      headers: {Range: 'bytes=0-0'},
    });
    const getType = getMediaTypeFromContentType(getResponse.headers.get('Content-Type'));
    if (!getType) {
      return null;
    }
    return {
      src: getResponse.url || url,
      type: getType,
      poster: null,
      sourceUrl: window.location.href,
    };
  } catch {
    return null;
  }
}

async function runLimited<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  let index = 0;

  async function runWorker() {
    while (index < items.length) {
      const item = items[index];
      index += 1;
      results.push(await worker(item));
    }
  }

  await Promise.all(Array.from({length: Math.min(limit, items.length)}, runWorker));
  return results;
}

export async function findLinkedMedia(
  documentRef: Document = document,
  fetchFn: typeof fetch = fetch,
): Promise<LinkedMediaCandidate[]> {
  const directCandidates = collectLinkedMediaCandidates(documentRef);
  const seen = new Set(directCandidates.map(candidate => candidate.src));
  const ambiguousLinks = Array.from(documentRef.querySelectorAll<HTMLAnchorElement>('a[href]'))
    .map(anchor => normalizeLinkedUrl(anchor.getAttribute('href') || ''))
    .filter((url): url is string => !!url && !seen.has(url))
    .slice(0, MAX_LINKED_MEDIA_CANDIDATES);

  const probed = await runLimited(ambiguousLinks, LINKED_MEDIA_CONCURRENCY, url => probeLinkedMedia(url, fetchFn));
  return [...directCandidates, ...probed.filter((candidate): candidate is LinkedMediaCandidate => !!candidate)];
}
```

- [ ] **Step 4: Run tests and build**

Run:

```bash
cd extension
npm test -- linked-media-scanner.test.ts
npm run build
```

Expected: tests pass and webpack build completes.

- [ ] **Step 5: Commit**

```bash
git add extension/src/content-script/linked-media-scanner.ts extension/src/content-script/linked-media-scanner.test.ts
git commit -m "feat: probe ambiguous links for media files"
```

---

### Task 4: Shallow HTML Metadata Scan

**Files:**
- Modify: `extension/src/content-script/linked-media-scanner.ts`
- Test: `extension/src/content-script/linked-media-scanner.test.ts`

**Interfaces:**
- Produces: `extractMediaFromLinkedHtml(html: string, pageUrl: string): LinkedMediaCandidate[]`
- Consumes: `normalizeLinkedUrl(rawUrl: string, baseUrl?: string): string | null`

- [ ] **Step 1: Add failing HTML extraction tests**

Append to `linked-media-scanner.test.ts`:

```ts
it('extracts media from linked HTML metadata and media tags', () => {
  const results = extractMediaFromLinkedHtml(`
    <html>
      <head>
        <meta property="og:image" content="/preview.jpg">
        <meta property="og:video" content="https://cdn.example.com/trailer.mp4">
      </head>
      <body>
        <video poster="/poster.webp"><source src="/movie.webm"></video>
        <a download href="/album.zip">Not media by extension</a>
      </body>
    </html>
  `, 'https://example.com/posts/1');

  expect(results).toEqual([
    {
      src: 'https://example.com/preview.jpg',
      type: ItemTypeEnum.IMAGE,
      poster: null,
      sourceUrl: 'https://example.com/posts/1',
      label: 'og:image',
    },
    {
      src: 'https://cdn.example.com/trailer.mp4',
      type: ItemTypeEnum.VIDEO,
      poster: null,
      sourceUrl: 'https://example.com/posts/1',
      label: 'og:video',
    },
    {
      src: 'https://example.com/movie.webm',
      type: ItemTypeEnum.VIDEO,
      poster: 'https://example.com/poster.webp',
      sourceUrl: 'https://example.com/posts/1',
      label: 'video source',
    },
  ]);
});
```

- [ ] **Step 2: Run tests and confirm failure**

Run:

```bash
cd extension
npm test -- linked-media-scanner.test.ts
```

Expected: fail because `extractMediaFromLinkedHtml` does not exist.

- [ ] **Step 3: Implement shallow HTML extraction**

Add to `linked-media-scanner.ts`:

```ts
export function extractMediaFromLinkedHtml(html: string, pageUrl: string): LinkedMediaCandidate[] {
  const parser = new DOMParser();
  const parsedDoc = parser.parseFromString(html, 'text/html');
  const candidates: LinkedMediaCandidate[] = [];

  const addCandidate = (rawUrl: string | null, label: string, poster: string | null = null) => {
    if (!rawUrl) {
      return;
    }
    const src = normalizeLinkedUrl(rawUrl, pageUrl);
    if (!src) {
      return;
    }
    const type = getMediaTypeFromUrl(src);
    if (!type) {
      return;
    }
    candidates.push({
      src,
      type,
      poster: poster ? normalizeLinkedUrl(poster, pageUrl) : null,
      sourceUrl: pageUrl,
      label,
    });
  };

  parsedDoc.querySelectorAll<HTMLMetaElement>('meta[property="og:image"], meta[name="twitter:image"]').forEach(meta => {
    addCandidate(meta.content, meta.getAttribute('property') || meta.getAttribute('name') || 'image metadata');
  });

  parsedDoc.querySelectorAll<HTMLMetaElement>('meta[property="og:video"], meta[property="og:video:url"], meta[property="og:audio"]').forEach(meta => {
    addCandidate(meta.content, meta.getAttribute('property') || 'media metadata');
  });

  parsedDoc.querySelectorAll<HTMLImageElement>('img[src]').forEach(img => {
    addCandidate(img.getAttribute('src'), 'linked image');
  });

  parsedDoc.querySelectorAll<HTMLVideoElement>('video').forEach(video => {
    const poster = video.getAttribute('poster');
    addCandidate(video.getAttribute('src'), 'linked video', poster);
    video.querySelectorAll<HTMLSourceElement>('source[src]').forEach(source => {
      addCandidate(source.getAttribute('src'), 'video source', poster);
    });
  });

  parsedDoc.querySelectorAll<HTMLAudioElement>('audio').forEach(audio => {
    addCandidate(audio.getAttribute('src'), 'linked audio');
    audio.querySelectorAll<HTMLSourceElement>('source[src]').forEach(source => {
      addCandidate(source.getAttribute('src'), 'audio source');
    });
  });

  const seen = new Set<string>();
  return candidates.filter(candidate => {
    if (seen.has(candidate.src)) {
      return false;
    }
    seen.add(candidate.src);
    return true;
  });
}
```

- [ ] **Step 4: Wire HTML extraction into probing**

In `probeLinkedMedia`, after a `HEAD` response that returns `text/html`, do not classify it as media. In `findLinkedMedia`, add a second shallow pass for HTML links only:

```ts
async function probeLinkedHtml(
  url: string,
  fetchFn: typeof fetch = fetch,
): Promise<LinkedMediaCandidate[]> {
  try {
    const response = await fetchWithTimeout(fetchFn, url, {method: 'GET'});
    const contentType = response.headers.get('Content-Type');
    if (!contentType?.toLowerCase().includes('text/html')) {
      return [];
    }
    const html = await response.text();
    return extractMediaFromLinkedHtml(html, response.url || url);
  } catch {
    return [];
  }
}
```

Call `probeLinkedHtml` only for ambiguous links after `probeLinkedMedia` returns `null`, and preserve the global 80-link cap.

- [ ] **Step 5: Run tests and build**

Run:

```bash
cd extension
npm test -- linked-media-scanner.test.ts
npm run build
```

Expected: tests pass and webpack build completes.

- [ ] **Step 6: Commit**

```bash
git add extension/src/content-script/linked-media-scanner.ts extension/src/content-script/linked-media-scanner.test.ts
git commit -m "feat: scan linked pages for media metadata"
```

---

### Task 5: Integrate Linked Media with Current Gather Flow

**Files:**
- Modify: `extension/src/content-script/send_media/send_media.ts`
- Modify: `extension/src/content-script/send_media/send-media-mappers-fn.ts`
- Modify: `extension/src/types/media-in-tabs.type.ts`

**Interfaces:**
- Consumes: `findLinkedMedia(documentRef?: Document, fetchFn?: typeof fetch): Promise<LinkedMediaCandidate[]>`
- Produces: `MediaItem.sourceKind?: 'embedded' | 'linked'`

- [ ] **Step 1: Add source metadata to type**

Modify `extension/src/types/media-in-tabs.type.ts`:

```ts
export type MediaItemSourceKind = 'embedded' | 'linked';

export type MediaItem = {
  display: boolean;
  order: number;
  tabId: number;
  tabUuid: string;
  itemIndex: string;
  uuid: string;
  src: string;
  extension: NullableString;
  type: ItemTypeEnum;
  selected: boolean;
  poster: NullableString;
  sourceKind?: MediaItemSourceKind;
  sourceUrl?: string;
  label?: string;
  properties: MediaItemProperties;
}
```

- [ ] **Step 2: Preserve optional metadata in mapper**

Modify `mapToFinalResultItem` in `send-media-mappers-fn.ts`:

```ts
    poster: item.poster ? relativeUrlToAbsolute(item.poster) : null,
    sourceKind: item.sourceKind,
    sourceUrl: item.sourceUrl,
    label: item.label,
```

- [ ] **Step 3: Wire scanner into `gatherMedia`**

Modify imports in `send_media.ts`:

```ts
import {findLinkedMedia} from '../linked-media-scanner';
```

Modify `gatherMedia` after embedded media extraction:

```ts
      const linkedMedia = await findLinkedMedia();
      const linkedImages = linkedMedia
        .filter(item => item.type === ItemTypeEnum.IMAGE)
        .map(item => ({...item, sourceKind: 'linked'}));
      const linkedVideos = linkedMedia
        .filter(item => item.type === ItemTypeEnum.VIDEO)
        .map(item => ({...item, sourceKind: 'linked'}));
      const linkedAudios = linkedMedia
        .filter(item => item.type === ItemTypeEnum.AUDIO)
        .map(item => ({...item, sourceKind: 'linked'}));

      images = await mapToFinalResultArray([...imagesFromTags, ...imagesFromStyles, ...linkedImages], ItemTypeEnum.IMAGE);
      videos = await mapToFinalResultArray([...videosFromTags, ...linkedVideos], ItemTypeEnum.VIDEO);
      audios = await mapToFinalResultArray([...audiosFromTags, ...linkedAudios], ItemTypeEnum.AUDIO);
```

Remove the earlier assignments that mapped only embedded images/videos/audios.

- [ ] **Step 4: Avoid hanging metadata loads**

In `send_media.ts`, add error fallback events for image/video/audio metadata loading so linked files that reject metadata still appear:

```ts
      imgEl.addEventListener('error', () => {
        img.order = index;
        imgEl.remove();
        sendMedia([img], jobHash);
      });
```

Add equivalent `error` listeners for `videoEl` and `audioEl`.

- [ ] **Step 5: Run build**

Run:

```bash
cd extension
npm run build
```

Expected: webpack build completes.

- [ ] **Step 6: Manual extension test**

Load the unpacked extension from `extension/` in Chrome, open a local or hosted fixture page with these links:

```html
<a href="https://example.com/media/photo.jpg">direct image</a>
<a href="https://example.com/media/video.mp4">direct video</a>
<a href="https://example.com/download?id=123">ambiguous file link returning image/jpeg</a>
```

Open the extension side panel or popup. Expected: the direct linked image/video and any CORS-readable ambiguous media link appear alongside embedded media.

- [ ] **Step 7: Commit**

```bash
git add extension/src/content-script/send_media/send_media.ts extension/src/content-script/send_media/send-media-mappers-fn.ts extension/src/types/media-in-tabs.type.ts extension/dist
git commit -m "feat: include linked media in scan results"
```

---

### Task 6: UI Distinction and User-Facing Copy

**Files:**
- Inspect and modify: `extension/src/downloader/accordion/grid-item.ts`
- Inspect and modify: `extension/src/downloader/accordion/accordion-item.ts`
- Inspect and modify: `extension/css/downloader/accordion/grid.css`
- Inspect and modify: `extension/css/downloader/accordion/accordion-item.css`
- Modify: `README.md`
- Modify: `extension/manifest.json`

**Interfaces:**
- Consumes: `MediaItem.sourceKind?: 'embedded' | 'linked'`
- Produces: visible linked-source badge or secondary line in media item UI.

- [ ] **Step 1: Inspect current rendering path**

Run:

```bash
sed -n '1,260p' extension/src/downloader/accordion/grid-item.ts
sed -n '1,260p' extension/src/downloader/accordion/accordion-item.ts
```

Identify where `MediaItem` fields are rendered.

- [ ] **Step 2: Add linked-media badge**

Where a grid/list item renders media metadata, add this conditional:

```ts
if (item.sourceKind === 'linked') {
  const badge = createElement('span');
  badge.classList.add('media-source-badge', 'media-source-badge-linked');
  badge.textContent = 'Linked';
  container.appendChild(badge);
}
```

Use the repo's actual element helper names from the inspected files.

- [ ] **Step 3: Add restrained CSS**

Add CSS in the relevant accordion stylesheet:

```css
.media-source-badge {
  align-items: center;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  display: inline-flex;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  padding: 3px 5px;
}

.media-source-badge-linked {
  background: var(--surface-secondary);
  color: var(--text-secondary);
}
```

If those CSS variables do not exist, use the closest existing theme variables from `extension/css/themes.css`.

- [ ] **Step 4: Update README capability wording**

Change the feature description to avoid overpromising:

```md
Media Downloader finds embedded images, video, and audio on the current page. It can also detect many directly linked media files and CORS-readable linked pages with standard media metadata.
```

Add a limitation note:

```md
The extension does not bypass paywalls, login requirements, DRM, or private file permissions. Some sites intentionally hide or stream media in ways that browser extensions cannot expose as a single downloadable file.
```

- [ ] **Step 5: Update manifest description**

Modify `extension/manifest.json` description:

```json
"description": "Browse and download embedded and linked images, video and audio on a web page."
```

- [ ] **Step 6: Build and manually inspect UI**

Run:

```bash
cd extension
npm run build
```

Load the extension and verify that linked results are visibly distinguishable and still downloadable.

- [ ] **Step 7: Commit**

```bash
git add README.md extension/manifest.json extension/src/downloader/accordion extension/css/downloader/accordion extension/dist
git commit -m "feat: label linked media results"
```

---

### Task 7: Optional Loaded Resource Scan

**Files:**
- Create: `extension/src/content-script/performance-media-scanner.ts`
- Modify: `extension/src/content-script/send_media/send_media.ts`
- Test: `extension/src/content-script/performance-media-scanner.test.ts`

**Interfaces:**
- Consumes: `getMediaTypeFromUrl(url: string): ItemTypeEnum | null`
- Produces: `findLoadedMediaResources(performanceRef?: Performance): LinkedMediaCandidate[]`

- [ ] **Step 1: Write failing resource-entry test**

Create `extension/src/content-script/performance-media-scanner.test.ts`:

```ts
import {describe, expect, it} from 'vitest';
import {ItemTypeEnum} from '../types/media-in-tabs.type';
import {findLoadedMediaResources} from './performance-media-scanner';

describe('performance media scanner', () => {
  it('detects loaded media resources by URL', () => {
    const performanceRef = {
      getEntriesByType: () => [
        {name: 'https://cdn.example.com/image.webp', initiatorType: 'img'},
        {name: 'https://cdn.example.com/player.js', initiatorType: 'script'},
        {name: 'https://cdn.example.com/movie.mp4?token=abc', initiatorType: 'video'},
      ],
    } as unknown as Performance;

    expect(findLoadedMediaResources(performanceRef)).toEqual([
      {
        src: 'https://cdn.example.com/image.webp',
        type: ItemTypeEnum.IMAGE,
        poster: null,
        sourceUrl: window.location.href,
        label: 'loaded resource',
      },
      {
        src: 'https://cdn.example.com/movie.mp4?token=abc',
        type: ItemTypeEnum.VIDEO,
        poster: null,
        sourceUrl: window.location.href,
        label: 'loaded resource',
      },
    ]);
  });
});
```

- [ ] **Step 2: Implement loaded resource scanner**

Create `extension/src/content-script/performance-media-scanner.ts`:

```ts
import {ItemTypeEnum} from '../types/media-in-tabs.type';
import {getMediaTypeFromUrl, isIgnoredLinkedAsset} from './filters-fn';
import {LinkedMediaCandidate} from './linked-media-types';

export function findLoadedMediaResources(performanceRef: Performance = performance): LinkedMediaCandidate[] {
  const seen = new Set<string>();
  return performanceRef.getEntriesByType('resource')
    .map(entry => entry.name)
    .filter(url => !isIgnoredLinkedAsset(url))
    .map(url => ({src: url, type: getMediaTypeFromUrl(url)}))
    .filter((item): item is {src: string; type: ItemTypeEnum} => !!item.type)
    .filter(item => {
      if (seen.has(item.src)) {
        return false;
      }
      seen.add(item.src);
      return true;
    })
    .map(item => ({
      src: item.src,
      type: item.type,
      poster: null,
      sourceUrl: window.location.href,
      label: 'loaded resource',
    }));
}
```

- [ ] **Step 3: Integrate with gather flow**

In `send_media.ts`, import and merge resource results:

```ts
import {findLoadedMediaResources} from '../performance-media-scanner';
```

Inside `gatherMedia`:

```ts
      const loadedMedia = findLoadedMediaResources().map(item => ({...item, sourceKind: 'linked'}));
```

Merge `loadedMedia` into the same image/video/audio buckets used for linked media.

- [ ] **Step 4: Run tests and build**

Run:

```bash
cd extension
npm test -- performance-media-scanner.test.ts
npm run build
```

Expected: tests pass and webpack build completes.

- [ ] **Step 5: Commit**

```bash
git add extension/src/content-script/performance-media-scanner.ts extension/src/content-script/performance-media-scanner.test.ts extension/src/content-script/send_media/send_media.ts extension/dist
git commit -m "feat: include loaded media resources"
```

---

### Task 8: Final Verification and Store-Ready Response

**Files:**
- Modify: `README.md`
- Create: `docs/linked-media-test-fixture.html`

**Interfaces:**
- Produces: a repeatable manual test fixture and concise public response to the review.

- [ ] **Step 1: Add manual fixture**

Create `docs/linked-media-test-fixture.html`:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Linked Media Fixture</title>
</head>
<body>
  <h1>Linked Media Fixture</h1>
  <img src="images/logo.png" alt="Embedded image">
  <a href="images/logo.png">Linked image</a>
  <a href="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4">Linked video</a>
  <video controls src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"></video>
</body>
</html>
```

- [ ] **Step 2: Run full verification**

Run:

```bash
cd extension
npm test
npm run build
```

Expected: all tests pass and webpack build completes.

- [ ] **Step 3: Manual verify in Chrome**

Open `docs/linked-media-test-fixture.html`, load the unpacked extension from `extension/`, and verify:

- embedded image appears
- direct linked image appears
- linked video appears
- linked results have the `Linked` marker
- download action works for a linked item
- no errors are visible in the extension service worker console

- [ ] **Step 4: Draft store-review reply**

Use this response, adjusted to the actual released version:

```text
Thanks for the blunt feedback. You were right that the previous version focused mostly on media embedded directly on the current page. I have added linked media detection so the extension can now find many direct file links and CORS-readable linked pages with standard media metadata, while still respecting paywalls, login requirements, DRM, and site permissions.
```

- [ ] **Step 5: Commit**

```bash
git add README.md docs/linked-media-test-fixture.html extension/dist
git commit -m "docs: add linked media verification notes"
```

---

## Execution Notes

- Task 7 is optional and should be implemented after Tasks 1-6 if the first linked-file release still misses too many modern JS-loaded resources.
- If adding Vitest/jsdom is not desired, replace unit-test steps with `npm run build` and manual fixture testing, but keep the pure helper functions so tests can be added later.
- If CORS blocks probing for a site, that is expected browser behavior. The extension should silently skip blocked links instead of reporting false errors.
- If the scan feels slow, reduce `MAX_LINKED_MEDIA_CANDIDATES` from 80 to 40 before adding new permissions.
