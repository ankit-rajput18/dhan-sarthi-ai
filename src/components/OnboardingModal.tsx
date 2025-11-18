import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Briefcase, 
  MapPin, 
  IndianRupee, 
  Home, 
  Heart, 
  PiggyBank,
  GraduationCap,
  Building2,
  Users,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

export default function OnboardingModal({ open, onComplete }: OnboardingModalProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const { toast } = useToast();

  // Load existing profile data when modal opens
  useEffect(() => {
    if (open) {
      loadExistingProfile();
    }
  }, [open]);

  const loadExistingProfile = async () => {
    try {
      const token = localStorage.getItem('ds_auth_token') || localStorage.getItem('token');
      if (!token) {
        setLoadingProfile(false);
        return;
      }

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_BASE_URL}/tax/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Populate form with existing data
        if (data.profile || data.taxProfile) {
          setFormData({
            age: data.profile?.age?.toString() || '',
            gender: data.profile?.gender || 'prefer-not-to-say',
            profession: data.profile?.profession || 'salaried',
            city: data.profile?.city || '',
            cityType: data.profile?.cityType || 'metro',
            monthlyIncome: data.profile?.monthlyIncome?.toString() || '',
            annualIncome: data.profile?.annualIncome?.toString() || '',
            taxRegime: data.taxProfile?.taxRegime || 'new',
            payingRent: data.taxProfile?.payingRent || false,
            monthlyRent: data.taxProfile?.monthlyRent?.toString() || '',
            hasHealthInsurance: data.taxProfile?.hasHealthInsurance || false,
            healthInsurancePremium: data.taxProfile?.healthInsurancePremium?.toString() || '',
            parentsHealthInsurance: data.taxProfile?.parentsHealthInsurance?.toString() || '',
            hasHomeLoan: data.taxProfile?.hasHomeLoan || false,
            homeLoanEMI: data.taxProfile?.homeLoanEMI?.toString() || '',
            homeLoanInterest: data.taxProfile?.homeLoanInterest?.toString() || '',
            investments80C: {
              ppf: data.taxProfile?.investments80C?.ppf?.toString() || '',
              elss: data.taxProfile?.investments80C?.elss?.toString() || '',
              lifeInsurance: data.taxProfile?.investments80C?.lifeInsurance?.toString() || '',
              epf: data.taxProfile?.investments80C?.epf?.toString() || '',
              nps: data.taxProfile?.investments80C?.nps?.toString() || ''
            },
            hasEducationLoan: data.taxProfile?.hasEducationLoan || false,
            educationLoanInterest: data.taxProfile?.educationLoanInterest?.toString() || ''
          });
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Form data
  const [formData, setFormData] = useState({
    age: '',
    gender: 'prefer-not-to-say',
    profession: 'salaried',
    city: '',
    cityType: 'metro',
    monthlyIncome: '',
    annualIncome: '',
    taxRegime: 'new',
    payingRent: false,
    monthlyRent: '',
    hasHealthInsurance: false,
    healthInsurancePremium: '',
    parentsHealthInsurance: '',
    hasHomeLoan: false,
    homeLoanEMI: '',
    homeLoanInterest: '',
    investments80C: {
      ppf: '',
      elss: '',
      lifeInsurance: '',
      epf: '',
      nps: ''
    },
    hasEducationLoan: false,
    educationLoanInterest: ''
  });

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateInvestment = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      investments80C: { ...prev.investments80C, [field]: value }
    }));
  };

  const handleNext = () => {
    // Validation for each step
    if (step === 1) {
      if (!formData.age || !formData.profession || !formData.city) {
        toast({
          title: 'Missing Information',
          description: 'Please fill in all required fields',
          variant: 'destructive'
        });
        return;
      }
    }

    if (step === 2) {
      if (!formData.monthlyIncome && !formData.annualIncome) {
        toast({
          title: 'Missing Information',
          description: 'Please enter your income',
          variant: 'destructive'
        });
        return;
      }
    }

    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem('ds_auth_token') || localStorage.getItem('token');
      
      // Prepare data
      const submitData = {
        ...formData,
        age: parseInt(formData.age),
        monthlyIncome: parseFloat(formData.monthlyIncome) || 0,
        annualIncome: parseFloat(formData.annualIncome) || (parseFloat(formData.monthlyIncome) * 12) || 0,
        monthlyRent: parseFloat(formData.monthlyRent) || 0,
        healthInsurancePremium: parseFloat(formData.healthInsurancePremium) || 0,
        parentsHealthInsurance: parseFloat(formData.parentsHealthInsurance) || 0,
        homeLoanEMI: parseFloat(formData.homeLoanEMI) || 0,
        homeLoanInterest: parseFloat(formData.homeLoanInterest) || 0,
        educationLoanInterest: parseFloat(formData.educationLoanInterest) || 0,
        investments80C: {
          ppf: parseFloat(formData.investments80C.ppf) || 0,
          elss: parseFloat(formData.investments80C.elss) || 0,
          lifeInsurance: parseFloat(formData.investments80C.lifeInsurance) || 0,
          epf: parseFloat(formData.investments80C.epf) || 0,
          nps: parseFloat(formData.investments80C.nps) || 0
        }
      };

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_BASE_URL}/tax/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save profile');
      }

      await response.json();

      toast({
        title: isEditing ? 'Profile Updated!' : 'Profile Completed!',
        description: isEditing ? 'Your profile has been updated successfully.' : 'Your financial profile has been saved successfully.'
      });

      onComplete();
    } catch (error) {
      console.error('Onboarding error:', error);
      toast({
        title: 'Error',
        description: 'Failed to save profile. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const progress = (step / 3) * 100;

  // Show loading state while fetching profile
  if (loadingProfile) {
    return (
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent className="w-screen h-screen max-w-none max-h-none m-0 p-0 rounded-none flex flex-col items-center justify-center" hideCloseButton>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading profile...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Check if this is an edit (user has existing data)
  const isEditing = formData.age !== '' || formData.city !== '';

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="w-screen h-screen max-w-none max-h-none m-0 p-0 rounded-none flex flex-col" hideCloseButton>
        <div className="p-6 sm:p-8 lg:p-10 overflow-y-auto flex-1 bg-gradient-to-b from-background to-muted/20">
          <div className="max-w-3xl mx-auto">
            <DialogHeader className="mb-8 text-center">
              <DialogTitle className="text-3xl sm:text-4xl font-bold">
                {isEditing ? 'Edit Your Profile' : 'Welcome to Dhan-Sarthi!'}
              </DialogTitle>
              <DialogDescription className="text-base sm:text-lg mt-2">
                {isEditing ? 'Update your financial information' : "Let's set up your financial profile in just 3 simple steps"}
              </DialogDescription>
            </DialogHeader>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-muted-foreground">Step {step} of 3</span>
                <span className="text-sm font-medium text-primary">{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-500">
            

            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="age" className="flex items-center gap-2 text-base">
                      <User className="w-4 h-4 text-primary" />
                      Age *
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="Enter your age"
                      value={formData.age}
                      onChange={(e) => updateField('age', e.target.value)}
                      min="18"
                      max="100"
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <RadioGroup value={formData.gender} onValueChange={(val) => updateField('gender', val)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female">Female</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other">Other</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="prefer-not-to-say" id="prefer-not-to-say" />
                        <Label htmlFor="prefer-not-to-say">Prefer not to say</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-5">

                  <div className="space-y-2">
                    <Label htmlFor="city" className="flex items-center gap-2 text-base">
                      <MapPin className="w-4 h-4 text-primary" />
                      City *
                    </Label>
                    <Input
                      id="city"
                      placeholder="e.g., Mumbai, Delhi, Bangalore"
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cityType" className="flex items-center gap-2 text-base">
                      <Building2 className="w-4 h-4 text-primary" />
                      City Type
                    </Label>
              <Select value={formData.cityType} onValueChange={(val) => updateField('cityType', val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metro">
                    <div className="flex flex-col text-left">
                      <span className="font-medium">Metro City</span>
                      <span className="text-xs text-muted-foreground">Mumbai, Delhi, Bangalore, Chennai, Kolkata, Hyderabad</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="non-metro">
                    <div className="flex flex-col text-left">
                      <span className="font-medium">Non-Metro City</span>
                      <span className="text-xs text-muted-foreground">All other cities and towns</span>
                    </div>
                  </SelectItem>
                </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      💡 This helps calculate HRA (House Rent Allowance) exemption accurately
                    </p>
                  </div>
                </div>
              </div>

              {/* Profession - Full Width */}
              <div className="space-y-3 mt-6">
                <Label className="flex items-center gap-2 text-base">
                  <Briefcase className="w-4 h-4 text-primary" />
                  Profession *
                </Label>
                <RadioGroup value={formData.profession} onValueChange={(val) => updateField('profession', val)} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className={`relative flex items-center space-x-3 border-2 rounded-lg p-4 cursor-pointer transition-all ${formData.profession === 'student' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                    <RadioGroupItem value="student" id="student" className="sr-only" />
                    <Label htmlFor="student" className="flex items-center gap-3 cursor-pointer w-full">
                      <GraduationCap className={`w-5 h-5 ${formData.profession === 'student' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="font-medium">Student</span>
                    </Label>
                  </div>
                  <div className={`relative flex items-center space-x-3 border-2 rounded-lg p-4 cursor-pointer transition-all ${formData.profession === 'salaried' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                    <RadioGroupItem value="salaried" id="salaried" className="sr-only" />
                    <Label htmlFor="salaried" className="flex items-center gap-3 cursor-pointer w-full">
                      <Briefcase className={`w-5 h-5 ${formData.profession === 'salaried' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="font-medium">Salaried</span>
                    </Label>
                  </div>
                  <div className={`relative flex items-center space-x-3 border-2 rounded-lg p-4 cursor-pointer transition-all ${formData.profession === 'freelancer' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                    <RadioGroupItem value="freelancer" id="freelancer" className="sr-only" />
                    <Label htmlFor="freelancer" className="flex items-center gap-3 cursor-pointer w-full">
                      <Users className={`w-5 h-5 ${formData.profession === 'freelancer' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="font-medium">Freelancer</span>
                    </Label>
                  </div>
                  <div className={`relative flex items-center space-x-3 border-2 rounded-lg p-4 cursor-pointer transition-all ${formData.profession === 'business' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                    <RadioGroupItem value="business" id="business" className="sr-only" />
                    <Label htmlFor="business" className="flex items-center gap-3 cursor-pointer w-full">
                      <Building2 className={`w-5 h-5 ${formData.profession === 'business' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="font-medium">Business</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Income Details */}
        {step === 2 && (
          <div className="space-y-4 max-w-2xl mx-auto">
            <h3 className="font-semibold text-xl">Step 2 of 3: Income Details</h3>
            

            <div className="space-y-2">
              <Label htmlFor="monthlyIncome">Monthly Income (₹) *</Label>
              <Input
                id="monthlyIncome"
                type="number"
                placeholder="Enter your monthly income"
                value={formData.monthlyIncome}
                onChange={(e) => {
                  updateField('monthlyIncome', e.target.value);
                  updateField('annualIncome', (parseFloat(e.target.value) * 12).toString());
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="annualIncome">Annual Income (₹)</Label>
              <Input
                id="annualIncome"
                type="number"
                placeholder="Auto-calculated from monthly income"
                value={formData.annualIncome}
                disabled
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">
                💡 Automatically calculated as Monthly Income × 12
              </p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <p className="text-xs text-amber-900 dark:text-amber-100">
                <strong>⚠️ Disclaimer:</strong> This app provides estimates for planning. Consult a CA (Chartered Accountant) for actual tax filing.
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Tax Deductions (Optional) */}
        {step === 3 && (
          <div className="space-y-4 max-w-2xl mx-auto">
            <h3 className="font-semibold text-xl">Step 3 of 3: Indian Tax Deductions (Optional)</h3>
            <p className="text-sm text-muted-foreground">
              Fill in what applies to you. These help calculate your tax savings under Indian Income Tax Act.
            </p>

            {/* Rent */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="payingRent"
                  checked={formData.payingRent}
                  onCheckedChange={(checked) => updateField('payingRent', checked)}
                />
                <Label htmlFor="payingRent">I pay rent</Label>
              </div>
              {formData.payingRent && (
                <Input
                  type="number"
                  placeholder="Monthly rent amount (₹)"
                  value={formData.monthlyRent}
                  onChange={(e) => updateField('monthlyRent', e.target.value)}
                />
              )}
            </div>

            {/* Health Insurance */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasHealthInsurance"
                  checked={formData.hasHealthInsurance}
                  onCheckedChange={(checked) => updateField('hasHealthInsurance', checked)}
                />
                <Label htmlFor="hasHealthInsurance">I have health insurance</Label>
              </div>
              {formData.hasHealthInsurance && (
                <div className="space-y-2 ml-6">
                  <Input
                    type="number"
                    placeholder="Annual premium for self (₹)"
                    value={formData.healthInsurancePremium}
                    onChange={(e) => updateField('healthInsurancePremium', e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Annual premium for parents (₹)"
                    value={formData.parentsHealthInsurance}
                    onChange={(e) => updateField('parentsHealthInsurance', e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Home Loan */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasHomeLoan"
                  checked={formData.hasHomeLoan}
                  onCheckedChange={(checked) => updateField('hasHomeLoan', checked)}
                />
                <Label htmlFor="hasHomeLoan">I have a home loan</Label>
              </div>
              {formData.hasHomeLoan && (
                <div className="space-y-2 ml-6">
                  <Input
                    type="number"
                    placeholder="Monthly EMI (₹)"
                    value={formData.homeLoanEMI}
                    onChange={(e) => updateField('homeLoanEMI', e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Annual interest paid (₹)"
                    value={formData.homeLoanInterest}
                    onChange={(e) => updateField('homeLoanInterest', e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* 80C Investments */}
            <div className="space-y-2">
              <Label>Section 80C Investments (Annual) - Up to ₹1.5L deduction</Label>
              <p className="text-xs text-muted-foreground">
                Popular Indian tax-saving investments under Section 80C
              </p>
              <div className="space-y-2 ml-6">
                <Input
                  type="number"
                  placeholder="PPF (₹)"
                  value={formData.investments80C.ppf}
                  onChange={(e) => updateInvestment('ppf', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="ELSS Mutual Funds (₹)"
                  value={formData.investments80C.elss}
                  onChange={(e) => updateInvestment('elss', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Life Insurance Premium (₹)"
                  value={formData.investments80C.lifeInsurance}
                  onChange={(e) => updateInvestment('lifeInsurance', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="EPF Contribution (₹)"
                  value={formData.investments80C.epf}
                  onChange={(e) => updateInvestment('epf', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="NPS (₹)"
                  value={formData.investments80C.nps}
                  onChange={(e) => updateInvestment('nps', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        </div>
        </div>

        {/* Navigation Buttons - Fixed at bottom */}
        <div className="border-t bg-background p-4 sm:p-6">
          <div className="flex justify-between max-w-4xl mx-auto">
            {step > 1 ? (
              <Button variant="outline" onClick={handleBack} disabled={loading} size="lg">
                ← Back
              </Button>
            ) : (
              <div></div>
            )}
            {step < 3 ? (
              <Button onClick={handleNext} size="lg">
                Next →
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading} size="lg">
                {loading ? 'Saving...' : 'Complete Setup ✓'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
