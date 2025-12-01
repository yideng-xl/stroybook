export const getAssetUrl = (path: string) => {
  const baseUrl = import.meta.env.VITE_STORY_BASE_URL || '';
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  // If baseUrl is set, prepend it. Otherwise relative.
  return `${baseUrl}${cleanPath}`;
};
