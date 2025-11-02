import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PiggyBank, User, Mail, Lock } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { registerUser } from "@/lib/auth";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    ageGroup: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await registerUser(formData.name, formData.email, formData.password, formData.ageGroup);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Join Dhan-Sarthi</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Start your journey to financial freedom</p>
        </div>

        <Card className="shadow-float border-0">
          <CardHeader className="space-y-1 pb-4 sm:pb-6">
            <CardTitle className="text-xl sm:text-2xl text-center">Create Account</CardTitle>
            <CardDescription className="text-center text-sm sm:text-base">
              Get personalized financial insights in minutes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 sm:px-4 sm:py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="pl-10 py-2 text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
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
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-10 py-2 text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ageGroup" className="text-sm">Age Group</Label>
                <Select value={formData.ageGroup} onValueChange={(value) => handleInputChange("ageGroup", value)}>
                  <SelectTrigger className="py-2 text-sm sm:text-base">
                    <SelectValue placeholder="Select your age group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student" className="text-sm">Student (18-25)</SelectItem>
                    <SelectItem value="young-professional" className="text-sm">Young Professional (26-35)</SelectItem>
                    <SelectItem value="experienced" className="text-sm">Experienced (35+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" variant="hero" className="w-full py-2 text-sm sm:text-base" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 sm:mt-8 text-xs text-muted-foreground">
          By creating an account, you agree to our{" "}
          <Link to="/terms" className="hover:underline">Terms of Service</Link>
          {" "}and{" "}
          <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;