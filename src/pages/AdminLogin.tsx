import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Loader2, AlertCircle } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" })
});

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if user is admin using security definer function
        const { data: isAdmin } = await supabase
          .rpc('is_admin', { check_user_id: session.user.id });
        
        if (isAdmin) {
          navigate('/admin/dashboard');
        }
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    
    // Validate inputs
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const errors: { email?: string; password?: string } = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0] === 'email') errors.email = err.message;
        if (err.path[0] === 'password') errors.password = err.message;
      });
      setFieldErrors(errors);
      toast.error('Please fix the form errors');
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        let errorMessage = 'Failed to login. Please try again.';
        
        if (authError.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials.';
        } else if (authError.message.includes('Email not confirmed')) {
          errorMessage = 'Please confirm your email address before logging in.';
        } else if (authError.message.includes('too many requests')) {
          errorMessage = 'Too many login attempts. Please try again later.';
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
        return;
      }

      if (data.user && data.session) {
        // Use security definer function to check admin status
        // This bypasses RLS timing issues
        const { data: isAdminResult, error: adminCheckError } = await supabase
          .rpc('is_admin', { check_user_id: data.user.id });

        console.log('Admin check result:', { 
          userId: data.user.id,
          isAdmin: isAdminResult,
          error: adminCheckError
        });

        if (adminCheckError) {
          await supabase.auth.signOut();
          setError('Failed to verify admin status. Please try again.');
          toast.error('Failed to verify admin status. Please try again.');
          console.error('Admin check error:', adminCheckError);
          return;
        }

        if (!isAdminResult) {
          await supabase.auth.signOut();
          setError('Access denied. Admin privileges required.');
          toast.error('Access denied. Admin privileges required.');
          return;
        }

        toast.success('Welcome back!');
        navigate('/admin/dashboard');
      }
    } catch (error: any) {
      const errorMessage = 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Admin Portal</CardTitle>
          <CardDescription className="text-center">
            Sign in to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@cortanexai.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors(prev => ({ ...prev, email: undefined }));
                  setError('');
                }}
                className={fieldErrors.email ? 'border-destructive' : ''}
                disabled={loading}
              />
              {fieldErrors.email && (
                <p className="text-sm text-destructive">{fieldErrors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFieldErrors(prev => ({ ...prev, password: undefined }));
                  setError('');
                }}
                className={fieldErrors.password ? 'border-destructive' : ''}
                disabled={loading}
              />
              {fieldErrors.password && (
                <p className="text-sm text-destructive">{fieldErrors.password}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
