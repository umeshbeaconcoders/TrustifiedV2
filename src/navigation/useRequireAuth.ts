import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuthStore } from '../stores/auth';
import type { RootStackParamList } from './types';

/**
 * Protected-screen guard — RN equivalent of web's
 * `<Navigate to="/login" state={{from}} replace />` pattern in profile.tsx.
 * Redirects to Login (preserving where to return to) once the auth store
 * has hydrated and there's no user.
 */
export function useRequireAuth(redirectTo: keyof RootStackParamList) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (hydrated && !user) {
      navigation.reset({ index: 0, routes: [{ name: 'Login', params: { redirectTo } }] });
    }
  }, [hydrated, user, navigation, redirectTo]);

  return { isChecking: !hydrated, isAuthenticated: Boolean(user) };
}
