import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BottomNav from "../components/ui/BottomNav";
import PrimaryButton from "../components/ui/PrimaryButton";
import { useAppSelector } from "../store/hooks";
import { bookingApi } from "../api/booking.api";

export default function BookingSummaryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { movie, theatre, showtime } = location.state || {};
  
  const selectedSeats = useAppSelector((state) => state.seat.selectedSeats);
  const totalPrice = useAppSelector((state) => state.seat.totalPrice);
  const [isLoading, setIsLoading] = useState(false);

  // If missing critical data, redirect to home
  if (!movie || !theatre || !showtime || selectedSeats.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ background: "#F8F9FB", maxWidth: "480px", margin: "0 auto" }}>
        <h2 className="text-xl font-bold mb-4">Incomplete Booking Details</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't selected seats yet or refreshed the page.</p>
        <PrimaryButton onClick={() => navigate("/")}>Go Home</PrimaryButton>
      </div>
    );
  }

  const bookingFee = 50; // As per backend logic for platform fee
  // Taxes are calc'd on backend as 18% of total price. The UI here might just be rough estimate or just what backend does.
  // Wait, backend: baseFare = showtime.ticketPrice * len. platformFee = 50. taxes = 18%. 
  // We can just show Tickets + Booking Fee = Total roughly, or wait for backend. 
  // The backend handles exactly: baseFare + platformFee + taxes.
  // We will replicate the approximate UI for the user, but the actual total will be defined by backend when creating booking.
  const taxes = Math.round(totalPrice * 0.18 * 100) / 100;
  const finalTotal = totalPrice + bookingFee + taxes;

  // Format date: "Friday, October 10"
  const formattedDate = new Date(showtime.showDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const handleProceedToPayment = async () => {
    setIsLoading(true);
    try {
      const response = await bookingApi.createBooking({
        showtimeId: showtime._id || showtime.id,
        selectedSeats: selectedSeats.map((s) => s.seatNumber),
      });

      if (response.success) {
        // Navigate to checkout passing the booking details
        navigate("/booking/checkout", {
          state: {
            booking: response.data,
            movie,
            theatre,
            showtime
          }
        });
      } else {
        alert(response.message || "Failed to create booking");
      }
    } catch (error: any) {
      console.error("Booking failed:", error);
      alert(error.response?.data?.message || "Something went wrong creating the booking.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative pb-28" style={{ background: "#F8F9FB", maxWidth: "480px", margin: "0 auto" }}>
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center justify-between sticky top-0 z-20">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-brand-text-main font-semibold text-sm cursor-pointer bg-transparent border-none outline-none hover:opacity-80"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>
        <button 
          onClick={() => navigate("/")}
          className="text-brand-text-sub font-semibold text-sm cursor-pointer bg-transparent border-none outline-none hover:opacity-80"
        >
          Cancel
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 bg-white px-6 pb-4 border-b border-gray-100">
        <div className="h-1.5 w-full bg-[#E2E8F0] rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-brand-primary rounded-full" style={{ width: "80%" }} />
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pt-5 pb-8">
        <h1 className="text-xl font-bold text-brand-text-main mb-4">Booking Summary</h1>

        {/* Movie Banner */}
        <div className="w-full h-40 rounded-xl overflow-hidden mb-5">
          <img 
            src={movie.bannerUrl || movie.posterUrl || `https://picsum.photos/seed/${encodeURIComponent(movie.title)}/600/900`} 
            alt={movie.title} 
            onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(movie.title)}/600/900`; }}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Movie Details */}
        <h2 className="text-2xl font-bold text-brand-text-main mb-3">{movie.title}</h2>
        
        <div className="flex flex-wrap items-center gap-4 mb-4 text-sm font-medium text-[#64748B]">
          <div className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {theatre.name}
          </div>
          <div className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {formattedDate}
          </div>
        </div>

        {/* Screen / Time / Format */}
        <div className="flex items-center gap-4 mb-5 text-sm font-semibold text-brand-text-main">
          <span>{showtime?.screenId?.screenName || showtime?.screenName || "Screen"}</span>
          <span className="text-[#64748B]">{showtime.showTime}</span>
          <span className="text-[#64748B]">{showtime.format}</span>
        </div>

        {/* Seats */}
        <div className="flex items-start gap-4 mb-8">
          <span className="text-sm font-bold text-brand-text-main mt-1">Seats</span>
          <div className="flex flex-wrap gap-2">
            {selectedSeats.map((seat) => (
              <div 
                key={seat.seatNumber} 
                className="px-3 py-1 bg-[#94A3B8] text-white rounded text-xs font-semibold"
              >
                {seat.seatNumber}
              </div>
            ))}
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="border-t border-[#CBD5E1] pt-6 mb-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-brand-text-main font-medium">{selectedSeats.length}x Tickets</span>
            <span className="text-sm text-brand-text-main font-medium">₹{totalPrice}</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-brand-text-main font-medium">Booking Fee</span>
            <span className="text-sm text-brand-text-main font-medium">₹{bookingFee}</span>
          </div>
          <div className="flex justify-between items-center mb-5">
            <span className="text-sm text-brand-text-main font-medium">Taxes (18%)</span>
            <span className="text-sm text-brand-text-main font-medium">₹{taxes.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="border-t border-[#CBD5E1] pt-4 mb-6 flex justify-between items-center">
          <span className="text-lg font-bold text-brand-text-main">Total</span>
          <span className="text-lg font-bold text-brand-text-main">₹{finalTotal.toFixed(2)}</span>
        </div>

        {/* Proceed Button */}
        <PrimaryButton onClick={handleProceedToPayment} disabled={isLoading}>
          {isLoading ? "Creating Booking..." : "Proceed to Payment"}
        </PrimaryButton>
      </div>

      <BottomNav />
    </div>
  );
}
