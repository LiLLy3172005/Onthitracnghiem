export const resolveFileUrl = (url?: string): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) return url;
  return http://127.0.0.1:8000;
};

export default resolveFileUrl;
