'use client';

import { AuthProvider } from '@/context/AuthContext';
import ProtectedShell from './ProtectedShell';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProtectedShell>{children}</ProtectedShell>
    </AuthProvider>
  );
}