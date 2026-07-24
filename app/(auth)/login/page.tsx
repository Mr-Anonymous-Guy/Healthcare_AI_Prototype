import LoginForm from '@/components/auth/LoginForm';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-500">Loading form...</div>}>
      <LoginForm />
    </Suspense>
  );
}
