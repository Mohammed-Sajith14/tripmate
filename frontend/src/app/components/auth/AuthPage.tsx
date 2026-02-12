import { Compass } from "lucide-react";
import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";
import { PermissionsScreen } from "./PermissionsScreen";

interface AuthPageProps {
  isDark: boolean;
  onComplete?: () => void;
  toggleTheme?: () => void;
}

type AuthView = "login" | "signup" | "permissions";

export function AuthPage({ isDark, onComplete, toggleTheme }: AuthPageProps) {
  const [currentView, setCurrentView] = useState<AuthView>("login");

  const handleSwitchToSignup = () => {
    setCurrentView("signup");
  };

  const handleSwitchToLogin = () => {
    setCurrentView("login");
  };

  const handleSignupComplete = () => {
    setCurrentView("permissions");
  };

  const handlePermissionsContinue = () => {
    // In a real app, this would navigate to the main app
    console.log("User onboarding complete!");
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-slate-900">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1712479667983-9f2872d33fb9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXNzcG9ydCUyMHdvcmxkJTIwbWFwJTIwdHJhdmVsJTIwcGxhbm5pbmd8ZW58MXx8fHwxNzcwMzU2NTczfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Travel planning"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/90 to-teal-700/90 mix-blend-multiply"></div>
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white">
            <Compass className="size-20 mx-auto mb-6" />
            <h1 className="text-5xl font-bold mb-4">Trip Mate</h1>
            <p className="text-xl text-white/90 max-w-md">
              Your social hub for discovering unforgettable travel experiences
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Forms */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo for mobile */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <Compass className="size-8 text-teal-500" />
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              Trip Mate
            </span>
          </div>

          {/* Form Content with Smooth Transition */}
          <div className="relative">
            {currentView === "login" && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <LoginForm 
                  onSwitchToSignup={handleSwitchToSignup}
                  onComplete={onComplete}
                />
              </div>
            )}

            {currentView === "signup" && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <SignupForm
                  onSwitchToLogin={handleSwitchToLogin}
                  onSignupComplete={handleSignupComplete}
                />
              </div>
            )}

            {currentView === "permissions" && (
              <PermissionsScreen onContinue={handlePermissionsContinue} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}