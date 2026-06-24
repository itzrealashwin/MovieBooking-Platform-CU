import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BottomNav from "../components/ui/BottomNav";
import PrimaryButton from "../components/ui/PrimaryButton";
import { movieApi } from "../api/movie.api";
import type { Movie } from "../store/slices/movieSlice";

export default function MovieDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [format, setFormat] = useState("2D");

  useEffect(() => {
    const fetchMovie = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const response = await movieApi.getMovieById(id);
        if (response.success && response.data) {
          setMovie(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch movie details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F6F8FA", maxWidth: "480px", margin: "0 auto" }}>
        <svg className="animate-spin h-8 w-8 text-brand-primary" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col" style={{ background: "#F6F8FA", maxWidth: "480px", margin: "0 auto" }}>
        <p className="text-brand-text-main mb-4">Movie not found</p>
        <PrimaryButton onClick={() => navigate("/")} className="w-auto px-6">Go Back</PrimaryButton>
      </div>
    );
  }

  // Format date to "10 June 2026"
  const releaseDate = new Date(movie.releaseDate);
  const formattedDate = releaseDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div
      id="movie-details-page"
      className="min-h-screen bg-white relative pb-28"
      style={{ maxWidth: "480px", margin: "0 auto" }}
    >
      {/* Hero Image */}
      <div className="relative w-full h-64">
        <img
          src={movie.bannerUrl || movie.posterUrl || `https://picsum.photos/seed/${encodeURIComponent(movie.title)}/600/900`}
          alt={movie.title}
          onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(movie.title)}/600/900`; }}
          className="w-full h-full object-cover"
        />
        {/* Top actions */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
          <button
            onClick={() => navigate("/")}
            className="text-white font-medium text-sm drop-shadow-md cursor-pointer bg-transparent border-none outline-none hover:opacity-80"
          >
            Close
          </button>
          <button className="text-white cursor-pointer bg-transparent border-none outline-none hover:opacity-80">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-md">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pt-5 bg-[#F8F9FB] min-h-[calc(100vh-16rem)]">
        {/* Header Row */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 pr-4">
            <h1 className="text-lg font-bold text-brand-text-main leading-tight mb-1">{movie.title}</h1>
            <p className="text-xs text-brand-text-sub">
              {Array.isArray(movie.genre) ? movie.genre.join(", ") : movie.genre || "Action, Sci-fi, Horror"}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className="px-2 py-0.5 border border-[#6FA4E9] text-[#4A8EE4] text-[10px] font-bold rounded">
              {movie.rating || "PG-13"}
            </span>
            <div className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#080325" stroke="none">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span className="text-sm font-bold text-[#080325]">{movie.avgRating || 5.1}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-[#5D6B82] leading-relaxed mb-6 mt-4">
          {movie.description || "A research team encounters multiple threats while exploring the depths of the ocean, including a malevolent mining operation."}
        </p>

        {/* Format */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-brand-text-main mb-3">Format Available</h3>
          <div className="flex gap-2">
            {["2D", "3D"].map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`px-3 py-1.5 rounded border text-xs font-bold transition-colors cursor-pointer ${format === f
                  ? "border-brand-primary text-brand-primary bg-white shadow-sm"
                  : "border-brand-border text-brand-primary bg-white"
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Release Date */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-brand-text-main mb-2">Release Date</h3>
          <p className="text-xs text-[#5D6B82]">{formattedDate}</p>
        </div>

        {/* Cast */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-brand-text-main mb-3">Cast</h3>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {(movie.cast?.length ? movie.cast : ["Jason Statham", "Jing Wu", "Shuya Sophia Cai"]).map((actor: string, i: number) => {
              const [firstName, ...lastNameParts] = actor.split(" ");
              return (
                <div key={i} className="flex items-center gap-3 min-w-max">
                  <div className="w-10 h-10 rounded-md bg-gray-200 overflow-hidden flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-500">{firstName[0]}</span>
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-brand-text-main leading-tight">{firstName}</p>
                    <p className="text-[13px] font-medium text-brand-text-main leading-tight">{lastNameParts.join(" ")}</p>
                    <p className="text-[10px] text-brand-text-sub mt-0.5">Actor</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-14 left-0 right-0 p-4 bg-[#F8F9FB] z-40" style={{ maxWidth: "480px", margin: "0 auto" }}>
        <PrimaryButton onClick={() => navigate(`/movies/${movie._id || movie.id}/theatres`)}>
          Get Tickets
        </PrimaryButton>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
