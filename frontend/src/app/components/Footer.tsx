import { Compass } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
          {/* Left - Logo and Description */}
          <div className="max-w-sm">
            <div className="flex items-center gap-2 mb-3">
              <Compass className="size-7 text-teal-500" />
              <span className="text-xl font-semibold text-slate-900 dark:text-white">
                Trip Mate
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Discover personalized trips and connect with travelers worldwide.
              Your next adventure starts here.
            </p>
          </div>

          {/* Right - Navigation Links */}
          <div className="flex gap-12">
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                Explore
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#about"
                    className="text-slate-600 dark:text-slate-400 hover:text-teal-500 transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#trips"
                    className="text-slate-600 dark:text-slate-400 hover:text-teal-500 transition-colors"
                  >
                    Trips
                  </a>
                </li>
                <li>
                  <a
                    href="#reviews"
                    className="text-slate-600 dark:text-slate-400 hover:text-teal-500 transition-colors"
                  >
                    Reviews
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                Account
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#login"
                    className="text-slate-600 dark:text-slate-400 hover:text-teal-500 transition-colors"
                  >
                    Login
                  </a>
                </li>
                <li>
                  <a
                    href="#signup"
                    className="text-slate-600 dark:text-slate-400 hover:text-teal-500 transition-colors"
                  >
                    Sign Up
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom - Copyright */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
          <p className="text-center text-slate-600 dark:text-slate-400 text-sm">
            © 2026 Trip Mate. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
