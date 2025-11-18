import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  TrendingUp, 
  Calculator,
  PiggyBank,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  BookOpen,
  Target,
  Heart,
  Home,
  GraduationCap,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import OnboardingModal from '@/components/OnboardingModal';

const TaxTips = () => {
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [taxData, setTaxData] = useState<any>(null);
  const [oldRegime, setOldRegime] = useState<any>(null);
  const [newRegime, setNewRegime] = useState<any>(null);
  const [recommendedRegime, setRecommendedRegime] = useState<string>('new');
  const [savings, setSavings] = useState<number>(0);
  const [tips, setTips] = useState<any[]>([]);
  const [aiRecommendation, setAiRecommendation] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTaxData();
    fetchAIRecommendation();
  }, []);

  const fetchTaxData = async () => {
    try {
      const token = localStorage.getItem('ds_auth_token') || localStorage.getItem('token');
      
      if (!token) {
        toast({
          title: 'Not Logged In',
          description: 'Please login to access tax tips',
          variant: 'destructive'
        });
        setLoading(false);
        return;
      }
      
      // Check if onboarding is completed
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
      const profileRes = await fetch(`${API_BASE_URL}/tax/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (profileRes.status === 401) {
        toast({
          title: 'Session Expired',
          description: 'Please login again',
          variant: 'destructive'
        });
        localStorage.removeItem('token');
        localStorage.removeItem('ds_auth_token');
        localStorage.removeItem('ds_auth_user');
        window.location.href = '/login';
        return;
      }
      
      const profileData = await profileRes.json();
      
      if (!profileData.onboardingCompleted) {
        setShowOnboarding(true);
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // Fetch tax tips
      const tipsRes = await fetch(`${API_BASE_URL}/tax/tips`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const tipsData = await tipsRes.json();
      setTaxData(tipsData.calculation);
      setOldRegime(tipsData.oldRegime);
      setNewRegime(tipsData.newRegime);
      setRecommendedRegime(tipsData.recommendedRegime);
      setSavings(tipsData.savings);
      setTips(tipsData.tips);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tax data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tax data',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  const fetchAIRecommendation = async () => {
    try {
      const token = localStorage.getItem('ds_auth_token') || localStorage.getItem('token');
      if (!token) return;

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_BASE_URL}/tax/ai-recommendation`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAiRecommendation(data);
      }
    } catch (error) {
      // Silently fail - recommendation is optional
    }
  };

  const handleRefreshRecommendation = async () => {
    try {
      setLoadingAI(true);
      const token = localStorage.getItem('ds_auth_token') || localStorage.getItem('token');
      if (!token) return;

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_BASE_URL}/tax/ai-recommendation/generate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAiRecommendation(data);
        toast({
          title: 'New Recommendation Generated!',
          description: 'AI has analyzed your data and created a fresh recommendation.',
        });
      } else {
        throw new Error('Failed to generate recommendation');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate new recommendation. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoadingAI(false);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    fetchTaxData();
    fetchAIRecommendation();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading tax information...</p>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return <OnboardingModal open={showOnboarding} onComplete={handleOnboardingComplete} />;
  }

  // Student or Low Income View
  if (profile?.profile?.profession === 'student' || profile?.profile?.annualIncome < 300000) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Tax Tips</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Financial guidance for your situation</p>
        </div>

        {profile?.profile?.profession === 'student' ? (
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-primary" />
                Student Financial Tips
              </CardTitle>
              <CardDescription>Build strong financial habits early!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-primary/20 bg-primary/5">
                <BookOpen className="h-4 w-4 text-primary" />
                <AlertDescription>
                  As a student, focus on building financial literacy and good money habits. 
                  Tax planning will become relevant when you start earning ₹3,00,000+ annually.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h3 className="font-semibold">Financial Tips for Students:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Track every expense to understand your spending patterns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Save at least 20% of any income (pocket money, internships)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Learn about investments - start with small amounts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Avoid unnecessary debt and credit card traps</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Build an emergency fund (3-6 months expenses)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">When You Start Earning:</h4>
                <p className="text-sm text-muted-foreground">
                  Once your annual income crosses ₹3,00,000, you'll need to file tax returns and can benefit from 
                  various tax-saving investments. Come back then for personalized tax-saving tips!
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-success" />
                Great News! No Tax Liability
              </CardTitle>
              <CardDescription>Your income is below the taxable limit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-success/20 bg-success/5">
                <Lightbulb className="h-4 w-4 text-success" />
                <AlertDescription>
                  Your annual income (₹{profile?.profile?.annualIncome?.toLocaleString('en-IN')}) is below 
                  the taxable limit of ₹3,00,000. You don't need to pay income tax!
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h3 className="font-semibold">Focus on Building Wealth:</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <PiggyBank className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Build Emergency Fund</p>
                      <p className="text-xs text-muted-foreground">Save 3-6 months of expenses for emergencies</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <TrendingUp className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Start Investing Early</p>
                      <p className="text-xs text-muted-foreground">Even small amounts in ELSS or PPF can grow significantly</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <Target className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Set Financial Goals</p>
                      <p className="text-xs text-muted-foreground">Plan for future expenses and investments</p>
                    </div>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Full Tax Module for Salaried/Freelancer with Income > 3L
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '80C': return PiggyBank;
      case '80D': return Heart;
      case 'HRA': return Home;
      case '24(b)': return Home;
      case 'info': return Lightbulb;
      default: return Shield;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Tax-Saving Tips</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Personalized recommendations based on your profile
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          FY 2024-25
        </Badge>
      </div>

      {/* Disclaimer */}
      <Alert className="border-warning/20 bg-warning/5">
        <AlertTriangle className="h-4 w-4 text-warning" />
        <AlertDescription className="text-xs sm:text-sm">
          <strong>Disclaimer:</strong> These tips are for guidance only. Consult a tax professional for personalized advice.
        </AlertDescription>
      </Alert>

      {/* AI Recommendation */}
      <Card className="shadow-card border-0 bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950 dark:via-pink-950 dark:to-orange-950 border-2 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <div>
                <CardTitle className="text-lg">AI Tax Recommendation</CardTitle>
                <CardDescription>Personalized advice based on your complete financial profile</CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshRecommendation}
              disabled={loadingAI}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loadingAI ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingAI ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-purple-600 animate-pulse" />
                <p className="text-sm text-muted-foreground">AI is analyzing your financial data...</p>
              </div>
            </div>
          ) : aiRecommendation ? (
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-sm leading-relaxed">{aiRecommendation.recommendation}</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                  {aiRecommendation.category}
                </Badge>
                {aiRecommendation.potentialSaving > 0 && (
                  <Badge className="bg-green-600">
                    💰 Save ₹{aiRecommendation.potentialSaving.toLocaleString('en-IN')}
                  </Badge>
                )}
                <Badge variant="outline" className={
                  aiRecommendation.priority === 'high' ? 'border-red-500 text-red-600' :
                  aiRecommendation.priority === 'medium' ? 'border-yellow-500 text-yellow-600' :
                  'border-blue-500 text-blue-600'
                }>
                  {aiRecommendation.priority} priority
                </Badge>
              </div>

              {aiRecommendation.actionSteps && aiRecommendation.actionSteps.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-600" />
                    Action Steps:
                  </h4>
                  <ul className="space-y-1">
                    {aiRecommendation.actionSteps.map((step: string, index: number) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-purple-600 font-bold">{index + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-4">
                Generated {new Date(aiRecommendation.createdAt).toLocaleString('en-IN', { 
                  dateStyle: 'medium', 
                  timeStyle: 'short' 
                })}
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 mx-auto mb-3 text-purple-600 opacity-50" />
              <p className="text-sm text-muted-foreground mb-4">No AI recommendation yet</p>
              <Button onClick={handleRefreshRecommendation} disabled={loadingAI}>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Recommendation
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Regime Comparison */}
      {oldRegime && newRegime && (
        <Card className="shadow-card border-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Smart Tax Regime Recommendation
            </CardTitle>
            <CardDescription>
              We calculated both regimes for you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-lg border-2 ${recommendedRegime === 'old' ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-gray-300 bg-white dark:bg-gray-900'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Old Regime</h3>
                  {recommendedRegime === 'old' && <Badge className="bg-green-600">Recommended</Badge>}
                </div>
                <p className="text-2xl font-bold text-red-600">₹{oldRegime.taxLiability?.toLocaleString('en-IN')}</p>
                <p className="text-xs text-muted-foreground mt-1">With ₹{oldRegime.totalDeductions?.toLocaleString('en-IN')} deductions</p>
              </div>
              
              <div className={`p-4 rounded-lg border-2 ${recommendedRegime === 'new' ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-gray-300 bg-white dark:bg-gray-900'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">New Regime</h3>
                  {recommendedRegime === 'new' && <Badge className="bg-green-600">Recommended</Badge>}
                </div>
                <p className="text-2xl font-bold text-red-600">₹{newRegime.taxLiability?.toLocaleString('en-IN')}</p>
                <p className="text-xs text-muted-foreground mt-1">No deductions allowed</p>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                💰 {recommendedRegime === 'old' ? 'Old' : 'New'} Regime saves you ₹{savings?.toLocaleString('en-IN')}!
              </p>
              <p className="text-xs text-green-800 dark:text-green-200 mt-1">
                {recommendedRegime === 'old' 
                  ? 'Your deductions make the old regime more beneficial'
                  : 'New regime is better as you have minimal deductions'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tax Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="shadow-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gross Income</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹{taxData?.grossIncome?.toLocaleString('en-IN')}</p>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tax Liability</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">₹{taxData?.taxLiability?.toLocaleString('en-IN')}</p>
            <p className="text-xs text-muted-foreground mt-1">{taxData?.regime === 'new' ? 'New Regime' : 'Old Regime'}</p>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Deductions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">₹{taxData?.totalDeductions?.toLocaleString('en-IN')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Deduction Breakdown (Old Regime Only) */}
      {taxData?.regime === 'old' && taxData?.deductionBreakdown && (
        <Card className="shadow-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              Deduction Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(taxData.deductionBreakdown).map(([key, value]: [string, any]) => (
                <div key={key}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Section {key}</span>
                    <span className="text-sm text-muted-foreground">
                      ₹{value?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {key === '80C' && (
                    <Progress value={(value / 150000) * 100} className="h-2" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Personalized Tips */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Personalized Recommendations
          </CardTitle>
          <CardDescription>
            {tips.length} tip{tips.length !== 1 ? 's' : ''} to help you save on taxes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tips.map((tip) => {
              const Icon = getCategoryIcon(tip.category);
              return (
                <div key={tip.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full ${getPriorityColor(tip.priority)} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{tip.title}</h3>
                        {tip.potentialSaving > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            Save ₹{tip.potentialSaving.toLocaleString('en-IN')}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{tip.description}</p>
                      {tip.actionRequired && (
                        <div className="flex items-center gap-2 text-sm">
                          <Target className="w-4 h-4 text-primary" />
                          <span className="font-medium">{tip.actionRequired}</span>
                        </div>
                      )}
                      {tip.deadline && (
                        <p className="text-xs text-warning mt-1">
                          ⏰ Deadline: {new Date(tip.deadline).toLocaleDateString('en-IN')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      
    </div>
  );
};

export default TaxTips;
