'use client';
import { useState,useEffect } from "react";


interface NewsData {
  articles: Array<{
    title: string;
    description: string;
    url: string;
    urlToImage: string;
    publishedAt: string;
    source: {
      name: string;
    };
  }>;
}
interface WeatherData {
  name: string;
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{
    description: string;
  }>;
  wind: {
    speed: number;
  };
}

export default function Home() {
  const [news, setNews] = useState<NewsData | null>(null);
  const [cetagory, setCategory] = useState("technology");

  const [city, setCity] = useState("Bangkok");
  const [weather, setWeather] = useState<WeatherData | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherData = async () => {
    if (!city.trim()) return;
    
    setLoading(true);
    setError(null);
    
    const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
      );
      
      if (!res.ok) {
        throw new Error("ไม่พบข้อมูลเมืองที่ค้นหา");
      }
      
      const data = await res.json();
      setWeather(data);
      console.log(data);
    } catch (err) {
      console.error("Error fetching weather data:", err);
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการค้นหา");
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchNewsData = async () => {
    if (!cetagory.trim()) return;
    
    setLoading(true);
    setError(null);
    
    const API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY;

    try {
      const res = await fetch(
        `https://newsapi.org/v2/top-headlines?category=${encodeURIComponent(cetagory)}&country=us&apiKey=${API_KEY}`
      );
      
      if (!res.ok) {
        throw new Error("ไม่พบข้อมูลเมืองที่ค้นหา");
      }
      
      const data = await res.json();
      setNews(data);
      console.log(data);
    } catch (err) {
      console.error("Error fetching weather data:", err);
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการค้นหา");
      setNews(null);
    } finally {
      setLoading(false);
    }
  };

  const handleWeatherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeatherData();
  };

  const handleNewsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNewsData();
  };

  useEffect(() => {
    fetchWeatherData();
    fetchNewsData();
  }, []);

  const gettempIcon = (temp: number) => {
    if(temp > 30) return "🔥";
    if(temp > 20) return "🌤️";
    if(temp > 10) return "🌥️";
    return "❄️";
  }
  const getwindIcon = (speed: number) => {
    if(speed < 2) return "🌾";
    if(speed < 4) return "🍃";
    if(speed < 6) return "🎐";
    if(speed < 8) return "🌬️";
    if(speed < 11) return "💨";
  }
  const gethumidityIcon = (humidity: number) => {
    if(humidity < 30) return "☀️";
    if(humidity < 50) return "🍂";
    if(humidity < 70) return "💧";
    if(humidity < 100) return "🌊";
  }

  return (
    <div className="flex flex-col flex-wrap items-center justify-center p-6 min-h-screen bg-gray-100">
      <div className="container mx-auto">
      {/* Weather Card */}
      <div className="ring-2 ring-gray-300 p-8 rounded-3xl bg-white shadow-lg w-full flex flex-col items-center mb-12">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Weather App</h1>
      
      {/* Search Form */}
      <form onSubmit={handleWeatherSubmit} className="flex flex-col gap-2 mb-6 md:flex-row">
        <input
          type="text"
          placeholder="Enter city name"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600 "
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !city.trim()}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center gap-2 text-blue-600">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p>Loading weather data...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4">
          <p>{error}</p>
        </div>
      )}

      {/* Weather Result */}
      {weather && weather.main && !loading && (
        <div className="mt-4 p-6 bg-white rounded-xl shadow-lg text-center w-full flex flex-col xl:flex-row justify-between items-center gap-4">
          <div className="w-full bg-indigo-500 ring-2 ring-indigo-400 p-4 rounded-xl h-75 flex flex-col items-center justify-center">
          <h2 className="text-3xl md:text-5xl font-bold  text-white mb-2">{weather.name}</h2>
          <p className="text-xl md:text-2xl text-gray-100 capitalize mb-4">
            {weather.weather[0].description}
          </p>
          </div>
          <div className="w-full ring-2 ring-grey-400 p-4 rounded-xl h-75 flex flex-col items-center justify-center gap-5">
            <h2 className="text-3xl md:text-4xl font-bold  text-slate-800 mb-2">Temperature</h2>
            <p className="text-4xl font-bold text-slate-500 mb-4 text-center">
            {Math.round(weather.main.temp)}°C {gettempIcon(weather.main.temp)}
            </p>
          </div>
          <div className="w-full ring-2 ring-grey-400 p-4 rounded-xl h-75 flex flex-col items-center justify-center gap-5">
            <div><p className="text-3xl md:text-4xl font-bold  text-slate-800 mb-2">Humidity</p></div>
            <p className="text-4xl font-bold text-slate-500 mb-4 text-center">{weather.main.humidity}% {gethumidityIcon(weather.wind.speed)}</p>
          </div>
          <div className="w-full ring-2 ring-grey-400 p-4 rounded-xl h-75 flex flex-col items-center justify-center gap-5">
            <p className="text-3xl md:text-4xl font-bold  text-slate-800 mb-2">Wind Speed</p>
            <p className="text-4xl font-bold text-slate-500 mb-4 text-center">{weather.wind.speed} m/s {getwindIcon(weather.wind.speed)}</p>
          </div>
        </div>
      )}

      {/* No Data State */}
      {!weather && !loading && !error && (
        <p className="text-gray-500 mt-4">No weather data available</p>
      )}
      </div>
      {/* Weather Card */}
      {/* News Card */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-100 p-8 rounded-3xl shadow-2xl w-full mx-auto backdrop-blur-sm border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              📰 News Explorer
            </h1>
            <p className="text-gray-600 text-lg">Discover the latest news from around the world</p>
          </div>
          {/* Search Form */}
          <form onSubmit={handleNewsSubmit} className="flex flex-col gap-4 mb-8 sm:flex-row">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter News Category (e.g., technology, sports, health)"
                value={cetagory}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100 text-gray-700 bg-white/80 backdrop-blur-sm transition-all duration-300 text-lg placeholder-gray-400"
                disabled={loading}
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || !cetagory.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Searching...
                </div>
              ) : (
                "🚀 Search News"
              )}
            </button>
          </form>
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center gap-4 text-blue-600 py-8">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-purple-600 rounded-full animate-spin animation-delay-150"></div>
              </div>
              <p className="text-lg font-medium">Fetching the latest news...</p>
            </div>
          )}
          {/* Error State */}
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-6 shadow-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h3 className="font-semibold text-lg">Oops! Something went wrong</h3>
                  <p className="text-red-600">{error}</p>
                </div>
              </div>
            </div>
          )}
          {/* News Results */}
          {news && news.articles.length > 0 && !loading && (
            <div className="mt-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  🔥 Top Stories in <span className="text-blue-600 capitalize">{cetagory}</span>
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"></div>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {news.articles.slice(0, 3).map((article, index) => (
                  <a 
                    key={index} 
                    href={article.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="group block bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-white/50"
                  >
                    {article.urlToImage && (
                      <div className="relative overflow-hidden h-48">
                        <img 
                          src={article.urlToImage} 
                          alt={article.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                          {article.source.name}
                        </span>
                        <span className="text-gray-500 text-sm">
                          📅 {new Date(article.publishedAt).toLocaleDateString('th-TH')}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {article.title}
                      </h3>
                      {article.description && (
                        <p className="text-gray-600 line-clamp-3 leading-relaxed">
                          {article.description}
                        </p>
                      )}
                      <div className="mt-4 flex items-center text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                        <span>Read more</span>
                        <span className="ml-2 transform group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
              {news.articles.length > 3 && (
                <div className="text-center mt-8">
                  <p className="text-gray-600">
                    Showing 3 of {news.articles.length} articles
                  </p>
                </div>
              )}
            </div>
          )}
          {/* No Data State */}
          {!news && !loading && !error && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📰</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">Ready to explore news?</h3>
              <p className="text-gray-500 text-lg">Enter a category above to get started!</p>
            </div>
          )}
        </div>
        {/* News Card */}
        </div>
    </div>
  );
}