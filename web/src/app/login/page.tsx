'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore, type UserRole } from '@/store/auth';
import { apiClient } from '@/lib/api-client';
import { Brain, Loader2, Users, Briefcase } from 'lucide-react';
import Link from 'next/link';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const selectedRole = useAuthStore((state) => state.selectedRole);

  const roleFromQuery = searchParams.get('role') as UserRole | null;
  const currentRole = roleFromQuery || selectedRole;

  const getDefaultCredentials = (role: UserRole | null) => {
    if (role === 'customer') {
      return { email: 'customer@example.com', password: 'customer123' };
    }
    return { email: 'admin@codersadda.com', password: 'admin123' };
  };

  const defaults = getDefaultCredentials(currentRole);
  const [email, setEmail] = useState(defaults.email);
  const [password, setPassword] = useState(defaults.password);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const creds = getDefaultCredentials(currentRole);
    setEmail(creds.email);
    setPassword(creds.password);
  }, [currentRole]);

  useEffect(() => {
    if (!currentRole) {
      router.push('/role-select');
    }
  }, [currentRole, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.login(email, password, currentRole!);
      login(response.user, response.token);

      if (response.user.role === 'customer') {
        router.push('/customer-dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <Brain className="w-10 h-10 text-blue-600" />
            <span className="text-3xl font-bold text-gray-900">Coders Adda</span>
          </Link>
          <div className="flex items-center justify-center gap-2 mb-3">
            {currentRole === 'customer' ? (
              <Users className="w-6 h-6 text-blue-600" />
            ) : (
              <Briefcase className="w-6 h-6 text-purple-600" />
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              {currentRole === 'customer' ? 'Customer Login' : 'Employee Login'}
            </h1>
          </div>
          <p className="text-gray-600">
            {currentRole === 'customer'
              ? 'Access your vehicle services and support'
              : 'Sign in to access the AI Agent Dashboard'}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="admin@codersadda.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className={`mt-6 p-4 rounded-lg border ${
            currentRole === 'customer'
              ? 'bg-blue-50 border-blue-200'
              : 'bg-purple-50 border-purple-200'
          }`}>
            <p className={`text-sm font-medium mb-2 ${
              currentRole === 'customer' ? 'text-blue-900' : 'text-purple-900'
            }`}>
              Demo Credentials:
            </p>
            <div className={`text-xs space-y-1 ${
              currentRole === 'customer' ? 'text-blue-700' : 'text-purple-700'
            }`}>
              {currentRole === 'customer' ? (
                <>
                  <p>Email: <span className="font-mono">customer@example.com</span></p>
                  <p>Password: <span className="font-mono">customer123</span></p>
                </>
              ) : (
                <>
                  <p>Email: <span className="font-mono">admin@codersadda.com</span></p>
                  <p>Password: <span className="font-mono">admin123</span></p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="text-center mt-6 space-y-2">
          <Link href="/role-select" className="text-sm text-gray-600 hover:text-gray-900 transition-colors block">
             Change Role
          </Link>
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors block">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
