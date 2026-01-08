"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import Hyperspeed to avoid SSR issues with Three.js
const Hyperspeed = dynamic(() => import("@/components/Hyperspeed"), {
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-black" />,
});

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState<string | null>(null);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setError(error.message);
            } else {
                router.push("/");
                router.refresh();
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) {
                setError(error.message);
            } else {
                setSuccess("Password reset email sent! Check your inbox.");
            }
        } catch (err) {
            setError("An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex overflow-hidden">
            {/* Left Side - Hyperspeed Animation */}
            <div className="hidden lg:flex lg:w-[55%] relative bg-black">
                <Hyperspeed />

                {/* Content overlay - Cinematic layout */}
                <div className="absolute inset-0 flex flex-col justify-between p-10 z-10 pointer-events-none">
                    {/* Top-left Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-[#3b82f6] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                            <svg
                                className="w-5 h-5 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                            </svg>
                        </div>
                        <span className="text-white text-xl font-bold tracking-tight">Elion AI</span>
                    </div>

                    {/* Bottom-left Text content */}
                    <div className="max-w-lg">
                        <h2 className="text-white text-5xl font-bold mb-5 leading-[1.1] tracking-tight">
                            Transform Every Call
                            <br />
                            <span className="bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent">Into Success</span>
                        </h2>
                        <p className="text-white/60 text-base leading-relaxed">
                            Intelligent voice agents that understand, engage, and convert.
                            Available 24/7, never missing an opportunity.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form (White Background) */}
            <div className="w-full lg:w-[45%] flex items-center justify-center bg-white p-8 relative">
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#3b82f6]/5 rounded-full blur-3xl" />
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#3b82f6]/5 rounded-full blur-3xl" />
                </div>

                <div className="w-full max-w-md relative z-10">
                    {/* Mobile Logo - only shown on small screens */}
                    <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
                        <div className="w-12 h-12 bg-[#3b82f6] rounded-xl flex items-center justify-center">
                            <svg
                                className="w-6 h-6 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                            </svg>
                        </div>
                        <span className="text-[#0f172a] text-2xl font-bold">Elion AI</span>
                    </div>

                    {/* Welcome text */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-[#0f172a] mb-2">
                            {showForgotPassword ? "Reset Password" : "Welcome back"}
                        </h1>
                        <p className="text-gray-500">
                            {showForgotPassword
                                ? "Enter your email and we'll send you a reset link"
                                : "Enter your credentials to access your dashboard"}
                        </p>
                    </div>

                    {/* Login / Forgot Password Form */}
                    <form
                        onSubmit={showForgotPassword ? handleForgotPassword : handleLogin}
                        className="space-y-5"
                    >
                        {/* Email Field */}
                        <div className="relative">
                            <label
                                htmlFor="email"
                                className={`absolute left-4 transition-all duration-200 pointer-events-none ${focused === "email" || email
                                    ? "top-2 text-xs text-[#3b82f6]"
                                    : "top-1/2 -translate-y-1/2 text-gray-400"
                                    }`}
                            >
                                Email Address
                            </label>
                            <div className="relative">
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onFocus={() => setFocused("email")}
                                    onBlur={() => setFocused(null)}
                                    className={`w-full px-4 pt-6 pb-3 bg-gray-50 border-2 rounded-xl text-[#0f172a] transition-all duration-200 focus:outline-none ${focused === "email"
                                        ? "border-[#3b82f6] bg-blue-50/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                                        : "border-gray-200 hover:border-gray-300"
                                        }`}
                                    required
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Password Field - Only show if not in forgot password mode */}
                        {!showForgotPassword && (
                            <div className="relative">
                                <label
                                    htmlFor="password"
                                    className={`absolute left-4 transition-all duration-200 pointer-events-none z-10 ${focused === "password" || password
                                        ? "top-2 text-xs text-[#3b82f6]"
                                        : "top-1/2 -translate-y-1/2 text-gray-400"
                                        }`}
                                >
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setFocused("password")}
                                        onBlur={() => setFocused(null)}
                                        className={`w-full px-4 pt-6 pb-3 bg-gray-50 border-2 rounded-xl text-[#0f172a] transition-all duration-200 focus:outline-none ${focused === "password"
                                            ? "border-[#3b82f6] bg-blue-50/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                                            : "border-gray-200 hover:border-gray-300"
                                            }`}
                                        required
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        <svg
                                            className="w-5 h-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Forgot Password Link */}
                        {!showForgotPassword && (
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForgotPassword(true);
                                        setError(null);
                                        setSuccess(null);
                                    }}
                                    className="text-sm text-[#3b82f6] hover:text-[#2563eb] font-medium transition-colors"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
                                <svg
                                    className="w-5 h-5 flex-shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                {error}
                            </div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 text-green-600 text-sm">
                                <svg
                                    className="w-5 h-5 flex-shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                {success}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 px-4 bg-[#3b82f6] text-white font-semibold rounded-xl relative overflow-hidden group transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                fill="none"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        {showForgotPassword ? "Sending..." : "Signing in..."}
                                    </>
                                ) : (
                                    <>
                                        {showForgotPassword ? "Send Reset Link" : "Sign In"}
                                        <svg
                                            className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13 7l5 5m0 0l-5 5m5-5H6"
                                            />
                                        </svg>
                                    </>
                                )}
                            </span>
                            {/* Hover gradient effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-[#2563eb] to-[#3b82f6] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </button>

                        {/* Back to Login (when in forgot password mode) */}
                        {showForgotPassword && (
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForgotPassword(false);
                                    setError(null);
                                    setSuccess(null);
                                }}
                                className="w-full py-3 text-gray-500 hover:text-[#0f172a] font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                    />
                                </svg>
                                Back to Sign In
                            </button>
                        )}
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-8">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-gray-400 text-sm">Secure login</span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {/* Security badges */}
                    <div className="flex items-center justify-center gap-6 text-gray-400">
                        <div className="flex items-center gap-2 text-xs">
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                />
                            </svg>
                            256-bit SSL
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                            </svg>
                            Encrypted
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
