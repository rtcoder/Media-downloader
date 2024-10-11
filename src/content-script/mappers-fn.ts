import {NullableString} from '../types/common.type';

export function relativeUrlToAbsolute(url: NullableString): NullableString {
  if (url === null) {
    return null;
  }
  return url.startsWith('/') ? `${window.location.origin}${url}` : url;
}

export function mapToFullInfo(src: string = '', poster: NullableString = null) {
  return {src, poster};
}

