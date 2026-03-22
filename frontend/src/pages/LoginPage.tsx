import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const { signIn, isConfigured } = useAuth();
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    if (!isConfigured) {
      setError('Authentication is not configured. Please set up Supabase in .env file.');
      return;
    }
    try {
      setError(null);
      await signIn(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-[#2563EB] rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
        </div>
        <h1 className="mt-6 text-center text-3xl font-bold text-gray-900">Welcome back</h1>
        <p className="mt-2 text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#2563EB] hover:text-[#1E40AF] font-medium">
            Sign up for free
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {!isConfigured && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-md p-4">
              <p className="text-sm text-amber-800">
                <strong>Setup Required:</strong> Supabase is not configured. Add your credentials to the <code className="bg-amber-100 px-1 rounded">.env</code> file to enable authentication.
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="h-4 w-4 text-[#2563EB] border-gray-300 rounded" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-[#2563EB] hover:text-[#1E40AF]">
                Forgot password?
              </a>
            </div>

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
