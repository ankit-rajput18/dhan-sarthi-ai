import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  TrendingUp, 
  FileText, 
  Calculator,
  PiggyBank,
  Briefcase,
  Heart,
  GraduationCap,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Lightbulb,
  Calendar
} from "lucide-react";

const TaxTips = () => {
  // Mock data for tax planning
  const currentFinancialYear = "2023-24";
  const section80CLimit = 150000;
  const section80CUsed = 85000;
  const section80CRemaining = section80CLimit - section80CUsed;

  const taxSavingOptions = [
    {
      id: 1,
      name: "ELSS Mutual Funds",
      category: "80C",
      description: "Equity Linked Savings Scheme with tax benefits and market returns",
      minInvestment: 500,
      lockInPeriod: "3 years",
      expectedReturns: "12-15%",
      riskLevel: "High",
      icon: TrendingUp,
      color: "bg-green-500",
      recommended: true
    },
    {
      id: 2,
      name: "PPF (Public Provident Fund)",
      category: "80C",
      description: "Government backed tax-free returns with 15-year lock-in",
      minInvestment: 500,
      lockInPeriod: "15 years",
      expectedReturns: "7.1%",
      riskLevel: "Low",
      icon: Shield,
      color: "bg-blue-500",
      recommended: true
    },
    {
      id: 3,
      name: "National Pension System",
      category: "80CCD",
      description: "Additional ₹50,000 deduction for retirement planning",
      minInvestment: 1000,
      lockInPeriod: "Till retirement",
      expectedReturns: "10-12%",
      riskLevel: "Medium",
      icon: Briefcase,
      color: "bg-purple-500",
      recommended: false
    },
    {
      id: 4,
      name: "Health Insurance",
      category: "80D",
      description: "Tax deduction up to ₹25,000 for health insurance premiums",
      minInvestment: 5000,
      lockInPeriod: "1 year",
      expectedReturns: "Health coverage",
      riskLevel: "Low",
      icon: Heart,
      color: "bg-red-500",
      recommended: true
    },
    {
      id: 5,
      name: "Education Loan Interest",
      category: "80E",
      description: "Full interest deduction on education loans",
      minInvestment: 0,
      lockInPeriod: "Loan duration",
      expectedReturns: "Tax savings",
      riskLevel: "Low",
      icon: GraduationCap,
      color: "bg-yellow-500",
      recommended: false
    },
    {
      id: 6,
      name: "Tax Saver FD",
      category: "80C",
      description: "Fixed deposits with 5-year lock-in and guaranteed returns",
      minInvestment: 100,
      lockInPeriod: "5 years",
      expectedReturns: "5.5-6.5%",
      riskLevel: "Low",
      icon: PiggyBank,
      color: "bg-orange-500",
      recommended: false
    }
  ];

  const taxCalculation = {
    grossIncome: 850000,
    standardDeduction: 50000,
    section80C: section80CUsed,
    section80D: 15000,
    taxableIncome: 0,
    taxLiability: 0,
    potentialSavings: 0
  };

  // Calculate taxable income and tax
  taxCalculation.taxableIncome = taxCalculation.grossIncome - taxCalculation.standardDeduction - taxCalculation.section80C - taxCalculation.section80D;
  
  // Simplified tax calculation for new regime
  if (taxCalculation.taxableIncome <= 300000) {
    taxCalculation.taxLiability = 0;
  } else if (taxCalculation.taxableIncome <= 600000) {
    taxCalculation.taxLiability = (taxCalculation.taxableIncome - 300000) * 0.05;
  } else if (taxCalculation.taxableIncome <= 900000) {
    taxCalculation.taxLiability = 15000 + (taxCalculation.taxableIncome - 600000) * 0.10;
  } else if (taxCalculation.taxableIncome <= 1200000) {
    taxCalculation.taxLiability = 45000 + (taxCalculation.taxableIncome - 900000) * 0.15;
  } else {
    taxCalculation.taxLiability = 90000 + (taxCalculation.taxableIncome - 1200000) * 0.20;
  }

  // Calculate potential savings if remaining 80C is utilized
  const potentialTaxableIncome = taxCalculation.taxableIncome - section80CRemaining;
  let potentialTaxLiability = 0;
  if (potentialTaxableIncome <= 300000) {
    potentialTaxLiability = 0;
  } else if (potentialTaxableIncome <= 600000) {
    potentialTaxLiability = (potentialTaxableIncome - 300000) * 0.05;
  } else if (potentialTaxableIncome <= 900000) {
    potentialTaxLiability = 15000 + (potentialTaxableIncome - 600000) * 0.10;
  } else if (potentialTaxableIncome <= 1200000) {
    potentialTaxLiability = 45000 + (potentialTaxableIncome - 900000) * 0.15;
  } else {
    potentialTaxLiability = 90000 + (potentialTaxableIncome - 1200000) * 0.20;
  }

  taxCalculation.potentialSavings = taxCalculation.taxLiability - potentialTaxLiability;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Tax-Saving Tips</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Maximize your tax savings with smart investment choices</p>
        </div>
        <Badge variant="outline" className="text-sm self-start sm:self-auto">
          FY {currentFinancialYear}
        </Badge>
      </div>

      {/* Disclaimer */}
      <Alert className="border-warning/20 bg-warning/5">
        <AlertTriangle className="h-4 w-4 text-warning" />
        <AlertDescription className="text-xs sm:text-sm">
          <strong>Disclaimer:</strong> These tips are for guidance only and not financial advice. 
          Consult a tax professional for personalized recommendations.
        </AlertDescription>
      </Alert>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Tax Overview & Unused Limits */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tax Overview */}
          <Card className="shadow-card border-0">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Calculator className="w-5 h-5 text-primary" />
                Your Tax Overview
              </CardTitle>
              <CardDescription className="text-sm">
                Current year tax calculation and potential savings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-xs sm:text-sm text-muted-foreground">Gross Income</span>
                    <span className="font-medium text-sm sm:text-base">₹{taxCalculation.grossIncome.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs sm:text-sm text-muted-foreground">Standard Deduction</span>
                    <span className="font-medium text-success text-sm sm:text-base">-₹{taxCalculation.standardDeduction.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs sm:text-sm text-muted-foreground">Section 80C Used</span>
                    <span className="font-medium text-success text-sm sm:text-base">-₹{taxCalculation.section80C.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs sm:text-sm text-muted-foreground">Section 80D</span>
                    <span className="font-medium text-success text-sm sm:text-base">-₹{taxCalculation.section80D.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-xs sm:text-sm">Taxable Income</span>
                      <span className="text-sm sm:text-base">₹{taxCalculation.taxableIncome.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-xs sm:text-sm text-muted-foreground">Tax Liability</span>
                    <span className="font-medium text-sm sm:text-base">₹{Math.round(taxCalculation.taxLiability).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs sm:text-sm text-muted-foreground">If you utilize remaining 80C</span>
                    <span className="font-medium text-success text-sm sm:text-base">₹{Math.round(potentialTaxLiability).toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-semibold">
                      <span className="text-xs sm:text-sm">Potential Savings</span>
                      <span className="text-success text-sm sm:text-base">₹{Math.round(taxCalculation.potentialSavings).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Unused Tax Saving Limits */}
          <Card className="shadow-card border-0">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Shield className="w-5 h-5 text-primary" />
                Unused Tax Saving Limits
              </CardTitle>
              <CardDescription className="text-sm">
                Maximize your tax savings by utilizing these opportunities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Section 80C</span>
                    <span className="text-sm text-muted-foreground">
                      ₹{section80CUsed.toLocaleString()} / ₹{section80CLimit.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={(section80CUsed / section80CLimit) * 100} className="h-2" />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-muted-foreground">₹{section80CRemaining.toLocaleString()} remaining</span>
                    <span className="text-xs text-muted-foreground">{Math.round((section80CUsed / section80CLimit) * 100)}% used</span>
                  </div>
                </div>
              </div>
              
              <Alert className="border-primary/20 bg-primary/5">
                <Lightbulb className="h-4 w-4 text-primary" />
                <AlertDescription className="text-xs sm:text-sm">
                  <strong>Tip:</strong> You can save ₹{Math.round(taxCalculation.potentialSavings).toLocaleString()} 
                  {" "}in taxes by investing the remaining ₹{section80CRemaining.toLocaleString()} in eligible 80C instruments.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Tax Saving Options */}
          <Card className="shadow-card border-0">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <FileText className="w-5 h-5 text-primary" />
                Tax Saving Options
              </CardTitle>
              <CardDescription className="text-sm">
                Explore investment options to maximize your tax savings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {taxSavingOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <div key={option.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full ${option.color} flex items-center justify-center`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h3 className="font-medium text-sm sm:text-base">{option.name}</h3>
                            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                              {option.category}
                            </Badge>
                          </div>
                        </div>
                        {option.recommended && (
                          <CheckCircle2 className="w-4 h-4 text-success" />
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                        {option.description}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Min:</span>
                          <span className="ml-1">₹{option.minInvestment.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Lock-in:</span>
                          <span className="ml-1">{option.lockInPeriod}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Returns:</span>
                          <span className="ml-1">{option.expectedReturns}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Risk:</span>
                          <span className="ml-1">{option.riskLevel}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Tips */}
        <div className="space-y-6">
          {/* Quick Tips */}
          <Card className="shadow-card border-0">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Lightbulb className="w-5 h-5 text-primary" />
                Quick Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary text-xs font-bold">1</span>
                  </div>
                  <p className="text-xs sm:text-sm">
                    File your ITR before the due date to avoid penalties and interest.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary text-xs font-bold">2</span>
                  </div>
                  <p className="text-xs sm:text-sm">
                    Keep all investment proofs and receipts for easy tax filing.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary text-xs font-bold">3</span>
                  </div>
                  <p className="text-xs sm:text-sm">
                    Consider indexation benefits for long-term investments to reduce tax liability.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary text-xs font-bold">4</span>
                  </div>
                  <p className="text-xs sm:text-sm">
                    Take advantage of HRA exemption if you're paying rent.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Deadlines */}
          <Card className="shadow-card border-0">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Calendar className="w-5 h-5 text-primary" />
                Important Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm">FY 2023-24 Ends</span>
                  <span className="text-xs sm:text-sm font-medium">March 31, 2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm">ITR Filing Due</span>
                  <span className="text-xs sm:text-sm font-medium">July 31, 2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm">Advance Tax (Q1)</span>
                  <span className="text-xs sm:text-sm font-medium">June 15, 2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs sm:text-sm">Advance Tax (Q2)</span>
                  <span className="text-xs sm:text-sm font-medium">September 15, 2024</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TaxTips;