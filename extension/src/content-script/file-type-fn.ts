import {NullableString} from '../types/common.type';

function getFileTypeFromBase64(base64String: string) {
  const match = base64String.match(/^data:(.+);base64,/);
  const ext = match ? match[1].split('/')[1] : null;
  if (ext?.startsWith('svg+xml')) {
    return 'svg';
  }
  return ext;
}

function getFileTypeFromUrl(url: string) {
  let lastUrlSegment = url.split('/').pop();
  if (!lastUrlSegment || !lastUrlSegment.includes('.')) {
    return null;
  }
  lastUrlSegment = lastUrlSegment.split('?')[0];
  const lastAfterDot = lastUrlSegment.split('.').pop();
  if (!lastAfterDot) {
    return null;
  }
  return lastAfterDot.toLowerCase().split('?')[0];
}

async function getFileTypeFromUrlHeaders(url: string) {
  try {
    const response = await fetch(url, {method: 'HEAD', referrer: window.location.origin});
    const contentType = response.headers.get('Content-Type');

    if (contentType) {
      const type = contentType.split('/')[1];
      if (type.startsWith('svg+xml')) {
        return 'svg';
      }
    }
  } catch (error) {
    return 'png';
  }
  return null;
}

export async function getFileType(urlOrBase64: NullableString) {
  if (urlOrBase64 === null) {
    return null;
  }
  const base64Pattern = /^data:(.+);base64,/;
  let filetype: NullableString;

  if (base64Pattern.test(urlOrBase64)) {
    filetype = getFileTypeFromBase64(urlOrBase64);
  } else {
    const extension = getFileTypeFromUrl(urlOrBase64);
    if (extension) {
      filetype = extension;
    } else {
      try {
        filetype = await getFileTypeFromUrlHeaders(urlOrBase64);
      } catch (e) {
        filetype = 'png';
      }
    }
  }

  return filetype || 'png';
}
