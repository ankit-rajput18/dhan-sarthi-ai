import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  PiggyBank, 
  TrendingUp, 
  TrendingDown, 
  Calculator, 
  Calendar, 
  Bot,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Utensils,
  Car,
  ShoppingBag,
  Zap,
  Gamepad2,
  Book,
  Plane,
  MoreHorizontal
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { getAuthUser } from '@/lib/auth';
import { useEffect, useMemo, useState } from 'react';
import { transactionAPI, loanAPI } from '@/lib/api';
import { toast } from "sonner";

const Dashboard = () => {
  // Get current user
  const user = getAuthUser();
  const userName = user?.name || 'User';

  // Dynamic top-cards data
  const [monthlyIncome, setMonthlyIncome] = useState<number>(0);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [nextEmiAmount, setNextEmiAmount] = useState<number>(0);
  const [nextEmiDueInDays, setNextEmiDueInDays] = useState<number | null>(null);
  const [expenseData, setExpenseData] = useState<any[]>([]); // Real expense data
  const [monthlyData, setMonthlyData] = useState<any[]>([]); // Real monthly trend data

  useEffect(() => {
    const loadData = async () => {
      try {
        // This month range
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();

        // Transactions summary for this month
        const tx = await transactionAPI.getSummary(start, end);
        const income = tx?.summary?.totalIncome || 0;
        const expense = tx?.summary?.totalExpenses || 0;
        setMonthlyIncome(income);
        setTotalExpenses(expense);

        // Load real expense breakdown data
        await loadExpenseBreakdown(start, end);
        
        // Load real monthly trend data
        await loadMonthlyTrend();

        // Upcoming EMIs (with fallback if summary endpoint not available)
        try {
          const loans = await loanAPI.getUpcomingEMIs(60);
          const upcoming = (loans?.upcomingEmis || []).filter((e: any) => e.daysUntilDue >= 0);
          if (upcoming.length > 0) {
            const soonest = upcoming.sort((a: any, b: any) => a.daysUntilDue - b.daysUntilDue)[0];
            setNextEmiAmount(soonest.nextEmiAmount || 0);
            setNextEmiDueInDays(soonest.daysUntilDue ?? null);
          } else {
            throw new Error('No upcoming from summary');
          }
        } catch {
          // Fallback: fetch active loans and compute next EMI
          try {
            const list = await loanAPI.getAll({ status: 'active', limit: 100 });
            const items = (list?.loans || [])
              .map((l: any) => ({
                date: new Date(l.nextEmiDate),
                amount: l.nextEmiAmount || l.emiAmount || 0,
              }))
              .filter((x: any) => isFinite(x.date.getTime()));
            const future = items
              .map((x: any) => ({ ...x, days: Math.ceil((x.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) }))
              .filter((x: any) => x.days >= 0);
            if (future.length > 0) {
              const soonest = future.sort((a: any, b: any) => a.days - b.days)[0];
              setNextEmiAmount(soonest.amount || 0);
              setNextEmiDueInDays(soonest.days);
            } else if (items.length > 0) {
              // if all are overdue, show the most recent overdue
              const overdue = items
                .map((x: any) => ({ ...x, days: Math.ceil((x.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) }))
                .sort((a: any, b: any) => a.days - b.days)[0];
              setNextEmiAmount(overdue.amount || 0);
              setNextEmiDueInDays(overdue.days);
            } else {
              setNextEmiAmount(0);
              setNextEmiDueInDays(null);
            }
          } catch {
            setNextEmiAmount(0);
            setNextEmiDueInDays(null);
          }
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        toast.error("Failed to load dashboard data");
      }
    };
    
    loadData();
  }, []);

  // Load real expense breakdown data
  const loadExpenseBreakdown = async (startDate: string, endDate: string) => {
    try {
      const response = await transactionAPI.getSummary(startDate, endDate);
      const categoryBreakdown = response?.categoryBreakdown || [];
      
      // Map categories to colors and icons
      const categoryConfig: { [key: string]: { color: string; icon: any } } = {
        food: { color: '#ef4444', icon: Utensils },
        transport: { color: '#f97316', icon: Car },
        shopping: { color: '#eab308', icon: ShoppingBag },
        bills: { color: '#22c55e', icon: Zap },
        entertainment: { color: '#3b82f6', icon: Gamepad2 },
        healthcare: { color: '#ec4899', icon: Plus },
        education: { color: '#8b5cf6', icon: Book },
        travel: { color: '#06b6d4', icon: Plane },
        'other-expense': { color: '#64748b', icon: MoreHorizontal }
      };

      // Transform data for the pie chart
      const transformedData = categoryBreakdown
        .filter((item: any) => item._id !== 'other-income' && item._id !== 'salary' && item._id !== 'freelance' && item._id !== 'investment' && item._id !== 'business')
        .map((item: any) => ({
          name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
          value: item.total,
          color: categoryConfig[item._id]?.color || '#64748b',
          icon: categoryConfig[item._id]?.icon || Plus
        }))
        .sort((a: any, b: any) => b.value - a.value);

      setExpenseData(transformedData);
    } catch (error) {
      console.error("Error loading expense breakdown:", error);
      // Fallback to dummy data if API fails
      setExpenseData([
        { name: 'Food', value: 8500, color: '#ef4444' },
        { name: 'Transport', value: 3200, color: '#f97316' },
        { name: 'Shopping', value: 4500, color: '#eab308' },
        { name: 'Bills', value: 6800, color: '#22c55e' },
        { name: 'Entertainment', value: 2800, color: '#3b82f6' },
      ]);
    }
  };

  // Load real monthly trend data
  const loadMonthlyTrend = async () => {
    try {
      // Get data for the last 6 months
      const months = [];
      const now = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const start = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
        
        const response = await transactionAPI.getSummary(start, end);
        const income = response?.summary?.totalIncome || 0;
        const expense = response?.summary?.totalExpenses || 0;
        
        months.push({
          month: date.toLocaleString('default', { month: 'short' }),
          income: Math.round(income),
          expense: Math.round(expense)
        });
      }
      
      setMonthlyData(months);
    } catch (error) {
      console.error("Error loading monthly trend:", error);
      // Fallback to dummy data if API fails
      setMonthlyData([
        { month: 'Jan', income: 45000, expense: 32000 },
        { month: 'Feb', income: 45000, expense: 28000 },
        { month: 'Mar', income: 45000, expense: 35000 },
        { month: 'Apr', income: 45000, expense: 31000 },
        { month: 'May', income: 45000, expense: 29000 },
        { month: 'Jun', income: 45000, expense: 33000 },
      ]);
    }
  };

  const monthlySavings = monthlyIncome - totalExpenses;
  const savingsPercentage = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;

  const aiInsights = [
    {
      type: 'warning',
      icon: AlertTriangle,
      text: "You spent 30% more on food this month compared to last month.",
      actionable: true
    },
    {
      type: 'success', 
      icon: CheckCircle2,
      text: "Great job! You're on track to meet your savings goal.",
      actionable: false
    },
    {
      type: 'tip',
      icon: Lightbulb,
      text: "Consider switching to a higher yield savings account for better returns.",
      actionable: true
    }
  ];

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="mb-6 sm:mb-8">
        <h1 className="mobile-heading font-bold mb-2">Hi {userName} 👋</h1>
        <p className="mobile-body text-muted-foreground">Keep up the great work with your financial goals!</p>
      </div>

      {/* Quick Stats */}
      <div className="mobile-grid mb-6 sm:mb-8">
        <Card className="shadow-card border-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="mobile-caption text-muted-foreground">Monthly Income</p>
                <p className="mobile-title font-bold text-success">₹{monthlyIncome.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-success/10 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="mobile-caption text-muted-foreground">Monthly Expenses</p>
                <p className="mobile-title font-bold text-danger">₹{totalExpenses.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-danger/10 flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5 sm:w-6 sm:h-6 text-danger" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="mobile-caption text-muted-foreground">Saved This Month</p>
                <p className="mobile-title font-bold text-primary">₹{monthlySavings.toLocaleString()}</p>
                <p className="mobile-caption text-success">{savingsPercentage.toFixed(1)}% of income</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <PiggyBank className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-0">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="mobile-caption text-muted-foreground">Next EMI</p>
                <p className="mobile-title font-bold">₹{nextEmiAmount.toLocaleString()}</p>
                <p className="mobile-caption text-warning">{nextEmiDueInDays !== null ? `Due in ${nextEmiDueInDays} days` : 'No upcoming EMIs'}</p>
              </div>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-warning/10 flex items-center justify-center">
                <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          {/* Expense Breakdown */}
          <Card className="shadow-card border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 mobile-subtitle">
                <TrendingUp className="w-5 h-5 text-primary" />
                Monthly Expense Breakdown
              </CardTitle>
              <CardDescription className="mobile-caption">Where your money is going this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-48 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {expenseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {expenseData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="mobile-caption font-medium">{item.name}</span>
                      </div>
                      <span className="mobile-caption text-muted-foreground">₹{item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trend */}
          <Card className="shadow-card border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 mobile-subtitle">
                <Calendar className="w-5 h-5 text-primary" />
                Income vs Expenses Trend
              </CardTitle>
              <CardDescription className="mobile-caption">Your financial pattern over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, '']} />
                    <Legend />
                    <Bar dataKey="income" fill="hsl(var(--success))" name="Income" />
                    <Bar dataKey="expense" fill="hsl(var(--danger))" name="Expense" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6 sm:space-y-8">
          {/* Savings Goal */}
          

          {/* AI Insights */}
          <Card className="shadow-card border-0">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 mobile-subtitle">
                <Bot className="w-5 h-5 text-primary" />
                AI Money Insights
              </CardTitle>
              <CardDescription className="mobile-caption">Personalized tips from your AI mentor</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiInsights.map((insight, index) => (
                <div key={index} className="flex gap-3 p-3 rounded-lg bg-surface/50">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    insight.type === 'warning' ? 'bg-warning/10' :
                    insight.type === 'success' ? 'bg-success/10' : 'bg-primary/10'
                  }`}>
                    <insight.icon className={`w-4 h-4 ${
                      insight.type === 'warning' ? 'text-warning' :
                      insight.type === 'success' ? 'text-success' : 'text-primary'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="mobile-caption">{insight.text}</p>
                    {insight.actionable && (
                      <Button variant="ghost" size="sm" className="p-0 h-auto text-primary mt-2 mobile-caption">
                        Take Action →
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;