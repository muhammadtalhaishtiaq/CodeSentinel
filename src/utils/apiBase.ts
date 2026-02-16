export const getApiBaseUrl = () => import.meta.env.VITE_API_URL || '';

export const buildApiUrl = (path: string) => {
  if (path.startsWith('http')) {
    return path;
  }

  return `${getApiBaseUrl()}${path}`;
};
