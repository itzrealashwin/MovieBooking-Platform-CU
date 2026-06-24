import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import BottomNav from "../components/ui/BottomNav";
import { bookingApi } from "../api/booking.api";

export default function MyTicketsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const res = await bookingApi.getUserBookings();
      if (res.success) {
        setBookings(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      const res = await bookingApi.cancelBooking(id);
      if (res.success) {
        alert("Booking cancelled successfully.");
        fetchBookings();
      } else {
        alert(res.message || "Failed to cancel booking.");
      }
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to cancel booking.");
    }
  };

  // Filter logic based on showtime Date (roughly) or booking status
  const now = new Date();
  const upcomingBookings = bookings.filter((b) => {
    if (b.bookingStatus === "cancelled") return false;
    const showDate = new Date(b.showDate);
    // Simple check if show is in future/today
    return showDate >= new Date(now.setHours(0, 0, 0, 0));
  });

  const pastBookings = bookings.filter((b) => {
    if (b.bookingStatus === "cancelled") return true; // Show cancelled in past
    const showDate = new Date(b.showDate);
    return showDate < new Date(now.setHours(0, 0, 0, 0));
  });

  const displayBookings = activeTab === "upcoming" ? upcomingBookings : pastBookings;

  return (
    <div className="min-h-screen relative pb-28" style={{ background: "#F8F9FB", maxWidth: "480px", margin: "0 auto" }}>
      {/* Header */}
      <div className="bg-[#F8F9FB] px-4 py-4 flex items-center sticky top-0 z-20">
        <button 
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-brand-text-main font-semibold text-sm cursor-pointer bg-transparent border-none outline-none hover:opacity-80"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>
      </div>

      <div className="px-5 pt-2 pb-8">
        {/* Tabs */}
        <div className="flex gap-6 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`pb-2 text-sm font-semibold transition-colors ${
              activeTab === "upcoming" 
                ? "text-brand-primary border-b-2 border-brand-primary" 
                : "text-[#64748B]"
            }`}
          >
            My Bookings
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`pb-2 text-sm font-semibold transition-colors ${
              activeTab === "past" 
                ? "text-brand-primary border-b-2 border-brand-primary" 
                : "text-[#64748B]"
            }`}
          >
            Past Bookings
          </button>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <svg className="animate-spin h-8 w-8 text-brand-primary" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : displayBookings.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-[#64748B] text-sm">No {activeTab} bookings found.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {displayBookings.map((booking) => {
              const movie = booking.movieId;
              const theatre = booking.theatreId;
              const showtime = booking.showtimeId;

              const formattedDate = new Date(showtime.showDate).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              });

              const transactionDate = new Date(booking.createdAt).toLocaleString("en-US", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              });

              return (
                <div key={booking._id} className="w-full bg-white rounded-xl overflow-hidden border border-[#E2E8F0] shadow-sm flex flex-col relative">
                  {booking.bookingStatus === "cancelled" && (
                    <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center backdrop-blur-[1px]">
                      <span className="bg-red-100 text-red-600 px-4 py-2 font-bold rounded shadow-sm border border-red-200 transform -rotate-12 text-lg uppercase tracking-wider">Cancelled</span>
                    </div>
                  )}
                  {/* Banner */}
                  <div className="w-full h-36">
                    <img 
                      src={movie?.bannerUrl || movie?.posterUrl || `https://picsum.photos/seed/${encodeURIComponent(movie?.title || 'movie')}/600/900`} 
                      alt={movie?.title} 
                      onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(movie?.title || 'movie')}/600/900`; }}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-5">
                    <h2 className="text-lg font-bold text-brand-text-main mb-4">{movie?.title || "Movie"}</h2>

                    <div className="flex justify-between mb-4">
                      <div>
                        <p className="text-sm font-bold text-brand-text-main">{theatre?.name || "Theatre"}</p>
                        <p className="text-xs text-[#64748B] mt-1">{formattedDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-brand-text-main">
                          {showtime?.screenName || "Screen"} - {showtime?.format || "2D"}
                        </p>
                        <p className="text-xs text-[#64748B] mt-1">{showtime?.showTime}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm font-bold text-brand-text-main mb-2">Seats:</p>
                        <div className="flex flex-wrap gap-1.5 max-w-[140px]">
                          {booking.selectedSeats.map((seat: string) => (
                            <span key={seat} className="px-2 py-0.5 bg-[#64748B] text-white rounded text-xs font-semibold">
                              {seat}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-bold text-brand-text-main">Amount Paid:</p>
                        <p className="text-sm text-[#64748B] mt-0.5">₹{booking.totalAmount}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-end mt-2">
                      <div className="max-w-[130px]">
                        {activeTab === "upcoming" && booking.bookingStatus !== "cancelled" && (
                          <button 
                            onClick={() => handleCancelBooking(booking._id)}
                            className="px-3 py-1.5 border border-red-200 text-red-500 rounded text-xs font-semibold mb-3 hover:bg-red-50 transition-colors"
                          >
                            Cancel Booking
                          </button>
                        )}
                        <p className="text-[11px] text-[#94A3B8] leading-tight">Transaction Date:</p>
                        <p className="text-[11px] text-[#94A3B8] leading-tight">{transactionDate}</p>
                      </div>
                      <div className="w-[72px] h-[72px] bg-white">
                        <QRCode
                          value={`BOOKING:${booking._id}`}
                          size={72}
                          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                          viewBox={`0 0 72 72`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
