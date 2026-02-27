'use client';

import { useState, useEffect } from 'react';
import { signIn, getCsrfToken } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { SiweLoginButton } from '@/components/siwe-login-button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    // Get CSRF token
    getCsrfToken().then(token => {
      if (token) setCsrfToken(token);
    });
  }, []);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('email-name', {
        email,
        name,
        redirect: false,
        callbackUrl: '/onboarding'
      });

      if (result?.error) {
        toast.error('Login failed: ' + result.error);
      } else if (result?.ok) {
        toast.success('Welcome to eth.ed!');
        setTimeout(() => {
          window.location.href = '/onboarding';
        }, 500);
      } else {
        toast.error('Login failed. Please try again.');
      }
    } catch {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/40 backdrop-blur-xl border border-white/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
            Welcome to eth.ed
          </CardTitle>
          <CardDescription className="text-slate-300">
            Sign in to start your Web3 learning journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* SIWE Login Button */}
            <SiweLoginButton />
            
            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-800/40 text-slate-400">Or</span>
              </div>
            </div>

            {/* Email Login Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign In with Email'
                )}
              </Button>
            </form>
          </div>
          
          <div className="mt-6 text-center">
            {csrfToken && (
              <p className="text-xs text-slate-500 mt-2">
                CSRF Token: {csrfToken.substring(0, 10)}...
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}