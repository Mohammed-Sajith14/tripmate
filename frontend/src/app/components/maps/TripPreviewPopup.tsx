import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Cloud,
  CloudLightning,
  CloudRain,
  CloudSun,
  DollarSign,
  Droplets,
  Loader2,
  MapPin,
  Clock,
  Snowflake,
  Sun,
  User,
  X,
} from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

interface DailyWeatherItem {
  date: string;
  temperatureMax: number | null;
  temperatureMin: number | null;
  precipitationProbability: number | null;
  weatherCode: number | null;
}

const WEATHER_WEEKS = 4;
const DAYS_PER_WEEK = 7;
const MAX_FORECAST_DAYS = WEATHER_WEEKS * DAYS_PER_WEEK;
const WEATHER_CACHE = new Map<string, DailyWeatherItem[]>();

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);

const toNumberOrNull = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  return null;
};

const formatDayLabel = (date: string) => {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

const formatTemperature = (value: number | null) => {
  if (value === null) {
    return "--";
  }

  return `${Math.round(value)}°C`;
};

const formatRainChance = (value: number | null) => {
  if (value === null) {
    return "--";
  }

  return `${Math.round(value)}%`;
};

const mapPrecipitationToChance = (precipitationMm: number | null) => {
  if (precipitationMm === null) {
    return null;
  }

  if (precipitationMm >= 12) return 90;
  if (precipitationMm >= 6) return 75;
  if (precipitationMm >= 2) return 55;
  if (precipitationMm >= 0.5) return 35;
  if (precipitationMm > 0) return 20;
  return 5;
};

const getWeatherSummary = (
  weatherCode: number | null,
  precipitationProbability: number | null
) => {
  if (weatherCode === null) {
    if (precipitationProbability !== null) {
      if (precipitationProbability >= 70) {
        return {
          label: "Rain likely",
          icon: <CloudRain className="size-4 text-blue-500" />,
        };
      }

      if (precipitationProbability >= 35) {
        return {
          label: "Possible showers",
          icon: <CloudSun className="size-4 text-cyan-500" />,
        };
      }

      return {
        label: "Mostly dry",
        icon: <Sun className="size-4 text-amber-500" />,
      };
    }

    return {
      label: "Weather unavailable",
      icon: <Cloud className="size-4 text-slate-400 dark:text-slate-500" />,
    };
  }

  if (weatherCode === 0) {
    return {
      label: "Clear sky",
      icon: <Sun className="size-4 text-amber-500" />,
    };
  }

  if (weatherCode === 1 || weatherCode === 2) {
    return {
      label: "Partly cloudy",
      icon: <CloudSun className="size-4 text-cyan-500" />,
    };
  }

  if (weatherCode === 3 || weatherCode === 45 || weatherCode === 48) {
    return {
      label: "Cloudy",
      icon: <Cloud className="size-4 text-slate-500" />,
    };
  }

  if (
    [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)
  ) {
    return {
      label: "Rain",
      icon: <CloudRain className="size-4 text-blue-500" />,
    };
  }

  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
    return {
      label: "Snow",
      icon: <Snowflake className="size-4 text-indigo-500" />,
    };
  }

  if ([95, 96, 99].includes(weatherCode)) {
    return {
      label: "Thunderstorm",
      icon: <CloudLightning className="size-4 text-violet-500" />,
    };
  }

  return {
    label: "Variable weather",
    icon: <Cloud className="size-4 text-slate-500" />,
  };
};

