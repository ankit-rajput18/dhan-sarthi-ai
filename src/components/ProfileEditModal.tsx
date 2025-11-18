import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Briefcase, IndianRupee, Shield } from 'lucide-react';

interface ProfileEditModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ProfileEditModal({ open, onClose }: ProfileEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
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
    },
    hasEducationLoan: false,
    educationLoanInterest: ''
  });

  useEffect(() => {
    if (open) {
      loadProfile();
    }
  }, [open]);

  const loadProfile = async () => {
    try {
      setLoadingProfile(true);
      const token = localStorage.getItem('ds_auth_token') || localStorage.getItem('token');
      
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_BASE_URL}/tax/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        
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
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        variant: 'destructive'
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
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

      if (!response.ok) throw new Error('Failed to update profile');

      toast({
        title: 'Profile Updated!',
        description: 'Your profile has been updated successfully.'
      });

      onClose();
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateInvestment = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      investments80C: { ...prev.investments80C, [field]: value }
    }));
  };

  if (loadingProfile) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit Profile</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">
              <User className="w-4 h-4 mr-2" />
              Basic
            </TabsTrigger>
            <TabsTrigger value="income">
              <IndianRupee className="w-4 h-4 mr-2" />
              Income
            </TabsTrigger>
            <TabsTrigger value="deductions">
              <Shield className="w-4 h-4 mr-2" />
              Deductions
            </TabsTrigger>
            <TabsTrigger value="investments">
              <Briefcase className="w-4 h-4 mr-2" />
              Investments
            </TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => updateField('age', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(val) => updateField('gender', val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profession">Profession</Label>
                <Select value={formData.profession} onValueChange={(val) => updateField('profession', val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="salaried">Salaried</SelectItem>
                    <SelectItem value="freelancer">Freelancer</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="cityType">City Type</Label>
                <Select value={formData.cityType} onValueChange={(val) => updateField('cityType', val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="metro">Metro City</SelectItem>
                    <SelectItem value="non-metro">Non-Metro City</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* Income Tab */}
          <TabsContent value="income" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="monthlyIncome">Monthly Income (₹)</Label>
                <Input
                  id="monthlyIncome"
                  type="number"
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
                  value={formData.annualIncome}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Auto-calculated from monthly income</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxRegime">Tax Regime</Label>
                <Select value={formData.taxRegime} onValueChange={(val) => updateField('taxRegime', val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="old">Old Regime (with deductions)</SelectItem>
                    <SelectItem value="new">New Regime (lower rates)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* Deductions Tab */}
          <TabsContent value="deductions" className="space-y-4 mt-4">
            <div className="space-y-4">
              {/* Rent */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="payingRent"
                    checked={formData.payingRent}
                    onCheckedChange={(checked) => updateField('payingRent', checked)}
                  />
                  <Label htmlFor="payingRent">I pay rent (HRA)</Label>
                </div>
                {formData.payingRent && (
                  <Input
                    type="number"
                    placeholder="Monthly rent (₹)"
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
                  <Label htmlFor="hasHealthInsurance">Health Insurance (80D)</Label>
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
                  <Label htmlFor="hasHomeLoan">Home Loan (24b)</Label>
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

              {/* Education Loan */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasEducationLoan"
                    checked={formData.hasEducationLoan}
                    onCheckedChange={(checked) => updateField('hasEducationLoan', checked)}
                  />
                  <Label htmlFor="hasEducationLoan">Education Loan</Label>
                </div>
                {formData.hasEducationLoan && (
                  <Input
                    type="number"
                    placeholder="Annual interest paid (₹)"
                    value={formData.educationLoanInterest}
                    onChange={(e) => updateField('educationLoanInterest', e.target.value)}
                    className="ml-6"
                  />
                )}
              </div>
            </div>
          </TabsContent>

          {/* Investments Tab */}
          <TabsContent value="investments" className="space-y-4 mt-4">
            <div className="space-y-4">
              <Label>Section 80C Investments (Max ₹1.5L)</Label>
              <div className="space-y-2">
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
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
