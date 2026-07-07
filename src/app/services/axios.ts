import axios from 'axios';

const API_BASE = 'http://localhost:3333/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('vinil_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('vinil_token');
      localStorage.removeItem('vinil_user');
      window.dispatchEvent(new Event('vinil:logout'));
    }
    return Promise.reject(error);
  }
);

export function getStreamUrl(trackId: string): string {
  const token = localStorage.getItem('vinil_token');
  // The backend redirects to a presigned S3 URL, but we need the auth header for the initial request.
  // For HTML5 Audio we'll fetch the redirect URL manually.
  return `${API_BASE}/tracks/${trackId}/stream`;
}
