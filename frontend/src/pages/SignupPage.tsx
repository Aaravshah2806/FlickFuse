import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const { signUp, isConfigured } = useAuth();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupForm) => {
    if (!isConfigured) {
      setError('Authentication is not configured. Please set up Supabase in .env file.');
      return;
    }
    try {
      setError(null);
      const result = await signUp(data.email, data.password);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.message);
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Failed to create account. Please try again.');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-[#10B981] rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="mt-6 text-center text-3xl font-bold text-gray-900">Check your email!</h1>
          <p className="mt-4 text-center text-gray-600">
            We've sent a verification link to your email. Please click the link to activate your account.
          </p>
          <div className="mt-6 text-center">
            <Link to="/login" className="text-[#2563EB] hover:text-[#1E40AF] font-medium">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-[#2563EB] rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
        </div>
        <h1 className="mt-6 text-center text-3xl font-bold text-gray-900">Create your account</h1>
        <p className="mt-2 text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-[#2563EB] hover:text-[#1E40AF] font-medium">
            Sign in
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
              placeholder="Create a password"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              Create Account
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
