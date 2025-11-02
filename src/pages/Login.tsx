import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PiggyBank, Mail, Lock } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginUser } from "@/lib/auth"; // Make sure this exists

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  // Handle login form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await loginUser(email, password);
      console.log("Login success:", data);
      // Redirect after login
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Placeholder Google login
  const handleGoogleLogin = () => {
    console.log("Google login clicked");
    alert("Google login not implemented yet");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-4">
            <div className="w-10 h-10 rounded-lg btn-gradient flex items-center justify-center">
              <PiggyBank className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">Dhan-Sarthi</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Sign in to your account to continue</p>
        </div>

        <Card className="shadow-float border-0">
          <CardHeader className="space-y-1 pb-4 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center text-sm sm:text-base">
              Enter your credentials to access your financial dashboard
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 sm:px-4 sm:py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 py-2 text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 py-2 text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" variant="hero" className="w-full py-2 text-sm sm:text-base" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 sm:mt-8 text-xs text-muted-foreground">
          By continuing, you agree to our{" "}
          <Link to="/terms" className="hover:underline">Terms of Service</Link>
          {" "}and{" "}
          <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;