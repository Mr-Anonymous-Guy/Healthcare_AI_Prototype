'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, ResetPasswordInput } from '@/lib/validations/auth';
import { resetPasswordAction } from '@/lib/auth/actions';
import { toast } from 'sonner';

export default function ResetPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: ResetPasswordInput) => {
    startTransition(async () => {
      const res = await resetPasswordAction(data.password);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message || 'Password updated successfully!');
        router.push('/login');
      }
    });
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md border border-gray-100">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Set New Password</h2>
        <p className="text-sm text-gray-500 mt-1">
          Enter your new password below
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <input
            type="password"
            placeholder="••••••••"
            {...form.register('password')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          {form.formState.errors.password && (
            <p className="text-xs text-red-500 mt-1">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
          <input
            type="password"
            placeholder="••••••••"
            {...form.register('confirmPassword')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          {form.formState.errors.confirmPassword && (
            <p className="text-xs text-red-500 mt-1">
              {form.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Updating Password...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
