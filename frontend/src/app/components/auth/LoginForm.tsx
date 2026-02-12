import { Eye, EyeOff, Lock, User } from "lucide-react";
import { useState } from "react";

interface LoginFormProps {
  onSwitchToSignup: () => void;
  onComplete?: () => void;
}

export function LoginForm({ onSwitchToSignup, onComplete }: LoginFormProps) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, password }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        // Save token and user data to localStorage
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        console.log('Login successful:', data.data.user);
        alert('Welcome back, ' + data.data.user.fullName + '!');
        
        // Navigate to home page
        if (onComplete) {
          onComplete();
        }
      } else {
        alert(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Network error. Please make sure the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Welcome back
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Your social hub for travel experiences
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* User ID Field */}
        <div>
          <label
            htmlFor="userId"
            className="block text-sm font-medium text-slate-900 dark:text-white mb-2"
          >
            User ID
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
            <input
              id="userId"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="your_user_id"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              required
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            Use your Trip Mate User ID to log in
          </p>
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-900 dark:text-white mb-2"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full pl-11 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="size-5" />
              ) : (
                <Eye className="size-5" />
              )}
            </button>
          </div>
        </div>

        {/* Forgot Password */}
        <div className="flex justify-end">
          <button
            type="button"
            className="text-sm text-teal-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          >
            Forgot password?
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Log in
        </button>
      </form>

      {/* Switch to Signup */}
      <div className="mt-6 text-center">
        <p className="text-slate-600 dark:text-slate-400">
          New to Trip Mate?{" "}
          <button
            onClick={onSwitchToSignup}
            className="text-teal-500 hover:text-teal-600 dark:hover:text-teal-400 font-medium transition-colors"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
