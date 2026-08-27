export const getMediaUrl = (url) => {
  if (!url) return '';
  // If it's already an absolute URL, return as is
  if (url.startsWith('http')) return url;
  // If it doesn't start with /api, return as is (could be a local asset or blob)
  if (!url.startsWith('/api')) return url;

  // baseUrl might be '/api' (local) or 'https://backend.com/api' (prod)
  let baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
  
  // If baseUrl ends with '/api' and url starts with '/api', we slice off '/api' from baseUrl
  // so we don't get 'https://backend.com/api/api/media/...'
  if (baseUrl.endsWith('/api')) {
    baseUrl = baseUrl.slice(0, -4);
  }
  
  return `${baseUrl}${url}`;
};
