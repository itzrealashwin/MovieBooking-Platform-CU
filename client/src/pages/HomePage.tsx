import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/ui/BottomNav";
import { movieApi } from "../api/movie.api";
import type { Movie } from "../store/slices/movieSlice";

type MovieTab = "now_showing" | "coming_soon";

interface Theatre {
  id: string;
  name: string;
  location: string;
  priceRange: string;
}
import { theatreApi } from "../api/theatre.api";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<MovieTab>("now_showing");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [theatres, setTheatres] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHomeData = async () => {
      setIsLoading(true);
      try {
        const status = activeTab === "now_showing" ? "now_showing" : "coming_soon";
        const [moviesRes, theatresRes] = await Promise.all([
          movieApi.getMovies({ status }),
          theatreApi.getTheatres()
        ]);
        
        if (moviesRes.success) {
          setMovies(moviesRes.movies || []);
        }
        if (theatresRes.success && theatresRes.data) {
          setTheatres(theatresRes.data.slice(0, 5)); // show top 5 theatres on home
        }
      } catch (error) {
        console.error("Failed to fetch home data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHomeData();
  }, [activeTab]);

  const currentMovies = movies;

  return (
    <div
      id="home-page"
      className="min-h-screen pb-24"
      style={{ background: "#F6F8FA", maxWidth: "480px", margin: "0 auto" }}
    >
      {/* Hero Banner */}
      <div id="hero-banner" className="relative w-full">
        <img
          src="/images/hero_banner.png"
          alt="Now showing in cinemas"
          className="w-full h-64 object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Search Icon */}
        <button
          id="hero-search-btn"
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center cursor-pointer border-none transition-all duration-200 hover:bg-white/30"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>

        {/* Hero text */}
        <div className="absolute bottom-4 left-4">
          <p className="text-white/70 text-xs font-medium mb-1">Featured</p>
          <h2 className="text-white text-lg font-bold leading-tight">
            Book Your Next
            <br />
            Movie Experience
          </h2>
        </div>
      </div>

      {/* Movie Tabs */}
      <div id="movie-tabs" className="px-5 pt-5">
        <div className="flex items-center justify-between border-b border-gray-200">
          <div className="flex gap-6">
            <button
              id="tab-now-showing"
              onClick={() => setActiveTab("now_showing")}
              className={`pb-3 text-sm font-semibold transition-all duration-200 cursor-pointer bg-transparent border-none outline-none relative ${activeTab === "now_showing"
                  ? "text-brand-primary"
                  : "text-brand-text-sub"
                }`}
            >
              Now Showing
              {activeTab === "now_showing" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-brand-primary rounded-full" />
              )}
            </button>
            <button
              id="tab-coming-soon"
              onClick={() => setActiveTab("coming_soon")}
              className={`pb-3 text-sm font-semibold transition-all duration-200 cursor-pointer bg-transparent border-none outline-none relative ${activeTab === "coming_soon"
                  ? "text-brand-primary"
                  : "text-brand-text-sub"
                }`}
            >
              Coming Soon
              {activeTab === "coming_soon" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-brand-primary rounded-full" />
              )}
            </button>
          </div>
          <button className="pb-3 text-xs text-brand-primary font-medium cursor-pointer bg-transparent border-none outline-none hover:opacity-80">
            View All
          </button>
        </div>
      </div>

      {/* Movie Cards - Horizontal Scroll */}
      <div
        id="movie-list"
        className="flex gap-4 overflow-x-auto px-5 pt-5 pb-2 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center w-full py-10">
            <svg className="animate-spin h-6 w-6 text-brand-primary" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : (
          currentMovies.map((movie: any) => (
            <div
              key={movie._id || movie.id}
              id={`movie-card-${movie._id || movie.id}`}
              className="flex-shrink-0 w-[140px] cursor-pointer group"
              onClick={() => navigate(`/movies/${movie._id || movie.id}`)}
            >
              {/* Poster with rating badge */}
              <div className="relative rounded-xl overflow-hidden mb-2.5">
                <img
                  src={movie.posterUrl || movie.poster || `https://picsum.photos/seed/${encodeURIComponent(movie.title)}/600/900`}
                  alt={movie.title}
                  onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(movie.title)}/600/900`; }}
                  className="w-[140px] h-[200px] object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Rating badge */}
                {(movie.avgRating || movie.rating) > 0 && (
                  <div className="absolute bottom-2 right-2 bg-[#080325] text-white rounded flex items-center gap-1 text-[11px] font-bold px-2 py-1 shadow-sm">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="white"
                      stroke="none"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    {movie.avgRating || movie.rating}
                  </div>
                )}
              </div>
              {/* Info */}
              <h3 className="text-sm font-bold text-brand-text-main leading-tight mb-0.5 truncate">
                {movie.title}
              </h3>
              <p className="text-[11px] text-brand-text-sub truncate">
                {Array.isArray(movie.genre) ? movie.genre.join(" · ") : movie.genre || "Action · Drama"}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Movie Theatres Section */}
      <div id="theatres-section" className="px-5 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-brand-text-main">
            Movie Theatres
          </h2>
          <button className="text-xs text-brand-primary font-medium cursor-pointer bg-transparent border-none outline-none hover:opacity-80">
            View All
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {theatres.map((theatre) => (
            <div
              key={theatre._id || theatre.id}
              id={`theatre-card-${theatre._id || theatre.id}`}
              className="bg-white rounded-xl p-3.5 flex items-center gap-3.5 cursor-pointer transition-all duration-200 hover:shadow-md"
            >
              {/* Logo placeholder */}
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
                  <line x1="7" y1="2" x2="7" y2="22" />
                  <line x1="17" y1="2" x2="17" y2="22" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <line x1="2" y1="7" x2="7" y2="7" />
                  <line x1="2" y1="17" x2="7" y2="17" />
                  <line x1="17" y1="7" x2="22" y2="7" />
                  <line x1="17" y1="17" x2="22" y2="17" />
                </svg>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-brand-text-main mb-0.5">
                  {theatre.name}
                </h3>
                <div className="flex items-center gap-1 mb-1">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="#5B54F6"
                    stroke="none"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" fill="white" />
                  </svg>
                  <span className="text-[11px] text-brand-text-sub truncate">
                    {theatre.address || theatre.location}
                  </span>
                </div>
                <p className="text-[11px] text-brand-text-sub font-medium">
                  {theatre.basePrice ? `₹${theatre.basePrice}` : theatre.priceRange}
                </p>
              </div>

              {/* Arrow */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#cbd5e1"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="flex-shrink-0"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
