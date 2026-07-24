'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterInput } from '@/lib/validations/auth';
import { signUpAction } from '@/lib/auth/actions';
import { toast } from 'sonner';
import Link from 'next/link';
import { Loader2, UserPlus, User, Mail, Lock } from 'lucide-react';

export default function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (data: RegisterInput) => {
    startTransition(async () => {
      const res = await signUpAction({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
      });

      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message || 'Registration successful! Verification email sent.');
        router.push('/verify-email');
      }
    });
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-100/80 backdrop-blur-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create an Account</h2>
        <p className="text-xs md:text-sm text-slate-500 mt-1">Get started with HealthAI Assistant</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              suppressHydrationWarning
              type="text"
              placeholder="John Doe"
              {...form.register('fullName')}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white text-sm transition-all"
            />
          </div>
          {form.formState.errors.fullName && (
            <p className="text-xs text-rose-500 mt-1 font-medium">
              {form.formState.errors.fullName.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              suppressHydrationWarning
              type="email"
              placeholder="you@example.com"
              {...form.register('email')}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white text-sm transition-all"
            />
          </div>
          {form.formState.errors.email && (
            <p className="text-xs text-rose-500 mt-1 font-medium">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              suppressHydrationWarning
              type="password"
              placeholder="••••••••"
              {...form.register('password')}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white text-sm transition-all"
            />
          </div>
          {form.formState.errors.password && (
            <p className="text-xs text-rose-500 mt-1 font-medium">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              suppressHydrationWarning
              type="password"
              placeholder="••••••••"
              {...form.register('confirmPassword')}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white text-sm transition-all"
            />
          </div>
          {form.formState.errors.confirmPassword && (
            <p className="text-xs text-rose-500 mt-1 font-medium">
              {form.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full mt-2 bg-blue-600 text-white py-3 px-4 rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Creating Account...
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" /> Create Account
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-500 font-medium">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-600 font-bold hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