const buildWeatherData = (payload: any): DailyWeatherItem[] => {
  const dates: string[] = Array.isArray(payload?.daily?.time)
    ? payload.daily.time
    : [];

  const maximum: unknown[] = Array.isArray(payload?.daily?.temperature_2m_max)
    ? payload.daily.temperature_2m_max
    : [];

  const minimum: unknown[] = Array.isArray(payload?.daily?.temperature_2m_min)
    ? payload.daily.temperature_2m_min
    : [];

  const rainProbability: unknown[] = Array.isArray(
    payload?.daily?.precipitation_probability_max
  )
    ? payload.daily.precipitation_probability_max
    : [];

  const precipitationSum: unknown[] = Array.isArray(payload?.daily?.precipitation_sum)
    ? payload.daily.precipitation_sum
    : [];

  const weatherCodes: unknown[] = Array.isArray(payload?.daily?.weather_code)
    ? payload.daily.weather_code
    : Array.isArray(payload?.daily?.weathercode)
    ? payload.daily.weathercode
    : [];

  return dates.slice(0, MAX_FORECAST_DAYS).map((date, index) => ({
    date,
    temperatureMax: toNumberOrNull(maximum[index]),
    temperatureMin: toNumberOrNull(minimum[index]),
    precipitationProbability:
      toNumberOrNull(rainProbability[index]) ??
      mapPrecipitationToChance(toNumberOrNull(precipitationSum[index])),
    weatherCode: toNumberOrNull(weatherCodes[index]),
  }));
};

export interface TripData {
  id: string;
  name: string;
  destination: string;
  category: string;
  duration: string;
  priceRange: string;
  organizerName: string;
  image: string;
  coordinates: [number, number];
}

interface TripPreviewPopupProps {
  trip: TripData;
  onViewDetails: () => void;
  onClose?: () => void;
}

