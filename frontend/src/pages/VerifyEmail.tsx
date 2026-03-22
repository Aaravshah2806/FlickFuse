import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const { user } = useAuth();

  const type = searchParams.get('type');
  const computedMessage = user 
    ? type === 'signup' 
      ? 'Your email has been verified! You can now log in.'
      : type === 'email_change'
        ? 'Your email has been updated successfully!'
        : 'Email verification confirmed!'
    : 'Please wait while we verify your email.';

  const resendVerification = async () => {
    if (user?.email) {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      });
      if (error) {
        setStatus('error');
        setMessage(error.message);
      } else {
        setMessage('Verification email resent! Check your inbox.');
      }
    }
  };

  const displayStatus = status === 'loading' && user ? 'success' : status;
  const displayMessage = status === 'loading' && user ? computedMessage : message;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        {displayStatus === 'loading' ? (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#2563EB] border-t-transparent mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying...</h2>
            <p className="text-gray-600">Please wait while we verify your email.</p>
          </>
        ) : displayStatus === 'success' ? (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Email Verified!</h2>
            <p className="text-gray-600 mb-6">{displayMessage}</p>
            <Link to="/login">
              <Button>Go to Login</Button>
            </Link>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{displayMessage}</p>
            <Button onClick={resendVerification} variant="secondary">
              Resend Verification Email
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
