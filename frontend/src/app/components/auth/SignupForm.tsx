import {
  Building2,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  User,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";

interface SignupFormProps {
  onSwitchToLogin: () => void;
  onSignupComplete: () => void;
}

export function SignupForm({
  onSwitchToLogin,
  onSignupComplete,
}: SignupFormProps) {
  const [userId, setUserId] = useState("");
  const [userIdValidation, setUserIdValidation] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<"traveler" | "organizer">("traveler");
  const [organizationName, setOrganizationName] = useState("");

  // Mock userId validation
  useEffect(() => {
    if (userId.length < 3) {
      setUserIdValidation("idle");
      return;
    }

    setUserIdValidation("checking");

    const timer = setTimeout(async () => {
      try {
        // Check userId availability with backend API
        const response = await fetch(`http://localhost:5000/api/auth/check-userid/${userId}`);
        const data = await response.json();
        
        if (data.status === 'success') {
          setUserIdValidation(data.data.available ? "available" : "taken");
        } else {
          // Fallback to mock validation if API fails
          const takenUserIds = ["admin", "test", "user123"];
          setUserIdValidation(takenUserIds.includes(userId.toLowerCase()) ? "taken" : "available");
        }
      } catch (error) {
        console.error('Error checking userId:', error);
        // Fallback to available on error
        setUserIdValidation("available");
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userIdValidation !== "available") return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          email,
          password,
          fullName,
          role,
          ...(role === 'organizer' && { organizationName })
        }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        // Save token and user data to localStorage
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        console.log('Registration successful:', data.data.user);
        
        // Move to permission explanation screen
        onSignupComplete();
      } else {
        alert(data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Network error. Please make sure the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Create your account
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Join the Trip Mate community today
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* User ID Field */}
        <div>
          <label
            htmlFor="userId"
            className="block text-sm font-medium text-slate-900 dark:text-white mb-2"
          >
            User ID *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
            <input
              id="userId"
              type="text"
              value={userId}
              onChange={(e) =>
                setUserId(e.target.value.toLowerCase().replace(/\s/g, ""))
              }
              placeholder="choose_your_user_id"
              className="w-full pl-11 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              required
            />
            {userIdValidation === "checking" && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="size-5 border-2 border-slate-300 border-t-teal-500 rounded-full animate-spin"></div>
              </div>
            )}
            {userIdValidation === "available" && (
              <Check className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-green-500" />
            )}
            {userIdValidation === "taken" && (
              <X className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-red-500" />
            )}
          </div>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            This will be your public username
          </p>
          {userIdValidation === "available" && (
            <p className="mt-1 text-xs text-green-600 dark:text-green-400">
              ✓ User ID is available
            </p>
          )}
          {userIdValidation === "taken" && (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
              ✗ User ID is already taken
            </p>
          )}
        </div>

        {/* Full Name Field */}
        <div>
          <label
            htmlFor="fullName"
            className="block text-sm font-medium text-slate-900 dark:text-white mb-2"
          >
            Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              required
            />
          </div>
        </div>

        {/* Email Field (Optional) */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-900 dark:text-white mb-2"
          >
            Email <span className="text-slate-400">(optional)</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
            For account recovery and notifications
          </p>
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-900 dark:text-white mb-2"
          >
            Password *
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a strong password"
              className="w-full pl-11 pr-12 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              required
              minLength={6}
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

        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-900 dark:text-white mb-3">
            I want to *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole("traveler")}
              className={`p-4 rounded-xl border-2 transition-all ${
                role === "traveler"
                  ? "border-teal-500 bg-teal-50 dark:bg-teal-950"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              <MapPin
                className={`size-6 mb-2 ${
                  role === "traveler"
                    ? "text-teal-500"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              />
              <div className="text-left">
                <p
                  className={`font-medium ${
                    role === "traveler"
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  Traveler
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Discover and book trips
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole("organizer")}
              className={`p-4 rounded-xl border-2 transition-all ${
                role === "organizer"
                  ? "border-teal-500 bg-teal-50 dark:bg-teal-950"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              <Building2
                className={`size-6 mb-2 ${
                  role === "organizer"
                    ? "text-teal-500"
                    : "text-slate-400 dark:text-slate-500"
                }`}
              />
              <div className="text-left">
                <p
                  className={`font-medium ${
                    role === "organizer"
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  Organizer
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Create and manage trips
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Organization Name (Conditional) */}
        {role === "organizer" && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <label
              htmlFor="organizationName"
              className="block text-sm font-medium text-slate-900 dark:text-white mb-2"
            >
              Organization Name *
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
              <input
                id="organizationName"
                type="text"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="Your travel company name"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                required={role === "organizer"}
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={userIdValidation !== "available"}
          className="w-full py-3 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
        >
          Create account
        </button>
      </form>

      {/* Switch to Login */}
      <div className="mt-6 text-center">
        <p className="text-slate-600 dark:text-slate-400">
          Already have an account?{" "}
          <button
            onClick={onSwitchToLogin}
            className="text-teal-500 hover:text-teal-600 dark:hover:text-teal-400 font-medium transition-colors"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}
