import { ChevronDown } from "lucide-react";

interface HeroProps {
  onAuthClick?: () => void;
}

export function Hero({ onAuthClick }: HeroProps) {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://media.istockphoto.com/id/1160846801/photo/lake-tahoe-cove.jpg?s=612x612&w=0&k=20&c=HlJJEt9SRN9qZn30VUPPWxIZXRgQrvnscRvthq7-lUg="
          alt="Travel destination"
          className="w-full h-full object-cover blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Travel plans made for you
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto">
          Discover personalized trips, connect with travelers, and explore
          destinations curated by expert organizers
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onAuthClick}
            className="px-8 py-4 bg-teal-500 hover:bg-teal-600 text-white rounded-full font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Get Started
          </button>
          <button
            onClick={onAuthClick}
            className="px-8 py-4 bg-transparent border-2 border-white text-white hover:bg-white/10 rounded-full font-medium transition-all"
          >
            Login
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="flex flex-col items-center gap-2 text-white/80">
          <span className="text-sm">Scroll</span>
          <ChevronDown className="size-5" />
        </div>
      </div>
    </section>
  );
}