import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
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
  Sparkles
} from 'lucide-react';

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

export default function OnboardingModal({ open, onComplete }: OnboardingModalProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
    }
  });

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'monthlyIncome') {
      setFormData(prev => ({ ...prev, annualIncome: (parseFloat(value) * 12).toString() }));
    }
  };

  const updateInvestment = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      investments80C: { ...prev.investments80C, [field]: value }
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.age || !formData.profession || !formData.city || !formData.monthlyIncome) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields (Age, Profession, City, Income)',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('ds_auth_token') || localStorage.getItem('token');
      
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

      if (!response.ok) throw new Error('Failed to save profile');

      toast({
        title: 'Profile Completed!',
        description: 'Your financial profile has been saved successfully.'
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

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="w-screen h-screen max-w-none max-h-none m-0 p-0 rounded-none flex flex-col" hideCloseButton>
        {/* Header */}
        <div className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 text-white p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold">Welcome to Dhan-Sarthi!</h1>
            </div>
            <p className="text-white/90">Complete your profile to get personalized tax-saving recommendations</p>
          </div>
        </div>

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-background to-muted/20">
          <div className="max-w-6xl mx-auto p-6 space-y-6">
            
            {/* Basic Information */}
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Basic Information</h2>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="25"
                    value={formData.age}
                    onChange={(e) => updateField('age', e.target.value)}
                    min="18"
                    max="100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    placeholder="Mumbai, Delhi, etc."
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cityType">City Type</Label>
                  <Select value={formData.cityType} onValueChange={(val) => updateField('cityType', val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="metro">Metro (Mumbai, Delhi, Bangalore, etc.)</SelectItem>
                      <SelectItem value="non-metro">Non-Metro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4">
                <Label className="mb-3 block">Profession *</Label>
                <RadioGroup value={formData.profession} onValueChange={(val) => updateField('profession', val)} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className={`relative flex items-center space-x-3 border-2 rounded-lg p-3 cursor-pointer transition-all ${formData.profession === 'student' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                    <RadioGroupItem value="student" id="student" className="sr-only" />
                    <Label htmlFor="student" className="flex items-center gap-2 cursor-pointer w-full">
                      <GraduationCap className={`w-5 h-5 ${formData.profession === 'student' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="font-medium text-sm">Student</span>
                    </Label>
                  </div>
                  <div className={`relative flex items-center space-x-3 border-2 rounded-lg p-3 cursor-pointer transition-all ${formData.profession === 'salaried' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                    <RadioGroupItem value="salaried" id="salaried" className="sr-only" />
                    <Label htmlFor="salaried" className="flex items-center gap-2 cursor-pointer w-full">
                      <Briefcase className={`w-5 h-5 ${formData.profession === 'salaried' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="font-medium text-sm">Salaried</span>
                    </Label>
                  </div>
                  <div className={`relative flex items-center space-x-3 border-2 rounded-lg p-3 cursor-pointer transition-all ${formData.profession === 'freelancer' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                    <RadioGroupItem value="freelancer" id="freelancer" className="sr-only" />
                    <Label htmlFor="freelancer" className="flex items-center gap-2 cursor-pointer w-full">
                      <Users className={`w-5 h-5 ${formData.profession === 'freelancer' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="font-medium text-sm">Freelancer</span>
                    </Label>
                  </div>
                  <div className={`relative flex items-center space-x-3 border-2 rounded-lg p-3 cursor-pointer transition-all ${formData.profession === 'business' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                    <RadioGroupItem value="business" id="business" className="sr-only" />
                    <Label htmlFor="business" className="flex items-center gap-2 cursor-pointer w-full">
                      <Building2 className={`w-5 h-5 ${formData.profession === 'business' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className="font-medium text-sm">Business</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Income & Tax Deductions - Two Columns */}
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Income */}
              <div className="bg-card border rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <IndianRupee className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold">Income Details</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="monthlyIncome">Monthly Income (₹) *</Label>
                    <Input
                      id="monthlyIncome"
                      type="number"
                      placeholder="50000"
                      value={formData.monthlyIncome}
                      onChange={(e) => updateField('monthlyIncome', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="annualIncome">Annual Income (₹)</Label>
                    <Input
                      id="annualIncome"
                      type="number"
                      value={formData.annualIncome}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Auto-calculated (Monthly × 12)</p>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <p className="text-xs text-blue-900 dark:text-blue-100">
                      <strong>💡 Smart Tax Optimization:</strong> We'll calculate both Old and New regimes and show you which saves more!
                    </p>
                  </div>
                </div>
              </div>

              {/* Tax Deductions */}
              <div className="bg-card border rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <PiggyBank className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold">Tax Deductions (Optional)</h2>
                </div>
                
                <div className="space-y-4">
                  {/* Rent */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="payingRent"
                        checked={formData.payingRent}
                        onCheckedChange={(checked) => updateField('payingRent', checked)}
                      />
                      <Label htmlFor="payingRent" className="flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        I pay rent
                      </Label>
                    </div>
                    {formData.payingRent && (
                      <Input
                        type="number"
                        placeholder="Monthly rent (₹)"
                        value={formData.monthlyRent}
                        onChange={(e) => updateField('monthlyRent', e.target.value)}
                        className="ml-6"
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
                      <Label htmlFor="hasHealthInsurance" className="flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        Health insurance
                      </Label>
                    </div>
                    {formData.hasHealthInsurance && (
                      <div className="ml-6 space-y-2">
                        <Input
                          type="number"
                          placeholder="Self premium (₹/year)"
                          value={formData.healthInsurancePremium}
                          onChange={(e) => updateField('healthInsurancePremium', e.target.value)}
                        />
                        <Input
                          type="number"
                          placeholder="Parents premium (₹/year)"
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
                      <Label htmlFor="hasHomeLoan">Home loan</Label>
                    </div>
                    {formData.hasHomeLoan && (
                      <div className="ml-6 space-y-2">
                        <Input
                          type="number"
                          placeholder="Annual interest (₹)"
                          value={formData.homeLoanInterest}
                          onChange={(e) => updateField('homeLoanInterest', e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 80C Investments - Collapsible */}
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <PiggyBank className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">Section 80C Investments (Optional)</h2>
                <span className="text-xs text-muted-foreground ml-auto">Up to ₹1.5L deduction</span>
              </div>
              
              <div className="grid md:grid-cols-5 gap-4">
                <Input
                  type="number"
                  placeholder="PPF (₹)"
                  value={formData.investments80C.ppf}
                  onChange={(e) => updateInvestment('ppf', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="ELSS (₹)"
                  value={formData.investments80C.elss}
                  onChange={(e) => updateInvestment('elss', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="LIC (₹)"
                  value={formData.investments80C.lifeInsurance}
                  onChange={(e) => updateInvestment('lifeInsurance', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="EPF (₹)"
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

            {/* Disclaimer */}
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-sm text-amber-900 dark:text-amber-100">
                <strong>⚠️ Disclaimer:</strong> This app provides estimates for planning. Consult a CA (Chartered Accountant) for actual tax filing.
              </p>
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="border-t bg-background p-4">
          <div className="max-w-6xl mx-auto flex justify-end">
            <Button onClick={handleSubmit} disabled={loading} size="lg" className="min-w-[200px]">
              {loading ? 'Saving...' : 'Complete Setup ✓'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
