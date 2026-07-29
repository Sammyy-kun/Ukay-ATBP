"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Shirt, Mail, Lock, Store, User, ArrowRight, Loader2 } from "lucide-react";
import { CoatLogo } from "./CoatLogo";

export function AuthScreen({ onBack }: { onBack?: () => void }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPasscodePrompt, setShowPasscodePrompt] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [passcodeError, setPasscodeError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput === "083104") {
      setShowPasscodePrompt(false);
      setIsSignUp(true);
      setPasscodeError(null);
      setPasscodeInput("");
    } else {
      setPasscodeError("Invalid access code.");
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              store_name: storeName,
            },
          },
        });
        if (error) throw error;
        if (data.session) {
          // auto signed in
        } else {
          setSuccessMsg("Account created! Please check your email to confirm registration.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-12">
      {onBack && (
        <button 
          onClick={onBack}
          className="absolute left-4 top-4 sm:left-8 sm:top-8 text-sm font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          ← Back to store
        </button>
      )}
      <div className="w-full max-w-md space-y-6">
        {/* Header Logo */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-900 shadow-sm">
            <Shirt className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-4 flex items-center justify-center gap-1.5 text-2xl font-bold tracking-tight text-neutral-900">
            {showPasscodePrompt ? (
              "Enter Access Code"
            ) : isSignUp ? (
              "Create your store account"
            ) : (
              <>
                Welcome back to <CoatLogo className="text-3xl font-normal -mt-1" />
              </>
            )}
          </h2>
          <p className="mt-1.5 text-sm text-neutral-500">
            {showPasscodePrompt
              ? "You need an invite code to create a seller account"
              : isSignUp
              ? "Start tracking and selling your thrift items today"
              : "Sign in to manage your store inventory"}
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          {showPasscodePrompt ? (
            <form onSubmit={handlePasscodeSubmit} className="space-y-4">
              {passcodeError && (
                <div className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-200">
                  {passcodeError}
                </div>
              )}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-600">Access Code</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="password"
                    required
                    placeholder="Enter invite code"
                    value={passcodeInput}
                    onChange={(e) => setPasscodeInput(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 py-2.5 pl-9 pr-3 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="rounded-lg bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-200">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="rounded-lg bg-green-50 p-3 text-xs font-medium text-green-700 border border-green-200">
                  {successMsg}
                </div>
              )}

              {isSignUp && (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-neutral-600">Full Name</label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="text"
                        required
                        placeholder="Jane Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full rounded-lg border border-neutral-200 py-2.5 pl-9 pr-3 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-neutral-600">Store Name</label>
                    <div className="relative">
                      <Store className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="text"
                        required
                        placeholder="Manila Thrift Shop"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        className="w-full rounded-lg border border-neutral-200 py-2.5 pl-9 pr-3 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-600">Email Address</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="email"
                    required
                    placeholder="seller@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 py-2.5 pl-9 pr-3 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-600">Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-neutral-200 py-2.5 pl-9 pr-3 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span>{isSignUp ? "Create Account" : "Sign In"}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-5 border-t border-neutral-100 pt-4 text-center">
            <button
              onClick={() => {
                if (showPasscodePrompt || isSignUp) {
                  setShowPasscodePrompt(false);
                  setIsSignUp(false);
                } else {
                  setShowPasscodePrompt(true);
                }
                setErrorMsg(null);
                setSuccessMsg(null);
                setPasscodeError(null);
              }}
              className="text-xs text-neutral-600 hover:text-neutral-900 hover:underline"
            >
              {showPasscodePrompt || isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Create one"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
