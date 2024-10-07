import {NullableString} from '../types/common.type';

export function relativeUrlToAbsolute(url: NullableString): NullableString {
  if (url === null) {
    return null;
  }
  return url.startsWith('/') ? `${window.location.origin}${url}` : url;
}

export function mapToFullInfo(
  src: string = '',
  altOrElement: Element | NullableString = null,
  poster: NullableString | undefined = undefined,
) {
  const info: any = {src, poster: null};

  if (poster !== undefined) {
    info.poster = poster;
  }

  return info;
}

