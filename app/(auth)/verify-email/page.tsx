import Link from 'next/link';

export default function VerifyEmailPage() {
  return (
    <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md border border-gray-100 text-center">
      <div className="mx-auto w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 text-2xl font-bold">
        ✉️
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
      <p className="text-sm text-gray-600 mb-6">
        We&apos;ve sent a verification link to your email address. Please click the link to confirm your account and get started.
      </p>
      <div className="space-y-3">
        <Link
          href="/login"
          className="inline-block w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium text-sm hover:bg-blue-700 transition-colors"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
