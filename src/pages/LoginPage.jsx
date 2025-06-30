import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    const result = login(email, password, keepSignedIn);
    if (!result.success) {
      setError(result.error);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-100">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Access the AI platform
          </p>
        </div>
        
        <Card className="p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md text-sm">
                {error}
              </div>
            )}


            
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
            
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />

            {/* Keep me signed in checkbox */}
            <div className="flex items-center">
              <input
                id="keep-signed-in"
                type="checkbox"
                checked={keepSignedIn}
                onChange={(e) => setKeepSignedIn(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-400 rounded bg-slate-700"
              />
              <label htmlFor="keep-signed-in" className="ml-2 block text-sm text-slate-200">
                Keep me signed in
              </label>
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              size="lg"
            >
              Sign In
            </Button>
          </form>
          
          <div className="mt-6 text-sm text-slate-300">
            <p className="font-medium mb-2">Example Login Credentials:</p>
            <div className="space-y-1">
              <p><span className="font-medium text-purple-300">Capacity Admin:</span> capacity@capacity.com / password</p>
              <p><span className="font-medium text-indigo-300">NSight Admin:</span> nsight@nsight-inc.com / password</p>
              <p><span className="font-medium text-blue-300">Employee:</span> employee@domain.com / password</p>
            </div>
            <p className="mt-3 text-xs text-slate-400">
              The system automatically detects your role based on your email address.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage; 