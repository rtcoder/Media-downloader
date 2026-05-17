const restrictedUrls = [
  'https://youtube.com',
  'https://www.youtube.com',
];

export function isRestrictedUrl(url: string): boolean {
  return restrictedUrls.some(restrictedUrl => url.includes(restrictedUrl));
}
