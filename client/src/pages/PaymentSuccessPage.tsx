import { useLocation, useNavigate } from "react-router-dom";
import QRCode from "react-qr-code";
import BottomNav from "../components/ui/BottomNav";
import PrimaryButton from "../components/ui/PrimaryButton";

export default function PaymentSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking, movie, theatre, showtime } = location.state || {};

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ background: "#F8F9FB", maxWidth: "480px", margin: "0 auto" }}>
        <h2 className="text-xl font-bold mb-4">No Booking Data</h2>
        <PrimaryButton onClick={() => navigate("/")}>Go Home</PrimaryButton>
      </div>
    );
  }

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

  const qrData = `BOOKING:${booking._id}`;

  return (
    <div className="min-h-screen relative pb-28" style={{ background: "#F8F9FB", maxWidth: "480px", margin: "0 auto" }}>
      {/* Header */}
      <div className="bg-[#F8F9FB] px-5 py-4 flex items-center justify-end sticky top-0 z-20">
        <button 
          onClick={() => navigate("/")}
          className="text-brand-text-sub font-semibold text-sm cursor-pointer bg-transparent border-none outline-none hover:opacity-80"
        >
          Close
        </button>
      </div>

      <div className="px-5 pt-2 pb-8 flex flex-col items-center">
        {/* Success Check */}
        <div className="mb-4">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="text-[#64748B] text-base font-semibold mb-6">Payment Successful!</h1>

        {/* Ticket Card */}
        <div className="w-full bg-white rounded-xl overflow-hidden border-2 border-brand-primary shadow-sm mb-6 flex flex-col">
          {/* Banner */}
          <div className="w-full h-40">
            <img 
              src={movie.bannerUrl || movie.posterUrl || `https://picsum.photos/seed/${encodeURIComponent(movie.title)}/600/900`}
              alt={movie.title} 
              onError={(e) => { e.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(movie.title)}/600/900`; }}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-5">
            <h2 className="text-xl font-bold text-brand-text-main mb-5">{movie.title}</h2>

            <div className="flex justify-between mb-5">
              <div>
                <p className="text-sm font-bold text-brand-text-main">{theatre.name}</p>
                <p className="text-xs text-[#64748B] mt-1">{formattedDate}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-brand-text-main">{showtime.screenName || "Screen"} - {showtime.format}</p>
                <p className="text-xs text-[#64748B] mt-1">{showtime.showTime}</p>
              </div>
            </div>

            <div className="flex justify-between items-start">
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

              <div className="text-right mb-6">
                <p className="text-sm font-bold text-brand-text-main">Amount Paid:</p>
                <p className="text-sm text-[#64748B] mt-0.5">₹{booking.totalAmount}</p>
              </div>
            </div>

            <div className="flex justify-between items-end mt-4">
              <div className="max-w-[120px]">
                <p className="text-[11px] text-[#94A3B8] leading-tight">Transaction Date:</p>
                <p className="text-[11px] text-[#94A3B8] leading-tight">{transactionDate}</p>
              </div>
              <div className="w-20 h-20 bg-white">
                <QRCode
                  value={qrData}
                  size={80}
                  style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  viewBox={`0 0 80 80`}
                />
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-[#94A3B8] text-center px-4">
          You may view all purchased tickets in the ticket page.
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
