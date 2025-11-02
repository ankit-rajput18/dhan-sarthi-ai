import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calculator,
  Plus,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  PieChart,
  CreditCard,
  Home,
  Car,
  FileText,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { loanAPI, transactionAPI } from "@/lib/api";
import { toast } from "sonner";
import { Edit, Trash2 } from "lucide-react";

const LoanAnalyzer = () => {
  const [showAddLoan, setShowAddLoan] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [showLoanDetails, setShowLoanDetails] = useState(false);
  const [showPaymentLogs, setShowPaymentLogs] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [loanData, setLoanData] = useState({
    type: "",
    name: "",
    principal: "",
    interestRate: "",
    tenure: "",
    startDate: new Date().toISOString().split("T")[0],
  });

  const [paymentData, setPaymentData] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [editingLoanId, setEditingLoanId] = useState<string | null>(null);

  const [loans, setLoans] = useState<any[]>([]);

  useEffect(() => {
    const loadLoans = async () => {
      try {
        const res = await loanAPI.getAll({ page: 1, limit: 50 });
        const mapped = (res.loans || []).map((l: any) => ({
          id: l._id,
          name: l.loanName,
          type: l.loanType,
          principal: l.principalAmount,
          remainingBalance: l.remainingBalance,
          emiAmount: l.emiAmount,
          interestRate: l.interestRate,
          tenure: l.tenureMonths,
          totalInterest: l.totalInterest,
          remainingTenure: Math.max(0, Math.ceil((new Date(l.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30))),
          startDate: l.startDate,
          nextDueDate: l.nextEmiDate,
          icon: l.loanType === 'home' ? Home : l.loanType === 'car' ? Car : CreditCard,
          color: l.loanType === 'home' ? 'bg-blue-500' : l.loanType === 'car' ? 'bg-purple-500' : 'bg-orange-500',
          penaltyRate: 0,
          terms: [],
          paymentHistory: (l.payments || []).map((p: any, idx: number) => ({
            id: idx + 1,
            date: p.paymentDate,
            amount: p.amount,
            status: 'paid',
            notes: p.notes || ''
          }))
        }));
        setLoans(mapped);
      } catch (e: any) {
        toast.error(e?.message || 'Failed to load loans');
      }
    };
    loadLoans();
  }, []);

  const totalEMI = useMemo(() => loans.reduce((sum, loan) => sum + (loan.emiAmount || 0), 0), [loans]);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const emiToIncomeRatio = (totalEMI / (monthlyIncome || 1)) * 100;

  useEffect(() => {
    const loadIncome = async () => {
      try {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
        const tx = await transactionAPI.getSummary(start, end);
        setMonthlyIncome(tx?.summary?.totalIncome || 0);
      } catch {
        // keep default 0 on failure
      }
    };
    loadIncome();
  }, []);

  const loanTypes = [
    { value: "home", label: "Home Loan" },
    { value: "car", label: "Vehicle Loan" },
    { value: "personal", label: "Personal Loan" },
    { value: "education", label: "Education Loan" },
    { value: "business", label: "Business Loan" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        loanType: loanData.type as any,
        loanName: (loanData.name && loanData.name.trim()) ? loanData.name.trim() : (loanData.type ? `${loanData.type[0].toUpperCase()+loanData.type.slice(1)} Loan` : 'Loan'),
        principalAmount: parseFloat(loanData.principal),
        interestRate: parseFloat(loanData.interestRate),
        tenureMonths: parseInt(loanData.tenure, 10),
        lender: 'Unknown',
        startDate: new Date(loanData.startDate).toISOString(),
      };
      if (!payload.loanType || isNaN(payload.principalAmount) || isNaN(payload.interestRate) || isNaN(payload.tenureMonths)) {
        toast.error('Please fill all required fields');
        return;
      }
      if (editingLoanId) {
        await loanAPI.update(editingLoanId, {
          loanType: payload.loanType as any,
          loanName: payload.loanName,
          principalAmount: payload.principalAmount,
          interestRate: payload.interestRate,
          tenureMonths: payload.tenureMonths,
          startDate: payload.startDate,
        } as any);
        toast.success('Loan updated');
      } else {
        await loanAPI.create(payload as any);
        toast.success('Loan created');
      }
      setShowAddLoan(false);
      setLoanData({
        type: "",
        name: "",
        principal: "",
        interestRate: "",
        tenure: "",
        startDate: new Date().toISOString().split("T")[0],
      });
      setEditingLoanId(null);
      // reload
      const res = await loanAPI.getAll({ page: 1, limit: 50 });
      const mapped = (res.loans || []).map((l: any) => ({
        id: l._id,
        name: l.loanName,
        type: l.loanType,
        principal: l.principalAmount,
        remainingBalance: l.remainingBalance,
        emiAmount: l.emiAmount,
        interestRate: l.interestRate,
        tenure: l.tenureMonths,
        totalInterest: l.totalInterest,
        remainingTenure: Math.max(0, Math.ceil((new Date(l.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30))),
        startDate: l.startDate,
        nextDueDate: l.nextEmiDate,
        icon: l.loanType === 'home' ? Home : l.loanType === 'car' ? Car : CreditCard,
        color: l.loanType === 'home' ? 'bg-blue-500' : l.loanType === 'car' ? 'bg-purple-500' : 'bg-orange-500',
        penaltyRate: 0,
        terms: [],
        paymentHistory: (l.payments || []).map((p: any, idx: number) => ({ id: idx + 1, date: p.paymentDate, amount: p.amount, status: 'paid', notes: p.notes || '' }))
      }));
      setLoans(mapped);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create loan');
    }
  };

  const openEditLoan = (loan: any) => {
    setEditingLoanId(loan.id);
    setLoanData({
      type: loan.type,
      name: loan.name || '',
      principal: String(loan.principal),
      interestRate: String(loan.interestRate),
      tenure: String(loan.tenure),
      startDate: new Date(loan.startDate).toISOString().split('T')[0],
    });
    setShowAddLoan(true);
  };

  const deleteLoan = async (id: string) => {
    if (!confirm('Delete this loan?')) return;
    try {
      await loanAPI.delete(id);
      toast.success('Loan deleted');
      const res = await loanAPI.getAll({ page: 1, limit: 50 });
      const mapped = (res.loans || []).map((l: any) => ({
        id: l._id,
        name: l.loanName,
        type: l.loanType,
        principal: l.principalAmount,
        remainingBalance: l.remainingBalance,
        emiAmount: l.emiAmount,
        interestRate: l.interestRate,
        tenure: l.tenureMonths,
        totalInterest: l.totalInterest,
        remainingTenure: Math.max(0, Math.ceil((new Date(l.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30))),
        startDate: l.startDate,
        nextDueDate: l.nextEmiDate,
        icon: l.loanType === 'home' ? Home : l.loanType === 'car' ? Car : CreditCard,
        color: l.loanType === 'home' ? 'bg-blue-500' : l.loanType === 'car' ? 'bg-purple-500' : 'bg-orange-500',
        penaltyRate: 0,
        terms: [],
        paymentHistory: (l.payments || []).map((p: any, idx: number) => ({ id: idx + 1, date: p.paymentDate, amount: p.amount, status: 'paid', notes: p.notes || '' }))
      }));
      setLoans(mapped);
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete loan');
    }
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("New payment:", paymentData);
    setShowAddPayment(false);
    setPaymentData({
      amount: "",
      date: new Date().toISOString().split("T")[0],
      notes: "",
    });
  };

  const resetForm = () => {
    setLoanData({
      type: "",
      name: "",
      principal: "",
      interestRate: "",
      tenure: "",
      startDate: new Date().toISOString().split("T")[0],
    });
  };

  const calculateTotalInterest = (
    principal: number,
    rate: number,
    tenure: number
  ) => {
    const monthlyRate = rate / 12 / 100;
    const emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
      (Math.pow(1 + monthlyRate, tenure) - 1);
    return emi * tenure - principal;
  };

  const calculatePenalty = (loan: any) => {
    const today = new Date();
    const dueDate = new Date(loan.nextDueDate);
    if (today > dueDate) {
      const daysLate = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      return (loan.emiAmount * loan.penaltyRate / 100) * daysLate;
    }
    return 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Loan Analyzer</h1>
          <p className="text-muted-foreground">Manage your loans and optimize EMI payments</p>
        </div>
        <Dialog open={showAddLoan} onOpenChange={setShowAddLoan}>
          <DialogTrigger asChild>
            <Button
              variant="hero"
              className="gap-2"
              onClick={() => resetForm()}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Loan</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Loan</DialogTitle>
              <DialogDescription>
                Enter your loan details for tracking and analysis
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Loan Type</Label>
                  <Select
                    value={loanData.type}
                    onValueChange={(value) =>
                      setLoanData((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select loan type" />
                    </SelectTrigger>
                    <SelectContent>
                      {loanTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Loan Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Car Loan"
                    value={loanData.name}
                    onChange={(e) => setLoanData((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="principal">Principal Amount</Label>
                  <Input
                    id="principal"
                    type="number"
                    placeholder="₹ 0"
                    value={loanData.principal}
                    onChange={(e) =>
                      setLoanData((prev) => ({
                        ...prev,
                        principal: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interestRate">Interest Rate (%)</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    step="0.1"
                    placeholder="8.5"
                    value={loanData.interestRate}
                    onChange={(e) =>
                      setLoanData((prev) => ({
                        ...prev,
                        interestRate: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tenure">Tenure (Months)</Label>
                  <Input
                    id="tenure"
                    type="number"
                    placeholder="240"
                    value={loanData.tenure}
                    onChange={(e) =>
                      setLoanData((prev) => ({
                        ...prev,
                        tenure: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  Add Loan
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddLoan(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* AI Suggestion Alert */}
      <Alert className="border-primary/20 bg-primary/5">
        <Lightbulb className="h-4 w-4 text-primary" />
        <AlertDescription>
          <strong>AI Suggestion:</strong> Consider prepaying ₹5,000 extra on
          your personal loan monthly. This could save you ₹18,500 in interest
          and reduce tenure by 8 months.
        </AlertDescription>
      </Alert>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Summary & Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total EMI</p>
                    <p className="text-2xl font-bold text-danger">
                      ₹{totalEMI.toLocaleString()}
                    </p>
                  </div>
                  <Calculator className="w-8 h-8 text-danger" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      EMI to Income
                    </p>
                    <p className="text-2xl font-bold text-warning">
                      {emiToIncomeRatio.toFixed(1)}%
                    </p>
                  </div>
                  <PieChart className="w-8 h-8 text-warning" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Active Loans
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {loans.length}
                    </p>
                  </div>
                  <CreditCard className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* EMI Analysis */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                EMI Analysis
              </CardTitle>
              <CardDescription>Your loan payment insights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Monthly Income</span>
                  <span className="font-medium">
                    ₹{monthlyIncome.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Total EMIs</span>
                  <span className="font-medium text-danger">
                    ₹{totalEMI.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Available Income</span>
                  <span className="font-medium text-success">
                    ₹{(monthlyIncome - totalEMI).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  <span className="text-sm font-medium">
                    EMI to Income Ratio
                  </span>
                </div>
                <Progress value={emiToIncomeRatio} className="h-3 mb-2" />
                <p className="text-xs text-muted-foreground">
                  {emiToIncomeRatio < 40
                    ? "Healthy ratio"
                    : emiToIncomeRatio < 60
                    ? "High but manageable"
                    : "Consider reducing debt"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Loan Cards */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Your Loans</h3>
            {loans.map((loan) => (
              <Card key={loan.id} className="shadow-card border-0">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg ${loan.color} flex items-center justify-center`}
                      >
                        <loan.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{loan.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Next EMI:{" "}
                          {new Date(loan.nextDueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{loan.interestRate}% p.a.</Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">EMI Amount</p>
                      <p className="font-semibold text-lg">
                        ₹{loan.emiAmount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Outstanding</p>
                      <p className="font-semibold text-lg">
                        ₹{(loan.remainingBalance / 100000).toFixed(1)}L
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Remaining Tenure
                      </p>
                      <p className="font-semibold text-lg">
                        {loan.remainingTenure} months
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Interest</p>
                      <p className="font-semibold text-lg">
                        ₹{((loan.totalInterest ?? calculateTotalInterest(loan.principal, loan.interestRate, loan.tenure)) / 100000).toFixed(1)}L
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>
                        Paid: ₹
                        {(
                          (loan.principal - loan.remainingBalance) /
                          100000
                        ).toFixed(1)}
                        L
                      </span>
                      <span>Total: ₹{(loan.principal / 100000).toFixed(1)}L</span>
                    </div>
                    <Progress
                      value={
                        ((loan.principal - loan.remainingBalance) /
                          loan.principal) *
                        100
                      }
                      className="h-2"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedLoan(loan);
                        setShowLoanDetails(true);
                      }}
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedLoan(loan);
                        setShowPaymentLogs(true);
                      }}
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      Logs
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditLoan(loan)}
                    >
                      <Edit className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600"
                      onClick={() => deleteLoan(loan.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column - Quick Tips */}
        <div className="space-y-6">
          {/* Quick Tips */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                Smart Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                <p className="text-sm font-medium text-success mb-1">
                  Prepayment Strategy
                </p>
                <p className="text-xs text-muted-foreground">
                  Prioritize high-interest personal loan for prepayment to
                  save maximum interest.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm font-medium text-primary mb-1">
                  Tax Benefits
                </p>
                <p className="text-xs text-muted-foreground">
                  Home loan interest eligible for ₹2L deduction under Section
                  24(b).
                </p>
              </div>

              <div className="p-3 rounded-lg bg-warning/5 border border-warning/20">
                <p className="text-sm font-medium text-warning mb-1">
                  Emergency Fund
                </p>
                <p className="text-xs text-muted-foreground">
                  Maintain 6 months EMI amount as emergency fund before
                  aggressive prepayment.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Loan Summary Preview */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle>Loan Summary</CardTitle>
              <CardDescription>Overview of your loan portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total Principal</span>
                  <span className="font-medium">
                    ₹{loans.reduce((sum, loan) => sum + loan.principal, 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Outstanding</span>
                  <span className="font-medium">
                    ₹{loans.reduce((sum, loan) => sum + loan.remainingBalance, 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Interest Paid</span>
                  <span className="font-medium">
                    ₹{loans.reduce((sum, loan) => sum + (loan.principal - loan.remainingBalance), 0).toLocaleString()}
                  </span>
                </div>
                <div className="pt-3 border-t border-border">
                  <div className="flex justify-between font-semibold">
                    <span>Total EMI</span>
                    <span className="text-danger">₹{totalEMI.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Loan Details Modal */}
      <Dialog open={showLoanDetails} onOpenChange={setShowLoanDetails}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              {selectedLoan?.icon && <selectedLoan.icon className="w-6 h-6" />}
              {selectedLoan?.name} - Loan Details
            </DialogTitle>
            <DialogDescription className="text-base">
              Complete information about your loan with smart insights
            </DialogDescription>
          </DialogHeader>
          
          {selectedLoan && (
            <div className="space-y-6">
              {/* AI Suggestions */}
              <div className="space-y-3">
                <Alert className="border-primary/20 bg-gradient-to-r from-primary/5 to-blue-50">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <AlertDescription className="text-sm">
                    <strong className="text-primary">AI Suggestion:</strong>{" "}
                    {calculatePenalty(selectedLoan) > 0 ? (
                      <>
                        Your EMI is overdue by {Math.floor((new Date().getTime() - new Date(selectedLoan.nextDueDate).getTime()) / (1000 * 60 * 60 * 24))} days. 
                        Pay ₹{selectedLoan.emiAmount.toLocaleString()} by today to avoid additional penalty charges of ₹{calculatePenalty(selectedLoan).toLocaleString()}.
                      </>
                    ) : (
                      <>
                        Your next EMI of ₹{selectedLoan.emiAmount.toLocaleString()} is due on {new Date(selectedLoan.nextDueDate).toLocaleDateString()}. 
                        Consider paying 3-5 days early to avoid any late payment penalties.
                      </>
                    )}
                  </AlertDescription>
                </Alert>

                {selectedLoan.interestRate > 10 && (
                  <Alert className="border-warning/20 bg-gradient-to-r from-warning/5 to-orange-50">
                    <TrendingUp className="h-5 w-5 text-warning" />
                    <AlertDescription className="text-sm">
                      <strong className="text-warning">High Interest Alert:</strong>{" "}
                      Your {selectedLoan.name} has a high interest rate of {selectedLoan.interestRate}%. 
                      Consider prepaying ₹{Math.round(selectedLoan.emiAmount * 0.5).toLocaleString()} extra monthly to save ₹{Math.round(calculateTotalInterest(selectedLoan.principal, selectedLoan.interestRate, selectedLoan.tenure) * 0.15 / 100000).toFixed(1)}L in interest.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Hero Section with Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      <Badge variant="secondary" className="bg-blue-200 text-blue-800">
                        {selectedLoan.interestRate}% p.a.
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold text-blue-900 mb-1">
                      ₹{(selectedLoan.principal / 100000).toFixed(1)}L
                    </h3>
                    <p className="text-blue-700 font-medium">Principal Amount</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <Badge variant="secondary" className="bg-green-200 text-green-800">
                        {((selectedLoan.principal - selectedLoan.remainingBalance) / selectedLoan.principal * 100).toFixed(1)}%
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold text-green-900 mb-1">
                      ₹{((selectedLoan.principal - selectedLoan.remainingBalance) / 100000).toFixed(1)}L
                    </h3>
                    <p className="text-green-700 font-medium">Amount Paid</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <Badge variant="secondary" className="bg-orange-200 text-orange-800">
                        {selectedLoan.remainingTenure} months
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold text-orange-900 mb-1">
                      ₹{(selectedLoan.remainingBalance / 100000).toFixed(1)}L
                    </h3>
                    <p className="text-orange-700 font-medium">Outstanding Balance</p>
                  </CardContent>
                </Card>
              </div>

              {/* Loan Progress Visualization */}
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-primary" />
                    Loan Progress Overview
                  </CardTitle>
                  <CardDescription>Visual representation of your loan completion status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Main Progress Bar */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Loan Completion</span>
                      <span className="text-lg font-bold text-primary">
                        {((selectedLoan.principal - selectedLoan.remainingBalance) / selectedLoan.principal * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="relative">
                      <Progress
                        value={((selectedLoan.principal - selectedLoan.remainingBalance) / selectedLoan.principal) * 100}
                        className="h-4 bg-gray-100"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-medium text-white drop-shadow">
                          ₹{((selectedLoan.principal - selectedLoan.remainingBalance) / 100000).toFixed(1)}L / ₹{(selectedLoan.principal / 100000).toFixed(1)}L
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium">Principal Paid</span>
                        <span className="ml-auto text-sm font-bold">
                          ₹{((selectedLoan.principal - selectedLoan.remainingBalance) / 100000).toFixed(1)}L
                        </span>
                      </div>
                      <Progress
                        value={((selectedLoan.principal - selectedLoan.remainingBalance) / selectedLoan.principal) * 100}
                        className="h-2 bg-blue-100"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">Interest Paid</span>
                        <span className="ml-auto text-sm font-bold">
                          ₹{(calculateTotalInterest(selectedLoan.principal, selectedLoan.interestRate, selectedLoan.tenure) * 
                            ((selectedLoan.principal - selectedLoan.remainingBalance) / selectedLoan.principal) / 100000).toFixed(1)}L
                        </span>
                      </div>
                      <Progress
                        value={((selectedLoan.principal - selectedLoan.remainingBalance) / selectedLoan.principal) * 100}
                        className="h-2 bg-green-100"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-sm font-medium">Remaining</span>
                        <span className="ml-auto text-sm font-bold">
                          ₹{(selectedLoan.remainingBalance / 100000).toFixed(1)}L
                        </span>
                      </div>
                      <Progress
                        value={(selectedLoan.remainingBalance / selectedLoan.principal) * 100}
                        className="h-2 bg-orange-100"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline and Key Dates */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      Loan Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-3 rounded-lg">
                        
                        <div className="flex-1">
                          <p className="font-medium ">Loan Started</p>
                          <p className="text-sm ">{new Date(selectedLoan.startDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-3  rounded-lg">
                      
                        <div className="flex-1">
                          <p className="font-medium ">Next EMI Due</p>
                          <p className="text-sm ">{new Date(selectedLoan.nextDueDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 p-3 rounded-lg">
                        
                        <div className="flex-1">
                          <p className="font-medium ">Expected Completion</p>
                          <p className="text-sm">
                            {new Date(new Date(selectedLoan.startDate).getTime() + (selectedLoan.tenure * 30 * 24 * 60 * 60 * 1000)).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Interest Analysis */}
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-primary" />
                      Interest Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">Total Interest Payable</span>
                        <span className="font-bold text-lg text-red-600">
                          ₹{(calculateTotalInterest(selectedLoan.principal, selectedLoan.interestRate, selectedLoan.tenure) / 100000).toFixed(1)}L
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="font-medium">Interest Paid So Far</span>
                        <span className="font-bold text-lg text-green-600">
                          ₹{(calculateTotalInterest(selectedLoan.principal, selectedLoan.interestRate, selectedLoan.tenure) * 
                            ((selectedLoan.principal - selectedLoan.remainingBalance) / selectedLoan.principal) / 100000).toFixed(1)}L
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                        <span className="font-medium">Remaining Interest</span>
                        <span className="font-bold text-lg text-orange-600">
                          ₹{(calculateTotalInterest(selectedLoan.principal, selectedLoan.interestRate, selectedLoan.tenure) * 
                            (selectedLoan.remainingBalance / selectedLoan.principal) / 100000).toFixed(1)}L
                        </span>
                      </div>
                    </div>

                    {/* Interest Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Interest Paid</span>
                        <span>{((selectedLoan.principal - selectedLoan.remainingBalance) / selectedLoan.principal * 100).toFixed(1)}%</span>
                      </div>
                      <Progress
                        value={((selectedLoan.principal - selectedLoan.remainingBalance) / selectedLoan.principal) * 100}
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Penalty Alert */}
              {calculatePenalty(selectedLoan) > 0 && (
                <Card className="shadow-lg border-red-200 bg-red-50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-red-900 mb-2">Payment Overdue</h3>
                        <p className="text-red-700 mb-3">
                          Your EMI payment is overdue. A penalty of <strong>₹{calculatePenalty(selectedLoan).toLocaleString()}</strong> has been charged.
                          Please make the payment immediately to avoid additional charges.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Terms & Conditions */}
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Terms & Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedLoan.terms.map((term: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs font-bold">{index + 1}</span>
                        </div>
                        <span className="text-sm leading-relaxed">{term}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Logs Modal */}
      <Dialog open={showPaymentLogs} onOpenChange={setShowPaymentLogs}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {selectedLoan?.name} - Payment Logs
            </DialogTitle>
            <DialogDescription>
              Track your payment history and add new payments
            </DialogDescription>
          </DialogHeader>
          
          {selectedLoan && (
            <div className="space-y-6">
              {/* Add Payment Button */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Payment History</h3>
                <Dialog open={showAddPayment} onOpenChange={setShowAddPayment}>
                  <DialogTrigger asChild>
                    <Button variant="hero" size="sm">
                      <Plus className="w-4 h-4 mr-1" />
                      Add Payment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Payment Record</DialogTitle>
                      <DialogDescription>
                        Record a new payment for {selectedLoan.name}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handlePaymentSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="paymentAmount">Payment Amount</Label>
                        <Input
                          id="paymentAmount"
                          type="number"
                          placeholder="₹ 0"
                          value={paymentData.amount}
                          onChange={(e) =>
                            setPaymentData((prev) => ({
                              ...prev,
                              amount: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="paymentDate">Payment Date</Label>
                        <Input
                          id="paymentDate"
                          type="date"
                          value={paymentData.date}
                          onChange={(e) =>
                            setPaymentData((prev) => ({
                              ...prev,
                              date: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="paymentNotes">Notes (Optional)</Label>
                        <Textarea
                          id="paymentNotes"
                          placeholder="Add any notes about this payment..."
                          value={paymentData.notes}
                          onChange={(e) =>
                            setPaymentData((prev) => ({
                              ...prev,
                              notes: e.target.value,
                            }))
                          }
                        />
                      </div>
                      
                      <div className="flex gap-3 pt-4">
                        <Button type="submit" className="flex-1">
                          Add Payment
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowAddPayment(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Payment History Table */}
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedLoan.paymentHistory.map((payment: any) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            {new Date(payment.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-medium">
                            ₹{payment.amount.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={payment.status === 'paid' ? 'default' : 'destructive'}
                              className="gap-1"
                            >
                              {payment.status === 'paid' ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                              {payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {payment.notes}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Payment Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Summary</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Payments</p>
                    <p className="font-semibold text-lg">
                      ₹{selectedLoan.paymentHistory.reduce((sum: number, payment: any) => sum + payment.amount, 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payments Made</p>
                    <p className="font-semibold text-lg">
                      {selectedLoan.paymentHistory.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Payment</p>
                    <p className="font-semibold text-lg">
                      {selectedLoan.paymentHistory.length > 0 
                        ? new Date(selectedLoan.paymentHistory[0].date).toLocaleDateString()
                        : 'No payments'
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Next Due</p>
                    <p className="font-semibold text-lg">
                      {new Date(selectedLoan.nextDueDate).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoanAnalyzer;