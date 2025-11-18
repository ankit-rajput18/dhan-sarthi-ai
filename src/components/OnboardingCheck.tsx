import { useState, useEffect } from 'react';
import OnboardingModal from './OnboardingModal';

interface OnboardingCheckProps {
  children: React.ReactNode;
}

export default function OnboardingCheck({ children }: OnboardingCheckProps) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      // Check both possible token keys
      const token = localStorage.getItem('ds_auth_token') || localStorage.getItem('token');
      
      // If no token, user is not logged in - don't show onboarding
      if (!token) {
        setChecked(true);
        return;
      }

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_BASE_URL}/tax/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        
        // ALWAYS show onboarding if not completed
        if (!data.onboardingCompleted) {
          setShowOnboarding(true);
        }
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('ds_auth_token');
      }
    } catch (error) {
      console.error('Error checking onboarding:', error);
    } finally {
      setChecked(true);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Refresh the page to reload with updated onboarding status
    window.location.reload();
  };

  // Show loading spinner while checking
  if (!checked) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      {children}
      {showOnboarding && (
        <OnboardingModal 
          open={showOnboarding} 
          onComplete={handleOnboardingComplete}
        />
      )}
    </>
  );
}
