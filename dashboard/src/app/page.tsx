'use client';
import { useState,useEffect } from "react";
import { Search, CloudRain, Sun, Cloud, Wind, Droplets, Thermometer, MapPin } from 'lucide-react'
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";


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
  name: string
  main: {
    temp: number
    humidity: number
    feels_like: number
  }
  weather: Array<{
    main: string
    description: string
    icon: string
  }>
  wind: {
    speed: number
  }
  sys: {
    country: string
  }
}

type Currency = "USD" | "EUR" | "GBP" | "THB";
type CurrencyList = Record<string, string>;

type Holiday = {
  name: string;
  date: { iso: string };
  description: string;
  type: string[];
};

export default function Home() {

  const [news, setNews] = useState<NewsData | null>(null);
  const [cetagory, setCategory] = useState("technology");

  const [city, setCity] = useState("Bangkok");
  const [weather, setWeather] = useState<WeatherData | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [amount, setAmount] = useState<number>(1);
  const [fromCurrency, setFromCurrency] = useState<Currency>("USD");
  const [currencies, setCurrencies] = useState<CurrencyList>({});
  const [toCurrency, setToCurrency] = useState<Currency>("THB");
  const [result, setResult] = useState<number | null>(null);

  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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
        throw new Error("ไม่พบข้อมูลเงินที่ค้นหา");
      }
      
      const data = await res.json();
      setNews(data);
    } catch (err) {
      console.error("Error fetching currency data:", err);
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการค้นหา");
      setNews(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrencyData = async () => {
    try{
      const res = await fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`);
      if(!res.ok){
        throw new Error("ไม่พบข้อมูลเงินที่ค้นหา");
      }
      const data = await res.json();
      const rate = data.rates[toCurrency];
      setResult(rate);
    }catch(err){
    console.error("Error fetching currency data:", err);
    }
  }

  useEffect(() => {
    const fetchCurrencies = async () => {
      const res = await fetch("https://api.frankfurter.app/currencies");
      const data = await res.json();
      setCurrencies(data);
    };
    fetchCurrencies();
  }, []);

  const fetchHolidays = async () => {
    try {
      const API_KEY = process.env.NEXT_PUBLIC_HOLIDAYS_API_KEY;
      if (!API_KEY) {
        console.error("Holiday API key is missing!");
        return;
      }
      const res = await fetch(`https://calendarific.com/api/v2/holidays?&api_key=${API_KEY}&country=TH&year=2025`);
      if (!res.ok) {
        throw new Error("ไม่พบข้อมูลวันหยุด");
      }
      const data = await res.json();
      console.log("Loaded holidays:", data.response?.holidays?.length || 0);
      if (data.response?.holidays) {
        setHolidays(data.response.holidays);
      } else {
        console.error("No holidays data in response:", data);
      }
    } catch (err) { 
      console.error("Error fetching holidays data:", err);
    }
}

  const handleWeatherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeatherData();
  };

  const handleNewsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNewsData();
  };

  const isHoliday = (date: Date) => {
    return holidays.some(
      (h) => new Date(h.date.iso).toDateString() === date.toDateString()
    );
  };

  useEffect(() => {
    fetchWeatherData();
    fetchNewsData();
    fetchCurrencyData();
    fetchHolidays();
  }, [amount, fromCurrency, toCurrency]); 

  const getTempIcon = (temp: number) => { 
    if (temp > 25) return <Sun className="w-6 h-6 text-yellow-500" />
    if (temp > 15) return <Cloud className="w-6 h-6 text-gray-500" />
    return <CloudRain className="w-6 h-6 text-blue-500" />
  }

  const getWindIcon = (speed: number) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    return <Wind className="w-6 h-6 text-blue-400" />
  }

  const getHumidityIcon = (humidity: number) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    return <Droplets className="w-6 h-6 text-blue-500" />
  }

  return (
    <div className="flex flex-col flex-wrap items-center justify-center p-6 h-auto bg-slate-800">
      <div className="container mx-auto">
      {/* Weather Card */}
        <div className="w-full mx-auto my-10  bg-white rounded-4xl p-5">
        {/* Header */}
        <div className="text-center my-4 md:my-8">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Weather App
          </h1>
          <p className="text-slate-800 text-lg md:text-xl">Get real-time weather information for any city</p>
        </div>

        {/* Search Card */}
        <div className=" backdrop-blur-lg rounded-3xl border border-white/80 shadow-xl p-6 md:p-8 mb-8">
          <form onSubmit={handleWeatherSubmit} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Enter city name..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-700 placeholder-gray-400 transition-all duration-300"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !city.trim()}
              className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-white px-8 py-4 rounded-2xl hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 font-semibold text-lg shadow-lg flex items-center justify-center gap-2 min-w-[140px]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search
                </>
              )}
            </button>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white/70 backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl p-8 mb-8">
            <div className="flex items-center justify-center gap-3 text-blue-600">
              <div className="w-6 h-6 border-3 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
              <p className="text-lg font-medium">Fetching weather data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50/80 backdrop-blur-lg border border-red-200 rounded-3xl p-6 mb-8 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">!</span>
              </div>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Weather Result */}
        {weather && !loading && (
          <div className="space-y-6">
            {/* Main Weather Card */}
            <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div className="text-center md:text-left mb-6 md:mb-0">
                    <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                      <MapPin className="w-6 h-6" />
                      <h2 className="text-3xl md:text-5xl font-bold">{weather.name}</h2>
                      <span className="text-xl opacity-75">{weather.sys.country}</span>
                    </div>
                    <p className="text-xl md:text-2xl opacity-90 capitalize font-medium">
                      {weather.weather[0].description}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-6xl md:text-8xl font-bold mb-2">
                      {Math.round(weather.main.temp)}°
                    </div>
                    <p className="text-xl opacity-75">
                      Feels like {Math.round(weather.main.feels_like)}°C
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Weather Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Temperature Card */}
              <div className="bg-white/70 backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center">
                    <Thermometer className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Temperature</h3>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-gray-700 mb-2">
                    {Math.round(weather.main.temp)}°C
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    {getTempIcon(weather.main.temp)}
                    <span className="text-gray-600">
                      {weather.main.temp > 25 ? 'Hot' : weather.main.temp > 15 ? 'Mild' : 'Cool'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Humidity Card */}
              <div className="bg-white/70 backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center">
                    <Droplets className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Humidity</h3>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-gray-700 mb-2">
                    {weather.main.humidity}%
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    {getHumidityIcon(weather.main.humidity)}
                    <span className="text-gray-600">
                      {weather.main.humidity > 70 ? 'High' : weather.main.humidity > 40 ? 'Moderate' : 'Low'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Wind Speed Card */}
              <div className="bg-white/70 backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-500 rounded-2xl flex items-center justify-center">
                    <Wind className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Wind Speed</h3>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-gray-700 mb-2">
                    {weather.wind.speed}
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    {getWindIcon(weather.wind.speed)}
                    <span className="text-gray-600">m/s</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Data State */}
        {!weather && !loading && !error && (
          <div className="bg-white/50 backdrop-blur-lg rounded-3xl border border-white/20 shadow-xl p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <Cloud className="w-12 h-12 text-gray-500" />
            </div>
            <p className="text-gray-500 text-xl font-medium">
              Enter a city name to get started
            </p>
            <p className="text-gray-400 mt-2">
              Search for any city worldwide to view current weather conditions
            </p>
          </div>
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
      {/* Currency and holidays Card */}
      <div className="my-10 flex flex-col lg:flex-row justify-center items-stretch w-full gap-10">
      <div className="flex-1 min-w-[300px] max-w-[600px] mx-auto relative">
        <div className="h-full bg-white backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8 relative overflow-hidden">
          {/* Glassmorphism effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-3xl"></div>
          
          <div className="relative z-10">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl mb-4 shadow-lg">
                <span className="text-2xl">💱</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-700 mb-2">Exchange Rate</h1>
              <p className="text-slate-700/70">Currency Converter</p>
            </div>

            <div className="space-y-8">
              {/* Amount Input */}
              <div>
                <label className="block text-slate-700/80 font-medium mb-3 text-sm uppercase tracking-wide">Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full text-3xl font-bold text-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-slate-700 placeholder-white/50 focus:bg-white/20 focus:border-white/40 focus:outline-none transition-all duration-300 shadow-lg"
                    placeholder="0.00"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl pointer-events-none"></div>
                </div>
              </div>

              {/* Currency Selection */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-700/80 font-medium mb-3 text-sm uppercase tracking-wide">From</label>
                  <div className="relative">
                    <select
                      value={fromCurrency}
                      onChange={(e) => setFromCurrency(e.target.value as Currency)}
                      className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-slate-700 font-medium focus:bg-white/20 focus:border-white/40 focus:outline-none transition-all duration-300 appearance-none cursor-pointer shadow-lg"
                    >
                      {Object.entries(currencies).map(([code, name]) => (
                        <option key={code} value={code} className="bg-gray-800">
                          {code} — {name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 pointer-events-none">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="block text-slate-700/80 font-medium mb-3 text-sm uppercase tracking-wide">To</label>
                  <div className="relative">
                    <select
                      value={toCurrency}
                      onChange={(e) => setToCurrency(e.target.value as Currency)}
                      className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-slate-700 font-medium focus:bg-white/20 focus:border-white/40 focus:outline-none transition-all duration-300 appearance-none cursor-pointer shadow-lg"
                    >
                      {Object.entries(currencies).map(([code, name]) => (
                        <option key={code} value={code} className="bg-gray-800">
                          {code} — {name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 pointer-events-none">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conversion Arrow */}
              <div className="flex justify-center">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full shadow-lg transform hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>

              {/* Result */}
              {result !== null && (
                <div className="relative">
                  <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 backdrop-blur-sm rounded-2xl border border-emerald-400/30 p-6 text-center shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-2xl"></div>
                    <div className="relative z-10">
                      <div className="text-sm text-slate-700/60 mb-2 uppercase tracking-wide">Converted Amount</div>
                      <div className="text-3xl font-bold text-slate-700 mb-1">
                        {result.toFixed(2)} <span className="text-emerald-500">{toCurrency}</span>
                      </div>
                      <div className="text-slate-700/50 text-sm">
                        {amount} {fromCurrency} equals
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
        <div className="flex-1 min-w-[300px] flex flex-col items-center justify-center bg-gradient-to-br from-white via-white to-purple-50 text-slate-700 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,transparent,black,transparent)]"></div>
          <div className="w-full max-w-[600px] relative z-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-violet-400 to-indigo-400 rounded-2xl mb-4 shadow-lg transform hover:scale-105 transition-all duration-300">
                <span className="text-2xl">📅</span>
              </div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                ปฏิทินวันหยุด 2025
              </h1>
              <p className="text-slate-500">Thailand Holidays</p>
            </div>

            {/* Calendar */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/60 flex justify-center items-center">
              <Calendar
                onClickDay={(value) => setSelectedDate(value)}
                tileClassName={({ date }) =>
                  isHoliday(date) ? "holiday" : ""
                }
                className="w-full border-0 [&_.react-calendar__navigation]:mb-6 
                [&_.react-calendar__navigation__arrow]:text-2xl [&_.react-calendar__navigation__arrow]:text-slate-600 [&_.react-calendar__navigation__arrow]:hover:text-violet-500
                [&_.react-calendar__navigation__label]:text-lg [&_.react-calendar__navigation__label]:font-semibold [&_.react-calendar__navigation__label]:text-slate-700
                [&_.react-calendar__month-view__weekdays]:mb-4 [&_.react-calendar__month-view__weekdays__weekday]:font-medium [&_.react-calendar__month-view__weekdays__weekday]:text-slate-500
                [&_.react-calendar__tile]:rounded-lg [&_.react-calendar__tile]:p-2 [&_.react-calendar__tile]:text-sm [&_.react-calendar__tile]:font-medium
                [&_.react-calendar__tile--active]:bg-gradient-to-r [&_.react-calendar__tile--active]:from-violet-500 [&_.react-calendar__tile--active]:to-indigo-500 [&_.react-calendar__tile--active]:text-white
                [&_.react-calendar__tile--now]:bg-slate-100 [&_.react-calendar__tile--now]:text-slate-600"
              />
            </div>

            {/* Holiday detail */}
            {selectedDate && (
              <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/60 transform transition-all duration-300">
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2 text-slate-700">
                  <span className="w-8 h-8 bg-gradient-to-r from-violet-100 to-indigo-100 rounded-lg flex items-center justify-center">
                    📅
                  </span>
                  {selectedDate.toDateString()}
                </h2>
                <div className="space-y-4">
                  {holidays
                    .filter(
                      (h) =>
                        new Date(h.date.iso).toDateString() ===
                        selectedDate.toDateString()
                    )
                    .map((h, idx) => (
                      <div key={idx} className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl p-4 transition-all duration-300 hover:shadow-md">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-violet-400 to-indigo-400 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-lg">🎉</span>
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 mb-1">{h.name}</p>
                            <p className="text-sm text-slate-600 leading-relaxed">{h.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  {holidays.filter(
                    (h) =>
                      new Date(h.date.iso).toDateString() ===
                      selectedDate.toDateString()
                  ).length === 0 && (
                    <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center">
                        <span className="text-slate-600">📌</span>
                      </div>
                      <p className="text-slate-600">ไม่มีวันหยุดในวันนี้</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Currency and holiday Card */}
      </div>
    </div>
  );
}
