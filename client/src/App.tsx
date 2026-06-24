import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAppSelector } from "./store/hooks";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import MovieDetailsPage from "./pages/MovieDetailsPage";
import TheatreSelectionPage from "./pages/TheatreSelectionPage";
import SelectSeatsPage from "./pages/SelectSeatsPage";
import BookingSummaryPage from "./pages/BookingSummaryPage";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import MyTicketsPage from "./pages/MyTicketsPage";
import ProfilePage from "./pages/ProfilePage";
import "./App.css";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated
  );

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated
  );

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-brand-bg font-inter">
        <Routes>
          <Route
            path="/auth"
            element={
              <AuthRoute>
                <AuthPage />
              </AuthRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/movies/:id"
            element={
              <ProtectedRoute>
                <MovieDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/movies/:id/theatres"
            element={
              <ProtectedRoute>
                <TheatreSelectionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/showtimes/:showtimeId/seats"
            element={
              <ProtectedRoute>
                <SelectSeatsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking/summary"
            element={
              <ProtectedRoute>
                <BookingSummaryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking/success"
            element={
              <ProtectedRoute>
                <PaymentSuccessPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets"
            element={
              <ProtectedRoute>
                <MyTicketsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
