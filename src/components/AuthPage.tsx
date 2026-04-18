import { useState } from "react";
import { IconBrandGoogle, IconLoader2 } from "@tabler/icons-react";
import { useAuth } from "../contexts/AuthContext";
import { LogoMark } from "./LogoMark";

type Mode = "signin" | "signup" | "reset";

function parseFirebaseError(code: string): string {
  const map: Record<string, string> = {
    "auth/invalid-credential": "Invalid email or password.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/email-already-in-use": "An account already exists with this email.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/popup-closed-by-user": "",
  };
  return map[code] ?? "Something went wrong. Please try again.";
}

export function AuthPage() {
  const { signIn, signUp, signInGoogle, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const clear = () => {
    setError("");
    setInfo("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clear();
    setLoading(true);
    try {
      if (mode === "reset") {
        await resetPassword(email);
        setInfo("Reset link sent — check your inbox.");
      } else if (mode === "signup") {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      const msg = parseFirebaseError(code);
      if (msg) setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    clear();
    setLoading(true);
    try {
      await signInGoogle();
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      const msg = parseFirebaseError(code);
      if (msg) setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <LogoMark size={48} />
          <p className="mt-3 text-base font-semibold tracking-tight text-neutral-900">My Finances</p>
          <p className="text-sm text-neutral-500 mt-0.5">
            {mode === "signin" ? "Sign in to your account" : mode === "signup" ? "Create a new account" : "Reset your password"}
          </p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm">
          {/* Google */}
          {mode !== "reset" && (
            <>
              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-md border border-neutral-200 text-sm text-neutral-700 hover:bg-neutral-50 bg-white cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <IconBrandGoogle size={16} />
                Continue with Google
              </button>

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-neutral-200" />
                <span className="text-xs text-neutral-500">or</span>
                <div className="flex-1 h-px bg-neutral-200" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full px-3 py-2.5 rounded-md border border-neutral-200 text-sm outline-none focus:border-neutral-400"
              />
            </div>

            {mode !== "reset" && (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  className="w-full px-3 py-2.5 rounded-md border border-neutral-200 text-sm outline-none focus:border-neutral-400"
                />
              </div>
            )}

            {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>}
            {info && <p className="text-xs text-green-700 bg-green-50 px-3 py-2 rounded-md">{info}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-md bg-neutral-900 text-white text-sm hover:bg-neutral-700 border-none cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              {loading && <IconLoader2 size={14} className="animate-spin" />}
              {mode === "signin" ? "Sign in" : mode === "signup" ? "Create account" : "Send reset link"}
            </button>
          </form>
        </div>

        {/* Footer links */}
        <div className="mt-4 text-center flex flex-col gap-2">
          {mode === "signin" && (
            <>
              <button
                onClick={() => {
                  setMode("signup");
                  clear();
                }}
                className="text-xs text-neutral-500 hover:text-neutral-800 bg-transparent border-none cursor-pointer"
              >
                Don't have an account? <span className="font-medium">Create one</span>
              </button>
              <button
                onClick={() => {
                  setMode("reset");
                  clear();
                }}
                className="text-xs text-neutral-500 hover:text-neutral-600 bg-transparent border-none cursor-pointer"
              >
                Forgot password?
              </button>
            </>
          )}
          {(mode === "signup" || mode === "reset") && (
            <button
              onClick={() => {
                setMode("signin");
                clear();
              }}
              className="text-xs text-neutral-500 hover:text-neutral-800 bg-transparent border-none cursor-pointer"
            >
              Already have an account? <span className="font-medium">Sign in</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
