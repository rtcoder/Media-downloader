import {ItemTypeEnum} from '../types/media-in-tabs.type';
import {
  getMediaTypeFromContentType,
  getMediaTypeFromUrl,
  isIgnoredLinkedAsset,
} from './filters-fn';
import {LinkedMediaCandidate} from './linked-media-types';

const MAX_LINKED_MEDIA_CANDIDATES = 80;
const LINKED_MEDIA_TIMEOUT_MS = 3500;
const LINKED_MEDIA_CONCURRENCY = 6;

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

function toLinkedCandidate(
  src: string,
  type: ItemTypeEnum,
  sourceUrl: string,
  label?: string,
  poster: string | null = null,
): LinkedMediaCandidate {
  return {
    src,
    type,
    poster,
    sourceKind: 'linked',
    sourceUrl,
    label,
  };
}

export function collectLinkedMediaCandidates(
  documentRef: Document = document,
  pageUrl: string = window.location.href,
): LinkedMediaCandidate[] {
  const anchors = Array.from(documentRef.querySelectorAll<HTMLAnchorElement>('a[href]'));
  const seen = new Set<string>();
  const candidates: LinkedMediaCandidate[] = [];

  for (const anchor of anchors) {
    if (candidates.length >= MAX_LINKED_MEDIA_CANDIDATES) {
      break;
    }

    const src = normalizeLinkedUrl(anchor.getAttribute('href') || '', pageUrl);
    if (!src || seen.has(src)) {
      continue;
    }

    const type = getMediaTypeFromUrl(src);
    if (!type) {
      continue;
    }

    seen.add(src);
    candidates.push(toLinkedCandidate(
      src,
      type,
      pageUrl,
      anchor.textContent?.trim() || anchor.getAttribute('download') || undefined,
    ));
  }

  return candidates;
}

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
  pageUrl: string = window.location.href,
  fetchFn: typeof fetch = fetch,
): Promise<LinkedMediaCandidate | null> {
  if (isIgnoredLinkedAsset(url)) {
    return null;
  }

  try {
    const headResponse = await fetchWithTimeout(fetchFn, url, {method: 'HEAD'});
    const headType = getMediaTypeFromContentType(headResponse.headers.get('Content-Type'));
    if (headType) {
      return toLinkedCandidate(headResponse.url || url, headType, pageUrl);
    }
  } catch {
    // Some servers block HEAD; try a tiny ranged GET below.
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
    return toLinkedCandidate(getResponse.url || url, getType, pageUrl);
  } catch {
    return null;
  }
}

export function extractMediaFromLinkedHtml(html: string, pageUrl: string): LinkedMediaCandidate[] {
  const parsedDoc = new DOMParser().parseFromString(html, 'text/html');
  const candidates: LinkedMediaCandidate[] = [];

  const addCandidate = (
    rawUrl: string | null,
    label: string,
    poster: string | null = null,
  ) => {
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
    candidates.push(toLinkedCandidate(
      src,
      type,
      pageUrl,
      label,
      poster ? normalizeLinkedUrl(poster, pageUrl) : null,
    ));
  };

  parsedDoc
    .querySelectorAll<HTMLMetaElement>('meta[property="og:image"], meta[name="twitter:image"]')
    .forEach(meta => addCandidate(
      meta.content,
      meta.getAttribute('property') || meta.getAttribute('name') || 'image metadata',
    ));

  parsedDoc
    .querySelectorAll<HTMLMetaElement>('meta[property="og:video"], meta[property="og:video:url"], meta[property="og:audio"]')
    .forEach(meta => addCandidate(meta.content, meta.getAttribute('property') || 'media metadata'));

  parsedDoc
    .querySelectorAll<HTMLImageElement>('img[src]')
    .forEach(img => addCandidate(img.getAttribute('src'), 'linked image'));

  parsedDoc.querySelectorAll<HTMLVideoElement>('video').forEach(video => {
    const poster = video.getAttribute('poster');
    addCandidate(video.getAttribute('src'), 'linked video', poster);
    video
      .querySelectorAll<HTMLSourceElement>('source[src]')
      .forEach(source => addCandidate(source.getAttribute('src'), 'video source', poster));
  });

  parsedDoc.querySelectorAll<HTMLAudioElement>('audio').forEach(audio => {
    addCandidate(audio.getAttribute('src'), 'linked audio');
    audio
      .querySelectorAll<HTMLSourceElement>('source[src]')
      .forEach(source => addCandidate(source.getAttribute('src'), 'audio source'));
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
  pageUrl: string = window.location.href,
  fetchFn: typeof fetch = fetch,
): Promise<LinkedMediaCandidate[]> {
  const directCandidates = collectLinkedMediaCandidates(documentRef, pageUrl);
  const seen = new Set(directCandidates.map(candidate => candidate.src));
  const ambiguousLinks = Array.from(documentRef.querySelectorAll<HTMLAnchorElement>('a[href]'))
    .map(anchor => normalizeLinkedUrl(anchor.getAttribute('href') || '', pageUrl))
    .filter((url): url is string => !!url && !seen.has(url))
    .slice(0, MAX_LINKED_MEDIA_CANDIDATES);

  const probed = await runLimited(ambiguousLinks, LINKED_MEDIA_CONCURRENCY, async url => {
    const media = await probeLinkedMedia(url, pageUrl, fetchFn);
    if (media) {
      return [media];
    }
    return probeLinkedHtml(url, fetchFn);
  });

  const allCandidates = [...directCandidates, ...probed.flat()];
  const allSeen = new Set<string>();
  return allCandidates.filter(candidate => {
    if (allSeen.has(candidate.src)) {
      return false;
    }
    allSeen.add(candidate.src);
    return true;
  });
}
