import { useMutation } from '@tanstack/react-query';
import { authRepository } from '@/app/repositories/authRepository';
import { useAuth } from '@/app/context/AuthContext';

export function useLogin() {
  const { setAuth } = useAuth();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authRepository.login(email, password),
    onSuccess: (data) => {
      setAuth(data.token, data.user);
    },
  });
}

export function useRegister() {
  const { setAuth } = useAuth();

  return useMutation({
    mutationFn: ({
      email,
      password,
      display_name,
    }: {
      email: string;
      password: string;
      display_name: string;
    }) => authRepository.register(email, password, display_name),
    onSuccess: (data) => {
      setAuth(data.token, data.user);
    },
  });
}
