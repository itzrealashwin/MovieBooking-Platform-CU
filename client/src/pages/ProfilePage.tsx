import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { clearCredentials } from "../store/slices/authSlice";
import BottomNav from "../components/ui/BottomNav";

export default function ProfilePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      dispatch(clearCredentials());
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen relative pb-28" style={{ background: "#F8F9FB", maxWidth: "480px", margin: "0 auto" }}>
      {/* Header */}
      <div className="bg-[#F8F9FB] px-5 py-6 flex items-center justify-center sticky top-0 z-20">
        <h1 className="text-xl font-bold text-brand-text-main">My Profile</h1>
      </div>

      <div className="px-5 pt-4 pb-8 flex flex-col items-center">
        {/* Avatar Placeholder */}
        <div className="w-24 h-24 rounded-full bg-brand-primary text-white flex items-center justify-center text-3xl font-bold mb-6 shadow-md">
          {user?.firstName?.[0]?.toUpperCase() || "U"}
          {user?.lastName?.[0]?.toUpperCase() || ""}
        </div>

        {/* User Info */}
        <h2 className="text-2xl font-bold text-brand-text-main mb-1">
          {user?.firstName} {user?.lastName}
        </h2>
        <p className="text-sm text-[#64748B] mb-8">{user?.email}</p>

        {/* Details Card */}
        <div className="w-full bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 mb-8">
          <div className="flex justify-between items-center py-3 border-b border-[#E2E8F0]">
            <span className="text-sm font-semibold text-[#64748B]">Role</span>
            <span className="text-sm font-bold text-brand-text-main capitalize">{user?.role || "User"}</span>
          </div>
          <div className="flex justify-between items-center py-3">
            <span className="text-sm font-semibold text-[#64748B]">Member Since</span>
            <span className="text-sm font-bold text-brand-text-main">2026</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-4">
          <button
            onClick={() => navigate("/tickets")}
            className="w-full py-3.5 bg-white border border-[#CBD5E1] text-brand-text-main font-bold text-sm rounded-lg outline-none cursor-pointer transition-colors hover:border-brand-primary"
          >
            My Bookings
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-3.5 bg-red-50 text-red-600 font-bold text-sm rounded-lg outline-none cursor-pointer transition-colors hover:bg-red-100"
          >
            Logout
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
