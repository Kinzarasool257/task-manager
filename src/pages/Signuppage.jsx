import { useEffect } from "react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
 
export default function SignupPage() {
  const { login, register, isAuthenticated } = useKindeAuth();
  const navigate = useNavigate();
 
  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard");
  }, [isAuthenticated, navigate]);
 
  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center px-4">
      <Card className="w-full max-w-sm border-0 shadow-xl rounded-2xl">
        <CardContent className="p-9">
 
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-7">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#4F46E5" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="font-semibold text-base text-gray-900">
              Daily<span className="text-indigo-600">TM</span>
            </span>
          </div>
 
          {/* Heading */}
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Create Account</h1>
          <p className="text-sm text-gray-400 mb-7">Get started today!</p>
 
          {/* Fields — visual only, Kinde handles real auth */}
          <div className="space-y-4 mb-5">
            <div>
              <label className="text-sm text-gray-600 block mb-1">First name</label>
              <input
                type="text"
                className="w-full border border-indigo-400 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder=""
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">Last name</label>
              <input
                type="text"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder=""
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 block mb-1">Email Address</label>
              <input
                type="email"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder=""
              />
            </div>
          </div>
 
          {/* Create account → triggers Kinde register */}
          <Button
            className="w-full bg-gray-900 hover:bg-gray-700 text-white rounded-lg py-2 text-sm font-medium"
            onClick={() => register()}
          >
            Create your account
          </Button>
 
          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">Or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
 
          {/* Google */}
          <Button
            variant="outline"
            className="w-full rounded-lg text-sm font-medium gap-2 border-gray-200"
            onClick={() => login({ connection_id: "google" })}
          >
            <svg width="16" height="16" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continue with Google
          </Button>
 
          {/* Sign in */}
          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{" "}
            <span
              onClick={() => login()}
              className="text-indigo-600 cursor-pointer font-medium hover:underline"
            >
              Sign in
            </span>
          </p>
 
          {/* Powered by */}
          <p className="text-center text-xs text-gray-300 mt-6">
            Powered by <strong className="text-gray-400">Kinde</strong>
          </p>
 
        </CardContent>
      </Card>
    </div>
  );
}