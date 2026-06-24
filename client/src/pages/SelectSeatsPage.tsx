import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import BottomNav from "../components/ui/BottomNav";
import PrimaryButton from "../components/ui/PrimaryButton";
import { seatApi } from "../api/seat.api";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { toggleSeat, setSeatPrice, clearSeatSelection } from "../store/slices/seatSlice";

interface RouteState {
  movie: any;
  theatre: any;
  showtime: any;
}

export default function SelectSeatsPage() {
  const { showtimeId } = useParams<{ showtimeId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { movie, theatre, showtime } = (location.state as RouteState) || {};

  const [seats, setSeats] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLocking, setIsLocking] = useState(false);

  const dispatch = useAppDispatch();
  const selectedSeats = useAppSelector((state) => state.seat.selectedSeats);
  const totalPrice = useAppSelector((state) => state.seat.totalPrice);
  const MAX_SEATS_PER_BOOKING = 6;

  // Initialize seat price and clear selection on mount if new showtime
  useEffect(() => {
    const ticketPrice = showtime?.ticketPrice || 140;
    dispatch(setSeatPrice(ticketPrice));
    // Usually we would clear selection when loading a fresh page:
    // dispatch(clearSeatSelection());
  }, [dispatch, showtime]);

  useEffect(() => {
    const fetchSeats = async () => {
      if (!showtimeId) return;
      setIsLoading(true);
      try {
        const response = await seatApi.getShowtimeSeats(showtimeId);
        if (response.success && Object.keys(response.data).length > 0) {
          setSeats(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch seats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSeats();
  }, [showtimeId]);

  const handleToggleSeat = (seat: any) => {
    if (seat.effectiveStatus === "occupied") return;

    const isAlreadySelected = selectedSeats.some((s) => s.seatNumber === seat.seatNumber);
    if (!isAlreadySelected && selectedSeats.length >= MAX_SEATS_PER_BOOKING) {
      alert(`You can only select up to ${MAX_SEATS_PER_BOOKING} seats per transaction.`);
      return;
    }

    dispatch(toggleSeat({
      seatNumber: seat.seatNumber,
      rowLabel: seat.rowLabel,
      columnNumber: seat.columnNumber
    }));
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
          <div className="h-full bg-brand-primary rounded-full" style={{ width: "60%" }} />
        </div>
      </div>

      {/* Info Header */}
      <div className="px-5 pt-5 bg-[#F8F9FB]">
        <h1 className="text-lg font-bold text-brand-text-main mb-1 border-b-2 border-brand-primary inline-block pb-0.5">
          Select Seats
        </h1>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-brand-text-main">
              {showtime?.screenName || "Screen 1"}
            </span>
            <span className="text-sm font-semibold text-brand-primary">
              {showtime?.showTime || "10:00 AM"}
            </span>
          </div>
          <span className="text-sm font-bold text-brand-text-main">
            ₹{totalPrice || "0"}
          </span>
        </div>
      </div>

      {/* Screen Graphic */}
      <div className="px-5 pt-8 pb-4 flex flex-col items-center">
        <div className="w-[80%] h-6 border-t-4 border-[#CBD5E1] rounded-[100%] mx-auto opacity-70"></div>
        <p className="text-[10px] font-semibold text-[#94A3B8] tracking-widest mt-1">SCREEN</p>
      </div>

      {/* Seat Map */}
      <div className="px-2 pb-6 overflow-x-auto scrollbar-hide">
        <div className="flex flex-col items-center min-w-max pb-4">
          {isLoading ? (
            <div className="py-20">
              <svg className="animate-spin h-8 w-8 text-brand-primary" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : (
            <>
              {/* Rows A-H */}
              <div className="flex flex-col gap-2 mb-6">
                {["A", "B", "C", "D", "E", "F", "G", "H"].map((row) => (
                  <div key={row} className="flex items-center gap-3">
                    <span className="w-4 text-xs font-semibold text-brand-text-main text-right shrink-0">{row}</span>
                    <div className="flex gap-1.5">
                      {(seats[row] || []).map((seat) => {
                        const isSelected = selectedSeats.some((s) => s.seatNumber === seat.seatNumber);
                        const isOccupied = seat.effectiveStatus === "occupied";
                        return (
                          <button
                            key={seat.seatNumber}
                            onClick={() => handleToggleSeat(seat)}
                            className={`w-[26px] h-[26px] rounded flex items-center justify-center text-[10px] font-medium transition-colors cursor-pointer border ${isOccupied
                                ? "bg-[#94A3B8] border-[#94A3B8] text-white cursor-not-allowed"
                                : isSelected
                                  ? "bg-brand-primary border-brand-primary text-white"
                                  : "bg-white border-[#CBD5E1] text-[#94A3B8] hover:border-brand-primary"
                              }`}
                          >
                            {seat.columnNumber}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Rows J-M */}
              <div className="flex flex-col gap-2 border-b border-gray-200 pb-8">
                {["J", "K", "L", "M"].map((row) => (
                  <div key={row} className="flex items-center gap-3">
                    <span className="w-4 text-xs font-semibold text-brand-text-main text-right shrink-0">{row}</span>
                    <div className="flex gap-1.5">
                      {(seats[row] || []).map((seat) => {
                        const isSelected = selectedSeats.some((s) => s.seatNumber === seat.seatNumber);
                        const isOccupied = seat.effectiveStatus === "occupied";
                        return (
                          <button
                            key={seat.seatNumber}
                            onClick={() => handleToggleSeat(seat)}
                            className={`w-[26px] h-[26px] rounded flex items-center justify-center text-[10px] font-medium transition-colors cursor-pointer border ${isOccupied
                                ? "bg-[#94A3B8] border-[#94A3B8] text-white cursor-not-allowed"
                                : isSelected
                                  ? "bg-brand-primary border-brand-primary text-white"
                                  : "bg-white border-[#CBD5E1] text-[#94A3B8] hover:border-brand-primary"
                              }`}
                          >
                            {seat.columnNumber}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border border-[#CBD5E1] bg-white"></div>
              <span className="text-[11px] font-medium text-[#64748B]">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-[#94A3B8]"></div>
              <span className="text-[11px] font-medium text-[#64748B]">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-brand-primary"></div>
              <span className="text-[11px] font-medium text-brand-primary">Selected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-14 left-0 right-0 p-4 bg-[#F8F9FB] z-40" style={{ maxWidth: "480px", margin: "0 auto" }}>
        <PrimaryButton
          onClick={async () => {
            setIsLocking(true);
            try {
              await seatApi.lockSeats({
                showtimeId: showtime._id || showtime.id,
                seatNumbers: selectedSeats.map((s) => s.seatNumber),
              });
              navigate("/booking/summary", { state: { movie, theatre, showtime } });
            } catch (error: any) {
              console.error("Failed to lock seats:", error);
              alert(error.response?.data?.message || "Failed to hold seats. They may have been taken.");
              // Optional: trigger a re-fetch of seats here
            } finally {
              setIsLocking(false);
            }
          }}
          disabled={selectedSeats.length === 0 || isLocking}
          className={selectedSeats.length === 0 || isLocking ? "opacity-50 cursor-not-allowed" : ""}
        >
          {isLocking ? "Holding Seats..." : "View Booking Summary"}
        </PrimaryButton>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
