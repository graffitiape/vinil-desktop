import { apiClient } from '@/app/services/axios';
import type { AuthResponse, User } from '@/app/types/api';

export const authRepository = {
  me: () => apiClient.get<User>('/auth/me').then((r) => r.data),

  login: (email: string, password: string) =>
    apiClient.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data),

  register: (email: string, password: string, display_name: string) =>
    apiClient
      .post<AuthResponse>('/auth/register', { email, password, display_name })
      .then((r) => r.data),
};
