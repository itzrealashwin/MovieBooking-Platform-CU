import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import InputField from "../components/ui/InputField";
import PrimaryButton from "../components/ui/PrimaryButton";
import { authApi } from "../api/auth.api";
import { useAppDispatch } from "../store/hooks";
import { setCredentials } from "../store/slices/authSlice";

type AuthTab = "login" | "signup";

interface LoginFormData {
  email: string;
  password: string;
}

interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const loginForm = useForm<LoginFormData>({
    defaultValues: {
      email: "user@example.com",
      password: "12345"
    }
  });
  const signupForm = useForm<SignupFormData>();

  const onLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      const response = await authApi.login(data);
      if (response.success && response.user) {
        dispatch(setCredentials({ user: response.user, token: response.accessToken }));
        navigate("/");
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = () => {
    onLogin({ email: "user@example.com", password: "12345" });
  };

  const onSignup = async (data: SignupFormData) => {
    if (data.password !== data.confirmPassword) {
      signupForm.setError("confirmPassword", { message: "Passwords do not match" });
      return;
    }
    setIsLoading(true);
    setErrorMsg("");
    try {
      const response = await authApi.register(data);
      if (response.success && response.user) {
        dispatch(setCredentials({ user: response.user, token: response.accessToken }));
        navigate("/");
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="auth-page"
      className="min-h-screen flex flex-col items-center px-6 pt-12 pb-8"
      style={{ background: "#F7F8FD", maxWidth: "480px", margin: "0 auto" }}
    >
      {/* Logo */}
      <div id="auth-logo" className="flex items-center gap-1 mt-4 mb-4">
        <svg
          width="62"
          height="64"
          viewBox="0 0 62 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8.597 11.153V5.375C8.597 2.419 10.9 0 13.714 0H39.302C42.116 0 44.419 2.419 44.419 5.375V11.18C41.451 12.282 39.302 15.238 39.302 18.732V24.188H13.714V18.705C13.714 15.238 11.565 12.255 8.597 11.153ZM46.978 13.438C44.163 13.438 41.86 15.856 41.86 18.812V26.875H11.156V18.812C11.156 17.387 10.616 16.02 9.657 15.012C8.697 14.004 7.395 13.438 6.038 13.438C4.681 13.438 3.379 14.004 2.42 15.012C1.46 16.02 0.921 17.387 0.921 18.812V32.25C0.921 35.206 3.224 37.625 6.038 37.625V43H11.156V37.625H41.86H44.5H46.978C49.792 37.625 52.095 35.206 52.095 32.25V18.812C52.095 15.856 49.792 13.438 46.978 13.438Z"
            fill="#080325"
          />
        </svg>
        <svg
          width="63"
          height="64"
          viewBox="0 0 63 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7.8 11.153V5.375C7.8 2.419 10.14 0 13 0H39C41.86 0 44.2 2.419 44.2 5.375V11.18C41.184 12.282 39 15.238 39 18.732V24.188H13V18.705C13 15.238 10.816 12.255 7.8 11.153ZM46.8 13.438C43.94 13.438 41.6 15.856 41.6 18.812V26.875H10.4V18.812C10.4 17.387 9.852 16.02 8.877 15.012C7.902 14.004 6.579 13.438 5.2 13.438C3.821 13.438 2.498 14.004 1.523 15.012C0.548 16.02 0 17.387 0 18.812V32.25C0 35.206 2.34 37.625 5.2 37.625H7.5H10.4H41.6V43H46.8V37.625C49.66 37.625 52 35.206 52 32.25V18.812C52 15.856 49.66 13.438 46.8 13.438Z"
            fill="#4F46E5"
          />
        </svg>
      </div>

      {/* Title */}
      <h1
        id="auth-title"
        className="text-xl font-bold text-center text-black leading-snug mb-8 max-w-[200px]"
      >
        Creative Upaay Hiring Assignment
      </h1>

      {/* Segmented Control */}
      <div
        id="auth-tabs"
        className="w-full flex rounded-md p-1 mb-8"
        style={{ background: "#EBEBEB" }}
      >
        <button
          id="tab-login"
          type="button"
          onClick={() => setActiveTab("login")}
          className={`flex-1 py-2 text-base font-bold text-center rounded-md transition-all duration-200 cursor-pointer border-none outline-none ${
            activeTab === "login"
              ? "bg-white shadow-sm text-[#121212]"
              : "bg-transparent text-[#121212] font-medium"
          }`}
        >
          Login
        </button>
        <button
          id="tab-signup"
          type="button"
          onClick={() => setActiveTab("signup")}
          className={`flex-1 py-2 text-base font-bold text-center rounded-md transition-all duration-200 cursor-pointer border-none outline-none ${
            activeTab === "signup"
              ? "bg-white shadow-sm text-[#121212]"
              : "bg-transparent text-[#121212] font-medium"
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Login Form */}
      {activeTab === "login" && (
        <form
          id="login-form"
          onSubmit={loginForm.handleSubmit(onLogin)}
          className="w-full flex flex-col gap-5 animate-fadeIn"
        >
          <InputField
            placeholder="Email ID"
            type="email"
            {...loginForm.register("email", { required: "Email is required" })}
          />
          <InputField
            placeholder="Password"
            type="password"
            {...loginForm.register("password", {
              required: "Password is required",
            })}
          />

          {errorMsg && <p className="text-sm text-red-500 text-center">{errorMsg}</p>}
          <div className="mt-auto pt-8 flex flex-col gap-3">
            <PrimaryButton type="submit" isLoading={isLoading}>Login</PrimaryButton>
            <button 
              type="button" 
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full py-3.5 bg-white border border-brand-primary text-brand-primary font-bold text-base rounded-lg outline-none cursor-pointer hover:bg-indigo-50 transition-colors"
            >
              Direct Login (Demo)
            </button>
          </div>
        </form>
      )}

      {/* Signup Form */}
      {activeTab === "signup" && (
        <form
          id="signup-form"
          onSubmit={signupForm.handleSubmit(onSignup)}
          className="w-full flex flex-col gap-5 animate-fadeIn"
        >
          <div className="flex gap-4 w-full">
            <InputField
              placeholder="First Name"
              type="text"
              {...signupForm.register("firstName", { required: "First name is required" })}
            />
            <InputField
              placeholder="Last Name"
              type="text"
              {...signupForm.register("lastName", { required: "Last name is required" })}
            />
          </div>
          <InputField
            placeholder="Email ID"
            type="email"
            {...signupForm.register("email", {
              required: "Email is required",
            })}
          />
          <InputField
            placeholder="Password"
            type="password"
            {...signupForm.register("password", {
              required: "Password is required",
            })}
          />
          <InputField
            placeholder="Confirm Password"
            type="password"
            {...signupForm.register("confirmPassword", {
              required: "Confirm your password",
            })}
          />

          {errorMsg && <p className="text-sm text-red-500 text-center">{errorMsg}</p>}
          <div className="mt-auto pt-4">
            <PrimaryButton type="submit" isLoading={isLoading}>Sign Up</PrimaryButton>
          </div>
        </form>
      )}
    </div>
  );
}