export function TripPreviewPopup({ trip, onViewDetails, onClose }: TripPreviewPopupProps) {
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [dailyWeather, setDailyWeather] = useState<DailyWeatherItem[]>([]);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState("");

  const [latitude, longitude] = trip.coordinates;

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "beach":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
      case "hills":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
      case "adventure":
        return "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400";
      case "cultural":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400";
    }
  };

  useEffect(() => {
    let isDisposed = false;
    setSelectedWeek(0);
    setWeatherError("");

    const cacheDayKey = new Date().toISOString().slice(0, 10);
    const cacheKey = `${latitude.toFixed(3)},${longitude.toFixed(3)},${cacheDayKey}`;
    const cached = WEATHER_CACHE.get(cacheKey);
    if (cached) {
      setDailyWeather(cached);
      return () => {
        isDisposed = true;
      };
    }

    const fetchWeather = async () => {
      try {
        setIsWeatherLoading(true);

        const startDate = new Date();
        const endDate = addDays(startDate, MAX_FORECAST_DAYS - 1);

        const response = await fetch(
          `https://climate-api.open-meteo.com/v1/climate?latitude=${latitude}&longitude=${longitude}&start_date=${toIsoDate(
            startDate
          )}&end_date=${toIsoDate(
            endDate
          )}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&models=EC_Earth3P_HR&timezone=auto`
        );

        if (!response.ok) {
          let apiReason = "Unable to fetch weather forecast";

          try {
            const errorPayload = await response.json();
            if (typeof errorPayload?.reason === "string" && errorPayload.reason.trim()) {
              apiReason = errorPayload.reason;
            }
          } catch {
            // ignore parse failures
          }

          throw new Error(apiReason);
        }

        const payload = await response.json();
        const parsedWeather = buildWeatherData(payload);

        if (!parsedWeather.length) {
          throw new Error("No forecast available for this location");
        }

        WEATHER_CACHE.set(cacheKey, parsedWeather);

        if (!isDisposed) {
          setDailyWeather(parsedWeather);
        }
      } catch (error) {
        if (!isDisposed) {
          setWeatherError(
            error instanceof Error
              ? error.message
              : "Unable to load weather right now"
          );
          setDailyWeather([]);
        }
      } finally {
        if (!isDisposed) {
          setIsWeatherLoading(false);
        }
      }
    };

    fetchWeather();

    return () => {
      isDisposed = true;
    };
  }, [trip.id, latitude, longitude]);

  const weeklyWeatherGroups = useMemo(() => {
    return Array.from({ length: WEATHER_WEEKS }, (_, weekIndex) => {
      const start = weekIndex * DAYS_PER_WEEK;
      return dailyWeather.slice(start, start + DAYS_PER_WEEK);
    });
  }, [dailyWeather]);

  const selectedWeekWeather = weeklyWeatherGroups[selectedWeek] || [];
  const availableWeeks = weeklyWeatherGroups.filter((week) => week.length > 0).length;

  return (
    <div className="w-80 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Image */}
      <div className="aspect-video relative">
        <ImageWithFallback
          src={trip.image}
          alt={trip.name}
          className="w-full h-full object-cover"
        />
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 left-3 p-1.5 rounded-full bg-black/55 hover:bg-black/70 text-white transition-colors"
            aria-label="Close popup"
          >
            <X className="size-4" />
          </button>
        )}
        <span
          className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(
            trip.category
          )}`}
        >
          {trip.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Trip Name */}
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
            {trip.name}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <MapPin className="size-3.5" />
            {trip.destination}
          </p>
        </div>

        {/* Trip Info */}
        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <Clock className="size-4" />
            <span>{trip.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="size-4" />
            <span>{trip.priceRange}</span>
          </div>
        </div>

        {/* Organizer */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <User className="size-4 text-slate-400" />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            by {trip.organizerName}
          </span>
        </div>

        {/* Weather Panel */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              4-Week Weather
            </h4>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {trip.destination}
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1">
            {Array.from({ length: WEATHER_WEEKS }, (_, weekIndex) => {
              const weekHasData = weeklyWeatherGroups[weekIndex]?.length > 0;

              return (
                <button
                  key={`week-${weekIndex + 1}`}
                  onClick={() => setSelectedWeek(weekIndex)}
                  disabled={!weekHasData}
                  className={`px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    selectedWeek === weekIndex
                      ? "bg-teal-500 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  } ${!weekHasData ? "opacity-40 cursor-not-allowed" : "hover:bg-slate-200 dark:hover:bg-slate-700"}`}
                >
                  W{weekIndex + 1}
                </button>
              );
            })}
          </div>

          {isWeatherLoading && (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-slate-500 dark:text-slate-400">
              <Loader2 className="size-4 animate-spin" />
              Loading forecast...
            </div>
          )}

          {!isWeatherLoading && weatherError && (
            <div className="flex items-start gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md">
              <AlertCircle className="size-4 mt-0.5 flex-shrink-0" />
              <span>{weatherError}</span>
            </div>
          )}

          {!isWeatherLoading && !weatherError && selectedWeekWeather.length > 0 && (
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {selectedWeekWeather.map((day) => {
                const weatherSummary = getWeatherSummary(
                  day.weatherCode,
                  day.precipitationProbability
                );

                return (
                  <div
                    key={day.date}
                    className="flex items-center justify-between px-2.5 py-2 rounded-md bg-slate-50 dark:bg-slate-800/70"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {weatherSummary.icon}
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                          {formatDayLabel(day.date)}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {weatherSummary.label}
                        </p>
                      </div>
                    </div>

                    <div className="text-right pl-2">
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                        {formatTemperature(day.temperatureMax)} / {formatTemperature(day.temperatureMin)}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap inline-flex items-center gap-1">
                        <Droplets className="size-3" />
                        {formatRainChance(day.precipitationProbability)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!isWeatherLoading && !weatherError && selectedWeekWeather.length === 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400 py-2">
              No forecast data available for this week.
            </p>
          )}

          {!isWeatherLoading && !weatherError && dailyWeather.length > 0 && availableWeeks < WEATHER_WEEKS && (
            <p className="text-[11px] text-amber-700 dark:text-amber-400">
              Forecast provider returned {dailyWeather.length} days for this location.
            </p>
          )}
        </div>

        {/* View Details Button */}
        <button
          onClick={onViewDetails}
          className="w-full px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
