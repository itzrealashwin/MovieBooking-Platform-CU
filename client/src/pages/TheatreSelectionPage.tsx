import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BottomNav from "../components/ui/BottomNav";
import { movieApi } from "../api/movie.api";
import { theatreApi } from "../api/theatre.api";
import { showtimeApi } from "../api/showtime.api";

export default function TheatreSelectionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<any | null>(null);
  const [theatres, setTheatres] = useState<any[]>([]);
  const [showtimesByTheatre, setShowtimesByTheatre] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Generate next 7 days
  const [dates, setDates] = useState<{ date: Date; dayStr: string; dateNum: string; fullDate: string }[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");

  useEffect(() => {
    // Generate dates
    const today = new Date();
    const nextDates = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayStr = d.toLocaleDateString("en-US", { weekday: "short" });
      const dateNum = d.getDate().toString().padStart(2, "0");
      const fullDate = d.toISOString().split("T")[0]; // YYYY-MM-DD
      return { date: d, dayStr, dateNum, fullDate };
    });
    setDates(nextDates);
    setSelectedDate(nextDates[0].fullDate);

    const fetchInitialData = async () => {
      if (!id) return;
      try {
        const [movieRes, theatreRes] = await Promise.all([
          movieApi.getMovieById(id),
          theatreApi.getTheatres()
        ]);
        if (movieRes.success) setMovie(movieRes.data);
        if (theatreRes.success) setTheatres(theatreRes.data);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      }
    };
    fetchInitialData();
  }, [id]);

  // Fetch showtimes when selectedDate changes
  useEffect(() => {
    const fetchShowtimes = async () => {
      if (!id || !selectedDate) return;
      setIsLoading(true);
      try {
        const res = await showtimeApi.getShowtimes({ movieId: id, date: selectedDate });
        if (res.success && res.data) {
          // Group showtimes by theatre ID
          const grouped: Record<string, any[]> = {};
          res.data.forEach((st) => {
            const tId = st.theatreId._id || st.theatreId;
            if (!grouped[tId]) grouped[tId] = [];
            grouped[tId].push(st);
          });
          setShowtimesByTheatre(grouped);
        }
      } catch (err) {
        console.error("Failed to fetch showtimes:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchShowtimes();
  }, [id, selectedDate]);

  if (!movie && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8F9FB", maxWidth: "480px", margin: "0 auto" }}>
        <svg className="animate-spin h-8 w-8 text-brand-primary" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col" style={{ background: "#F8F9FB", maxWidth: "480px", margin: "0 auto" }}>
        <p className="text-brand-text-main mb-4">Movie not found</p>
        <button onClick={() => navigate("/")} className="px-6 py-2 bg-brand-primary text-white rounded">Go Back</button>
      </div>
    );
  }

  // Determine theatres to show:
  const displayTheatres = theatres;

  return (
    <div
      id="theatre-selection-page"
      className="min-h-screen relative pb-24"
      style={{ background: "#F8F9FB", maxWidth: "480px", margin: "0 auto" }}
    >
      {/* Header Image */}
      <div className="relative w-full h-44 overflow-hidden">
        <img
          src={movie.bannerUrl || movie.posterUrl || `https://picsum.photos/seed/${encodeURIComponent(movie.title)}/600/900`}
          alt={movie.title}
          onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(movie.title)}/600/900`; }}
          className="w-full h-full object-cover"
        />
        {/* Dark blur overlay */}
        <div className="absolute inset-0 bg-[#080325]/60 backdrop-blur-[2px]" />

        {/* Top actions */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white font-semibold text-sm cursor-pointer bg-transparent border-none outline-none hover:opacity-80"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back
          </button>
          <button 
            onClick={() => navigate("/")}
            className="text-white font-semibold text-sm cursor-pointer bg-transparent border-none outline-none hover:opacity-80"
          >
            Cancel
          </button>
        </div>

        {/* Movie Info */}
        <div className="absolute bottom-4 left-4 z-10">
          <h1 className="text-white text-lg font-bold leading-tight mb-0.5">{movie.title}</h1>
          <p className="text-white/80 text-xs font-medium">
            {Array.isArray(movie.genre) ? movie.genre.join(", ") : movie.genre || "Action, Sci-fi, Horror"}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 bg-gray-200 mt-4 px-6 mb-6">
        <div className="h-1.5 w-full bg-[#E2E8F0] rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-brand-primary rounded-full" style={{ width: "20%" }} />
        </div>
      </div>

      {/* Content */}
      <div className="px-5">
        <h2 className="text-base font-bold text-brand-text-main mb-4">Select Movie Theatre</h2>

        {/* Date Selector */}
        <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide border-b border-gray-200 mb-6">
          {dates.map((d) => {
            const isSelected = selectedDate === d.fullDate;
            return (
              <button
                key={d.fullDate}
                onClick={() => setSelectedDate(d.fullDate)}
                className="flex flex-col items-center gap-1.5 cursor-pointer bg-transparent border-none outline-none"
              >
                <span className={`text-[11px] font-semibold ${isSelected ? "text-brand-primary" : "text-brand-text-sub"}`}>
                  {d.dayStr}
                </span>
                <div className={`w-9 h-9 rounded flex items-center justify-center border transition-colors ${
                  isSelected 
                    ? "bg-brand-primary border-brand-primary text-white" 
                    : "bg-white border-brand-border text-brand-text-main"
                }`}>
                  <span className="text-sm font-semibold">{d.dateNum}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Theatres List */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <svg className="animate-spin h-6 w-6 text-brand-primary" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {displayTheatres.map((theatre) => {
              const tId = theatre._id || theatre.id;
              const showtimes = showtimesByTheatre[tId] || [];
              
              return (
                <div
                  key={tId}
                  className="bg-white rounded-xl p-3.5 flex flex-col gap-3 cursor-pointer transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex items-center gap-3.5">
                    {/* Logo placeholder */}
                    <div className="w-14 h-14 rounded-lg bg-[#F8F9FB] flex items-center justify-center flex-shrink-0">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#080325" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
                      <h3 className="text-[13px] font-bold text-brand-text-main mb-0.5">
                        {theatre.name}
                      </h3>
                      <div className="flex items-center gap-1 mb-1.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span className="text-[11px] text-[#64748B] font-medium truncate">
                          {theatre.address || theatre.location}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#64748B] font-semibold">
                        {theatre.basePrice && typeof theatre.basePrice === "number" ? `₹${theatre.basePrice}` : theatre.basePrice || theatre.priceRange}
                      </p>
                    </div>
                  </div>

                  {/* Showtimes Bubble (only if showtimes exist) */}
                  {showtimes.length > 0 && (
                    <div className="flex gap-2 flex-wrap pt-2 border-t border-gray-100">
                      {showtimes.map((st, i) => (
                        <button
                          key={i}
                          onClick={() => navigate(`/showtimes/${st._id || st.id}/seats`, { state: { movie, theatre, showtime: st } })}
                          className="px-3 py-1.5 border border-brand-primary text-brand-primary rounded text-xs font-semibold bg-white hover:bg-brand-primary hover:text-white transition-colors cursor-pointer"
                        >
                          {st.showTime}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
