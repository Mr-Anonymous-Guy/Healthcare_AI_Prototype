'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput, magicLinkSchema, MagicLinkInput } from '@/lib/validations/auth';
import { signInWithPasswordAction, signInWithMagicLinkAction } from '@/lib/auth/actions';
import { toast } from 'sonner';
import Link from 'next/link';
import { Loader2, LogIn, Mail, Lock } from 'lucide-react';

export default function LoginForm() {
  const [tab, setTab] = useState<'password' | 'magic-link'>('password');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/dashboard';

  const passwordForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const magicLinkForm = useForm<MagicLinkInput>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: {
      email: '',
    },
  });

  const onPasswordSubmit = (data: LoginInput) => {
    startTransition(async () => {
      const res = await signInWithPasswordAction(data);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success('Signed in successfully!');
        router.push(next);
        router.refresh();
      }
    });
  };

  const onMagicLinkSubmit = (data: MagicLinkInput) => {
    startTransition(async () => {
      const res = await signInWithMagicLinkAction(data.email);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(res.message || 'Magic link sent! Check your inbox.');
      }
    });
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-slate-100/80 backdrop-blur-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome Back</h2>
        <p className="text-xs md:text-sm text-slate-500 mt-1">Sign in to your HealthAI account</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
        <button
          type="button"
          onClick={() => setTab('password')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg text-center transition-all ${
            tab === 'password'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Password Login
        </button>
        <button
          type="button"
          onClick={() => setTab('magic-link')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg text-center transition-all ${
            tab === 'magic-link'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Magic Link
        </button>
      </div>

      {tab === 'password' ? (
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
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
                {...passwordForm.register('email')}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white text-sm transition-all"
              />
            </div>
            {passwordForm.formState.errors.email && (
              <p className="text-xs text-rose-500 mt-1 font-medium">
                {passwordForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                suppressHydrationWarning
                type="password"
                placeholder="••••••••"
                {...passwordForm.register('password')}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white text-sm transition-all"
              />
            </div>
            {passwordForm.formState.errors.password && (
              <p className="text-xs text-rose-500 mt-1 font-medium">
                {passwordForm.formState.errors.password.message}
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
                <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" /> Sign In
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={magicLinkForm.handleSubmit(onMagicLinkSubmit)} className="space-y-4">
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
                {...magicLinkForm.register('email')}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white text-sm transition-all"
              />
            </div>
            {magicLinkForm.formState.errors.email && (
              <p className="text-xs text-rose-500 mt-1 font-medium">
                {magicLinkForm.formState.errors.email.message}
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
                <Loader2 className="w-4 h-4 animate-spin" /> Sending Link...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" /> Send Magic Link
              </>
            )}
          </button>
        </form>
      )}

      <div className="mt-6 text-center text-xs text-slate-500 font-medium">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-blue-600 font-bold hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  );
}
