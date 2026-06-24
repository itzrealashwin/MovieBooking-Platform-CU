import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BottomNav from "../components/ui/BottomNav";
import PrimaryButton from "../components/ui/PrimaryButton";
import { paymentApi } from "../api/payment.api";
import { useAppDispatch } from "../store/hooks";
import { clearSeatSelection } from "../store/slices/seatSlice";

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { booking, movie, theatre, showtime } = location.state || {};
  
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [isProcessing, setIsProcessing] = useState(false);

  const [nameOnCard, setNameOnCard] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvc, setCvc] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
    if (errors.cardNumber) setErrors((prev) => ({ ...prev, cardNumber: "" }));
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    setExpiryDate(formatted);
    if (errors.expiryDate) setErrors((prev) => ({ ...prev, expiryDate: "" }));
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "").substring(0, 4);
    setCvc(v);
    if (errors.cvc) setErrors((prev) => ({ ...prev, cvc: "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (paymentMethod === "credit_card") {
      if (!nameOnCard.trim()) {
        newErrors.nameOnCard = "Name on card is required";
      }

      const rawCard = cardNumber.replace(/\s+/g, "");
      if (rawCard.length !== 16) {
        newErrors.cardNumber = "Card number must be 16 digits";
      }

      if (expiryDate.length !== 5) {
        newErrors.expiryDate = "Expiry date must be MM/YY";
      } else {
        const [month, year] = expiryDate.split("/");
        const m = parseInt(month, 10);
        const y = parseInt(year, 10);
        const now = new Date();
        const currentYear = parseInt(now.getFullYear().toString().substring(2, 4), 10);
        const currentMonth = now.getMonth() + 1;

        if (m < 1 || m > 12) {
          newErrors.expiryDate = "Invalid month (01-12)";
        } else if (y < currentYear || (y === currentYear && m < currentMonth)) {
          newErrors.expiryDate = "Card has expired";
        }
      }

      if (cvc.length < 3 || cvc.length > 4) {
        newErrors.cvc = "CVC must be 3 or 4 digits";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ background: "#F8F9FB", maxWidth: "480px", margin: "0 auto" }}>
        <h2 className="text-xl font-bold mb-4">No Booking Found</h2>
        <p className="text-gray-500 mb-6">Your session may have expired or you haven't created a booking yet.</p>
        <PrimaryButton onClick={() => navigate("/")}>Go Home</PrimaryButton>
      </div>
    );
  }

  const handleCompletePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Initiate Payment
      const initRes = await paymentApi.initiatePayment({
        bookingId: booking._id,
        method: paymentMethod,
      });

      if (!initRes.success) {
        throw new Error(initRes.message);
      }
      
      // 2. Verify Payment (simulated success)
      const verifyRes = await paymentApi.verifyPayment({
        bookingId: booking._id,
        paymentSuccess: true, // Mocking success
      });

      if (verifyRes.success) {
        dispatch(clearSeatSelection());
        // Navigate to PaymentSuccessPage with booking details
        navigate("/booking/success", { state: { booking, movie, theatre, showtime } });
      } else {
        throw new Error(verifyRes.message);
      }
    } catch (error: any) {
      console.error("Payment failed:", error);
      alert(error.response?.data?.message || error.message || "Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
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
          <div className="h-full bg-brand-primary rounded-full" style={{ width: "100%" }} />
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pt-5 pb-8">
        <h1 className="text-xl font-bold text-brand-text-main mb-6">Checkout</h1>

        {/* Summary */}
        <h2 className="text-base font-bold text-brand-text-main mb-4">Summary</h2>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-[#64748B] font-medium">{booking.numberOfTickets}x Tickets</span>
            <span className="text-sm text-brand-text-main font-medium">₹{booking.baseFare}</span>
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-[#64748B] font-medium">Booking Fee</span>
            <span className="text-sm text-brand-text-main font-medium">₹{booking.platformFee}</span>
          </div>
          <div className="flex justify-between items-center mb-5 pb-5 border-b border-[#CBD5E1]">
            <span className="text-sm text-[#64748B] font-medium">Taxes</span>
            <span className="text-sm text-brand-text-main font-medium">₹{booking.taxes}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-base font-bold text-brand-text-main">Total</span>
            <span className="text-base font-bold text-brand-text-main">₹{booking.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleCompletePayment} noValidate>
          <h2 className="text-base font-bold text-brand-text-main mb-4">Choose payment method</h2>
          
          <div className="flex items-center gap-6 mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="paymentMethod" 
                value="credit_card" 
                checked={paymentMethod === "credit_card"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4 text-brand-primary border-gray-300 focus:ring-brand-primary"
              />
              <span className="text-sm font-medium text-brand-text-main">Credit/Debit Card</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="paymentMethod" 
                value="mobile_wallet" 
                checked={paymentMethod === "mobile_wallet"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4 text-brand-primary border-gray-300 focus:ring-brand-primary"
              />
              <span className="text-sm font-medium text-brand-text-main">Mobile Wallet</span>
            </label>
          </div>

          {paymentMethod === "credit_card" && (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-medium text-brand-text-main mb-1.5">Name on card</label>
                <input 
                  type="text" 
                  placeholder="Name on card" 
                  value={nameOnCard}
                  onChange={(e) => {
                    setNameOnCard(e.target.value);
                    if (errors.nameOnCard) setErrors((prev) => ({ ...prev, nameOnCard: "" }));
                  }}
                  className={`w-full px-3 py-2.5 text-sm bg-white border ${errors.nameOnCard ? "border-red-500 focus:border-red-500" : "border-[#CBD5E1] focus:border-brand-primary"} rounded outline-none transition-colors`}
                />
                {errors.nameOnCard && <p className="text-red-500 text-xs mt-1">{errors.nameOnCard}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-text-main mb-1.5">Card number</label>
                <input 
                  type="text" 
                  placeholder="1234 5678 9012 3456" 
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  maxLength={19}
                  className={`w-full px-3 py-2.5 text-sm bg-white border ${errors.cardNumber ? "border-red-500 focus:border-red-500" : "border-[#CBD5E1] focus:border-brand-primary"} rounded outline-none transition-colors`}
                />
                {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-brand-text-main mb-1.5">Expiry date</label>
                  <input 
                    type="text" 
                    placeholder="MM/YY" 
                    value={expiryDate}
                    onChange={handleExpiryChange}
                    maxLength={5}
                    className={`w-full px-3 py-2.5 text-sm bg-white border ${errors.expiryDate ? "border-red-500 focus:border-red-500" : "border-[#CBD5E1] focus:border-brand-primary"} rounded outline-none transition-colors`}
                  />
                  {errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>}
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-brand-text-main mb-1.5">CVC/CVV</label>
                  <input 
                    type="text" 
                    placeholder="CVC" 
                    value={cvc}
                    onChange={handleCvcChange}
                    maxLength={4}
                    className={`w-full px-3 py-2.5 text-sm bg-white border ${errors.cvc ? "border-red-500 focus:border-red-500" : "border-[#CBD5E1] focus:border-brand-primary"} rounded outline-none transition-colors`}
                  />
                  {errors.cvc && <p className="text-red-500 text-xs mt-1">{errors.cvc}</p>}
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 mb-8">
            <input 
              type="checkbox" 
              id="saveDetails" 
              className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
            />
            <label htmlFor="saveDetails" className="text-xs text-brand-text-main cursor-pointer select-none">
              Save payment details for the next purchase
            </label>
          </div>

          <PrimaryButton type="submit" disabled={isProcessing}>
            {isProcessing ? "Processing..." : "Complete Payment"}
          </PrimaryButton>
        </form>
      </div>

      <BottomNav />
    </div>
  );
}
