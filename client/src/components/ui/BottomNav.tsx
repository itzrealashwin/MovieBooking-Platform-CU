import { useLocation, useNavigate } from "react-router-dom";
import type { JSX } from "react/jsx-runtime";

interface NavItem {
  label: string;
  path: string;
  icon: (active: boolean) => JSX.Element;
}

const navItems: NavItem[] = [
  {
    label: "Home",
    path: "/",
    icon: (active) => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke={active ? "#5B54F6" : "#94a3b8"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: "Tickets",
    path: "/tickets",
    icon: (active) => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke={active ? "#5B54F6" : "#94a3b8"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 9a3 3 0 013-3h14a3 3 0 013 3v0a3 3 0 00-3 3v0a3 3 0 003 3v0a3 3 0 01-3 3H5a3 3 0 01-3-3v0a3 3 0 003-3v0a3 3 0 00-3-3z" />
        <path d="M13 6v2" />
        <path d="M13 16v2" />
        <path d="M13 11v2" />
      </svg>
    ),
  },
  {
    label: "Favorites",
    path: "/favorites",
    icon: (active) => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={active ? "#5B54F6" : "none"}
        stroke={active ? "#5B54F6" : "#94a3b8"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
  },
  {
    label: "Profile",
    path: "/profile",
    icon: (active) => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke={active ? "#5B54F6" : "#94a3b8"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav
      id="bottom-navigation"
      className="fixed bottom-0 left-0 right-0 w-full bg-white flex justify-around items-center py-3 border-t border-gray-200 z-50"
      style={{ maxWidth: "480px", margin: "0 auto" }}
    >
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            id={`nav-${item.label.toLowerCase()}`}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 px-3 py-1 transition-all duration-200 cursor-pointer bg-transparent border-none outline-none ${isActive ? "scale-105" : "opacity-70 hover:opacity-100"
              }`}
          >
            {item.icon(isActive)}
            <span
              className={`text-[10px] font-medium transition-colors duration-200 ${isActive ? "text-brand-primary" : "text-slate-400"
                }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
