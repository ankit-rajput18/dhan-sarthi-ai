import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center max-w-md w-full">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">404</h1>
        <p className="text-lg sm:text-xl text-muted-foreground mb-6">Oops! Page not found</p>
        <p className="text-sm sm:text-base text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button variant="hero" onClick={() => window.location.href = "/"} className="w-full sm:w-auto">
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;