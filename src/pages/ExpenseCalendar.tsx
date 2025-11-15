import { useState, useEffect } from "react";
import React from "react";
import { transactionAPI, budgetAPI } from "@/lib/api"; // Import the transaction and budget APIs
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Utensils,
  Car,
  ShoppingBag,
  Zap,
  Gamepad2,
  MoreHorizontal,
  Edit,
  Trash2,
  X,
  Clock,
  Calendar,
  AlertCircle,
  Target, // Add Target icon for budget
  CheckCircle // Add check icon for confirmation
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner"; // Import toast for notifications

interface Transaction {
  id: string; // Changed to string to match MongoDB _id
  amount: number;
  category: string;
  description: string;
  date: string;
  time: string;
  createdAt: Date;
}

interface TransactionFormData {
  amount: string;
  category: string;
  description: string;
  date: string;
  time: string;
}

interface BudgetCategory {
  category: string;
  amount: number;
  icon: any;
  color: string;
  label: string;
}

const ExpenseCalendar = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showEditExpense, setShowEditExpense] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSetBudget, setShowSetBudget] = useState(false); // Add state for budget dialog
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const [quickAddAmount, setQuickAddAmount] = useState("");
  const [formData, setFormData] = useState<TransactionFormData>({
    amount: "",
    category: "",
    description: "",
    date: "",
    time: ""
  });
  // Add state for budget data
  const [budgetData, setBudgetData] = useState<BudgetCategory[]>([
    { category: "food", amount: 0, icon: Utensils, color: "bg-red-500", label: "Food" },
    { category: "transport", amount: 0, icon: Car, color: "bg-orange-500", label: "Transport" },
    { category: "shopping", amount: 0, icon: ShoppingBag, color: "bg-yellow-500", label: "Shopping" },
    { category: "bills", amount: 0, icon: Zap, color: "bg-green-500", label: "Bills" },
    { category: "entertainment", amount: 0, icon: Gamepad2, color: "bg-blue-500", label: "Entertainment" }
  ]);
  const [hasBudget, setHasBudget] = useState(false); // Track if budget exists for current month
  const [transactions, setTransactions] = useState<Transaction[]>([]); // Will be populated from API
  const [loading, setLoading] = useState(true);

  const categoryIcons: { [key: string]: { icon: any; color: string; label: string } } = {
    food: { icon: Utensils, color: "bg-red-500", label: "Food" },
    transport: { icon: Car, color: "bg-orange-500", label: "Transport" },
    shopping: { icon: ShoppingBag, color: "bg-yellow-500", label: "Shopping" },
    bills: { icon: Zap, color: "bg-green-500", label: "Bills" },
    entertainment: { icon: Gamepad2, color: "bg-blue-500", label: "Entertainment" }
  };

  // Fetch transactions from API when component mounts
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await transactionAPI.getAll({ type: 'expense' });
      // Transform API response to match component's expected format
      // Use local date formatting instead of UTC to avoid timezone issues
      const transformedTransactions = response.transactions.map((transaction: any) => {
        const transactionDate = new Date(transaction.date);
        return {
          id: transaction._id,
          amount: transaction.amount,
          category: transaction.category,
          description: transaction.description,
          date: getDateKey(transactionDate), // Use local date instead of UTC
          time: transactionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          createdAt: new Date(transaction.createdAt)
        };
      });
      setTransactions(transformedTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  // Get transactions for a specific date
  const getTransactionsForDate = (date: Date) => {
    const dateKey = getDateKey(date);
    return transactions.filter(t => t.date === dateKey);
  };

  // Get total amount for a specific date
  const getDayTotal = (date: Date) => {
    const dayTransactions = getTransactionsForDate(date);
    return dayTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  };

  // Debug function to log amounts
  const debugDayTotal = (date: Date, total: number) => {
    // console.log(`Date: ${date.toDateString()}, Total: ${total}, Formatted: ${formatCompactAmount(total)}`);
    return total;
  };

  // Get date key in YYYY-MM-DD format (using local timezone instead of UTC)
  const getDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format amount for compact display
  const formatCompactAmount = (amount: number) => {
    if (amount >= 100000) {
      return `${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    } else {
      // For very small amounts, ensure we show at least something
      return amount > 0 ? amount.toString() : '0';
    }
  };

  // Get current date key
  const getCurrentDateKey = () => {
    return getDateKey(new Date());
  };

  // Initialize form with selected date
  useEffect(() => {
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        date: getDateKey(selectedDate),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
    }
  }, [selectedDate]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!showAddExpense && !showEditExpense) {
      setFormData({
        amount: "",
        category: "",
        description: "",
        date: getCurrentDateKey(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      setEditingTransaction(null);
    }
  }, [showAddExpense, showEditExpense]);

  // Load budget data when current month changes
  useEffect(() => {
    const loadBudgetData = async () => {
      try {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth() + 1; // JavaScript months are 0-indexed
        
        const response = await budgetAPI.getByMonth(year, month);
        if (response.budget) {
          // Update budgetData with values from API
          const updatedBudgetData = budgetData.map(category => {
            const budgetCategory = response.budget.categories.find((c: any) => c.name === category.category);
            return {
              ...category,
              amount: budgetCategory ? budgetCategory.amount : 0
            };
          });
          setBudgetData(updatedBudgetData);
          setHasBudget(true);
        } else {
          setHasBudget(false);
        }
      } catch (error: any) {
        // If budget not found, that's okay - we'll use default values
        if (error.message !== "Budget not found") {
          console.error("Error loading budget:", error);
          toast.error("Failed to load budget data");
        }
        setHasBudget(false);
      }
    };
    
    loadBudgetData();
  }, [currentMonth]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for previous month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getWeeklyData = () => {
    const days = getDaysInMonth(currentMonth);
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    
    return weeks.map((week, weekIndex) => {
      const weekTotal = week.reduce((sum, day) => {
        if (day) {
          return sum + getDayTotal(day);
        }
        return sum;
      }, 0);
      
      return {
        weekNumber: weekIndex + 1,
        total: weekTotal,
        average: weekTotal / week.filter(day => day !== null).length
      };
    });
  };

  const monthTotal = getDaysInMonth(currentMonth).reduce((sum, day) => {
    if (day) {
      return sum + getDayTotal(day);
    }
    return sum;
  }, 0);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  // CRUD Operations
  const handleAddTransaction = async () => {
    if (!formData.amount || !formData.category || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Fix the date/time handling to ensure proper ISO format
      const dateTimeString = `${formData.date}T${formData.time}`;
      const date = new Date(dateTimeString);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        toast.error("Invalid date or time format");
        return;
      }

      const transactionData = {
        type: 'expense' as const,
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        date: date.toISOString()
      };

      const response = await transactionAPI.create(transactionData);
      toast.success("Expense added successfully");
      
      // Add the new transaction to the state
      const newTransaction: Transaction = {
        id: response.transaction._id,
        amount: response.transaction.amount,
        category: response.transaction.category,
        description: response.transaction.description,
        date: getDateKey(new Date(response.transaction.date)), // Use local date instead of UTC
        time: new Date(response.transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: new Date(response.transaction.createdAt)
      };

      setTransactions(prev => [...prev, newTransaction]);
      setShowAddExpense(false);
      
      // Update selected date if adding to a different date
      if (selectedDate && getDateKey(selectedDate) !== formData.date) {
        setSelectedDate(new Date(formData.date));
      }
    } catch (error: any) {
      console.error("Error adding transaction:", error);
      toast.error(error.message || "Failed to add expense");
    }
  };

  const handleEditTransaction = async () => {
    if (!editingTransaction || !formData.amount || !formData.category || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Fix the date/time handling to ensure proper ISO format
      const dateTimeString = `${formData.date}T${formData.time}`;
      const date = new Date(dateTimeString);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        toast.error("Invalid date or time format");
        return;
      }

      const transactionData = {
        type: 'expense' as const,
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        date: date.toISOString()
      };

      await transactionAPI.update(editingTransaction.id, transactionData);
      toast.success("Expense updated successfully");
      
      // Update the transaction in the state
      setTransactions(prev => prev.map(t => 
        t.id === editingTransaction.id 
          ? { 
              ...t, 
              amount: parseFloat(formData.amount),
              category: formData.category,
              description: formData.description,
              date: formData.date,
              time: formData.time
            }
          : t
      ));

      setShowEditExpense(false);
      setEditingTransaction(null);
    } catch (error: any) {
      console.error("Error updating transaction:", error);
      toast.error(error.message || "Failed to update expense");
    }
  };

  const handleDeleteTransaction = async () => {
    if (!deletingTransaction) return;

    try {
      await transactionAPI.delete(deletingTransaction.id);
      toast.success("Expense deleted successfully");
      
      // Remove the transaction from the state
      setTransactions(prev => prev.filter(t => t.id !== deletingTransaction.id));
      setShowDeleteConfirm(false);
      setDeletingTransaction(null);
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Failed to delete expense");
    }
  };

  const openEditDialog = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      amount: transaction.amount.toString(),
      category: transaction.category,
      description: transaction.description,
      date: transaction.date,
      time: transaction.time
    });
    setShowEditExpense(true);
  };

  const openDeleteDialog = (transaction: Transaction) => {
    setDeletingTransaction(transaction);
    setShowDeleteConfirm(true);
  };

  const handleQuickAdd = async (date: Date) => {
    if (quickAddAmount && parseFloat(quickAddAmount) > 0) {
      try {
        // Use the date directly for quick add
        const transactionData = {
          type: 'expense' as const,
          amount: parseFloat(quickAddAmount),
          category: "food", // Default category for quick add
          description: "Quick expense",
          date: date.toISOString()
        };

        const response = await transactionAPI.create(transactionData);
        toast.success("Expense added successfully");
        
        // Add the new transaction to the state
        const newTransaction: Transaction = {
          id: response.transaction._id,
          amount: response.transaction.amount,
          category: response.transaction.category,
          description: response.transaction.description,
          date: getDateKey(new Date(response.transaction.date)), // Use local date instead of UTC
          time: new Date(response.transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          createdAt: new Date(response.transaction.createdAt)
        };

        setTransactions(prev => [...prev, newTransaction]);
        setQuickAddAmount("");
        
        // Select the date if not already selected
        if (!selectedDate || getDateKey(selectedDate) !== getDateKey(date)) {
          setSelectedDate(date);
        }
      } catch (error: any) {
        console.error("Error adding quick transaction:", error);
        toast.error(error.message || "Failed to add expense");
      }
    }
  };

  const handleFormChange = (field: keyof TransactionFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Expense Calendar</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Visual overview of your daily spending patterns</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Add Budget Button - More interactive with visual feedback */}
          <Dialog open={showSetBudget} onOpenChange={setShowSetBudget}>
            <DialogTrigger asChild>
              <Button 
                variant={hasBudget ? "default" : "hero"} 
                className={`gap-2 transition-all duration-300 ${hasBudget ? 'bg-green-600 hover:bg-green-700' : ''}`}
                size="sm"
              >
                {hasBudget ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span className="hidden xs:inline">Budget Set</span>
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4" />
                    <span className="hidden xs:inline">Set Budget</span>
                  </>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Target className="w-5 h-5 text-primary" />
                  Monthly Budget
                </DialogTitle>
                <DialogDescription className="text-sm">
                  Set your budget limits for each category for {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {budgetData.map((budget, index) => (
                  <div key={budget.category} className="grid grid-cols-3 items-center gap-3 p-3 rounded-lg bg-surface/50 hover:bg-surface/70 transition-colors">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg ${budget.color} flex items-center justify-center`}>
                        <budget.icon className="w-4 h-4 text-white" />
                      </div>
                      <Label htmlFor={`budget-${budget.category}`} className="font-medium text-sm">
                        {budget.label}
                      </Label>
                    </div>
                    <div className="col-span-2">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                        <Input
                          id={`budget-${budget.category}`}
                          type="number"
                          placeholder="0"
                          className="pl-8 text-sm"
                          value={budget.amount || ""}
                          onChange={(e) => {
                            const newBudgetData = [...budgetData];
                            newBudgetData[index].amount = Number(e.target.value);
                            setBudgetData(newBudgetData);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex flex-col sm:flex-row gap-2 justify-end pt-4">
                  <Button variant="outline" onClick={() => setShowSetBudget(false)} className="w-full sm:w-auto text-sm">
                    Cancel
                  </Button>
                  <Button 
                    variant="hero" 
                    onClick={async () => {
                      try {
                        const year = currentMonth.getFullYear();
                        const month = currentMonth.getMonth() + 1; // JavaScript months are 0-indexed
                        
                        // Format data for API
                        const categories = budgetData.map(budget => ({
                          name: budget.category,
                          amount: budget.amount
                        }));
                        
                        await budgetAPI.save({ month, year, categories });
                        setHasBudget(true);
                        toast.success("Budget updated successfully");
                        setShowSetBudget(false);
                      } catch (error) {
                        console.error("Error saving budget:", error);
                        toast.error("Failed to save budget");
                      }
                    }}
                    className="w-full sm:w-auto text-sm"
                  >
                    Save Budget
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Existing Add Expense Button */}
          <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
            <DialogTrigger asChild>
              <Button variant="hero" className="gap-2" size="sm">
                <Plus className="w-4 h-4" />
                <span className="hidden xs:inline">Add Expense</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Add New Expense</DialogTitle>
                <DialogDescription className="text-sm">Record a new expense for the selected date</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="text-sm">Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0"
                      value={formData.amount}
                      onChange={(e) => handleFormChange('amount', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => handleFormChange('category', value)}>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryIcons).map(([key, { label }]) => (
                          <SelectItem key={key} value={key} className="text-sm">{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What was this expense for?"
                    value={formData.description}
                    onChange={(e) => handleFormChange('description', e.target.value)}
                    rows={2}
                    className="text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleFormChange('date', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time" className="text-sm">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleFormChange('time', e.target.value)}
                      className="text-sm"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowAddExpense(false)} className="w-full sm:w-auto text-sm">
                    Cancel
                  </Button>
                  <Button 
                    variant="hero" 
                    onClick={handleAddTransaction}
                    disabled={!formData.amount || !formData.category || !formData.description}
                    className="w-full sm:w-auto text-sm"
                  >
                    Add Expense
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar - Takes full width on mobile, 3 columns on large screens */}
        <div className="lg:col-span-3">
          <Card className="shadow-card border-0">
            <CardHeader className="pb-4 sm:pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <CardDescription className="text-sm">
                Click on any date to view detailed transactions.
              </CardDescription>
              <div className="mt-2 p-3 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-sm font-medium text-primary">Total spent this month:</span>
                  <span className="text-xl sm:text-2xl font-bold text-primary">₹{monthTotal.toLocaleString()}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-xs sm:text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
                
                {getDaysInMonth(currentMonth).map((date, index) => {
                  if (!date) {
                    return <div key={index} className="p-2"></div>;
                  }
                  
                  const dayTotal = debugDayTotal(date, getDayTotal(date));
                  const hasExpenses = dayTotal > 0;
                  const isToday = date.toDateString() === new Date().toDateString();
                  const isSelected = selectedDate?.toDateString() === date.toDateString();
                  
                  return (
                    <div
                      key={index}
                      className={`p-2 h-[70px] sm:h-[80px] border rounded-lg cursor-pointer transition-all hover:shadow-md flex flex-col ${
                        isSelected ? 'border-primary bg-primary/5' : 
                        isToday ? 'border-primary bg-primary/10' : 
                        hasExpenses ? 'border-border bg-surface/50' : 'border-border'
                      }`}
                      onClick={() => setSelectedDate(date)}
                    >
                      <div className="flex justify-between items-start">
                        <span className={`text-sm sm:text-base font-medium ${isToday ? 'text-primary' : ''}`}>
                          {date.getDate()}
                        </span>
                        {hasExpenses && (
                          <div className="w-2 h-2 rounded-full bg-danger"></div>
                        )}
                      </div>
                      
                      {hasExpenses && (
                        <div className="mt-1 flex-1 flex items-end justify-end">
                          <div className="text-xs font-medium text-danger truncate max-w-full" style={{ direction: 'rtl', textAlign: 'right' }}>
                            ₹{formatCompactAmount(dayTotal)}
                          </div>
                        </div>
                      )}
                      
                      {!hasExpenses && (
                        <div className="mt-1 flex-1 flex items-end justify-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDate(date);
                              setShowAddExpense(true);
                            }}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - Full width on mobile */}
        <div className="space-y-6">
          {/* Selected Date Details */}
          {selectedDate && (
            <Card className="shadow-card border-0">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="text-lg">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </CardTitle>
                <CardDescription className="text-sm">
                  Daily transactions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {getTransactionsForDate(selectedDate).length > 0 ? (
                  <>
                    {getTransactionsForDate(selectedDate).map((transaction) => (
                      <div key={transaction.id} className="p-3 rounded-lg bg-surface/50 hover:bg-surface/70 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg ${categoryIcons[transaction.category]?.color} flex items-center justify-center`}>
                              {categoryIcons[transaction.category] && 
                                React.createElement(categoryIcons[transaction.category].icon, { className: "w-4 h-4 text-white" })
                              }
                            </div>
                            <div>
                              <p className="text-sm font-medium">{transaction.description}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {transaction.time}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-2">
                            <span className="font-medium text-danger">₹{transaction.amount}</span>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 hover:bg-primary/10"
                                onClick={() => openEditDialog(transaction)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                                onClick={() => openDeleteDialog(transaction)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="pt-3 border-t border-border">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Day Total:</span>
                        <span className="font-bold text-danger">₹{getDayTotal(selectedDate).toLocaleString()}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <CalendarIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No expenses for this day</p>
                    <Button variant="outline" size="sm" className="mt-2" onClick={() => setShowAddExpense(true)}>
                      <Plus className="w-3 h-3 mr-1" />
                      Add Expense
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Transaction Dialog */}
      <Dialog open={showEditExpense} onOpenChange={setShowEditExpense}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Edit Expense</DialogTitle>
            <DialogDescription className="text-sm">Update the expense details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-amount" className="text-sm">Amount (₹)</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  placeholder="0"
                  value={formData.amount}
                  onChange={(e) => handleFormChange('amount', e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category" className="text-sm">Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleFormChange('category', value)}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryIcons).map(([key, { label }]) => (
                      <SelectItem key={key} value={key} className="text-sm">{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description" className="text-sm">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="What was this expense for?"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                rows={2}
                className="text-sm"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-date" className="text-sm">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleFormChange('date', e.target.value)}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-time" className="text-sm">Time</Label>
                <Input
                  id="edit-time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleFormChange('time', e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowEditExpense(false)} className="w-full sm:w-auto text-sm">
                Cancel
              </Button>
              <Button 
                variant="hero" 
                onClick={handleEditTransaction}
                disabled={!formData.amount || !formData.category || !formData.description}
                className="w-full sm:w-auto text-sm"
              >
                Update Expense
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Delete Expense
            </DialogTitle>
            <DialogDescription className="text-sm">
              Are you sure you want to delete this expense? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {deletingTransaction && (
              <Alert>
                <AlertDescription>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg ${categoryIcons[deletingTransaction.category]?.color} flex items-center justify-center`}>
                      {categoryIcons[deletingTransaction.category] && 
                        React.createElement(categoryIcons[deletingTransaction.category].icon, { className: "w-4 h-4 text-white" })
                      }
                    </div>
                    <div>
                      <p className="font-medium text-sm">{deletingTransaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        ₹{deletingTransaction.amount} • {deletingTransaction.date}
                      </p>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            <div className="flex flex-col sm:flex-row gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="w-full sm:w-auto text-sm">
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteTransaction}
                className="w-full sm:w-auto text-sm"
              >
                Delete Expense
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpenseCalendar;