const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

// Get auth token
const getAuthToken = () => {
  return localStorage.getItem("ds_auth_token");
};

// API request helper
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }
  
  return response.json();
};

// Transaction API functions
export const transactionAPI = {
  // Get all transactions
  getAll: async (params?: {
    page?: number;
    limit?: number;
    type?: 'income' | 'expense';
    category?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    return apiRequest(`/transactions${queryString ? `?${queryString}` : ''}`);
  },

  // Get single transaction
  getById: async (id: string) => {
    return apiRequest(`/transactions/${id}`);
  },

  // Create transaction
  create: async (data: {
    type: 'income' | 'expense';
    amount: number;
    category: string;
    description: string;
    date?: string;
    tags?: string[];
    location?: string;
    paymentMethod?: string;
    recurring?: {
      isRecurring: boolean;
      frequency?: string;
    };
  }) => {
    return apiRequest('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update transaction
  update: async (id: string, data: Partial<{
    type: 'income' | 'expense';
    amount: number;
    category: string;
    description: string;
    date: string;
    tags: string[];
    location: string;
    paymentMethod: string;
  }>) => {
    return apiRequest(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete transaction
  delete: async (id: string) => {
    return apiRequest(`/transactions/${id}`, {
      method: 'DELETE',
    });
  },

  // Get summary statistics
  getSummary: async (startDate?: string, endDate?: string) => {
    const searchParams = new URLSearchParams();
    if (startDate) searchParams.append('startDate', startDate);
    if (endDate) searchParams.append('endDate', endDate);
    
    const queryString = searchParams.toString();
    return apiRequest(`/transactions/stats/summary${queryString ? `?${queryString}` : ''}`);
  },
};

// Loan API functions
export const loanAPI = {
  // Get all loans
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: 'active' | 'completed' | 'defaulted' | 'prepaid';
    loanType?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    return apiRequest(`/loans${queryString ? `?${queryString}` : ''}`);
  },

  // Get single loan
  getById: async (id: string) => {
    return apiRequest(`/loans/${id}`);
  },

  // Create loan
  create: async (data: {
    loanType: 'personal' | 'home' | 'car' | 'education' | 'business' | 'gold' | 'other';
    loanName: string;
    principalAmount: number;
    interestRate: number;
    tenureMonths: number;
    lender: string;
    startDate?: string;
    loanAccountNumber?: string;
    paymentFrequency?: 'monthly' | 'quarterly' | 'yearly';
    description?: string;
    tags?: string[];
    prepaymentAllowed?: boolean;
    prepaymentCharges?: number;
    insuranceAmount?: number;
    processingFee?: number;
    otherCharges?: number;
  }) => {
    return apiRequest('/loans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update loan
  update: async (id: string, data: Partial<{
    loanType: 'personal' | 'home' | 'car' | 'education' | 'business' | 'gold' | 'other';
    loanName: string;
    principalAmount: number;
    interestRate: number;
    tenureMonths: number;
    lender: string;
    startDate: string;
    loanAccountNumber: string;
    paymentFrequency: 'monthly' | 'quarterly' | 'yearly';
    description: string;
    tags: string[];
    prepaymentAllowed: boolean;
    prepaymentCharges: number;
    insuranceAmount: number;
    processingFee: number;
    otherCharges: number;
  }>) => {
    return apiRequest(`/loans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete loan
  delete: async (id: string) => {
    return apiRequest(`/loans/${id}`, {
      method: 'DELETE',
    });
  },

  // Record payment
  recordPayment: async (loanId: string, data: {
    amount: number;
    emiNumber: number;
    paymentDate?: string;
    paymentMethod?: 'cash' | 'card' | 'upi' | 'netbanking' | 'cheque' | 'auto-debit';
    notes?: string;
    lateFee?: number;
  }) => {
    return apiRequest(`/loans/${loanId}/payments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get EMI schedule
  getEMISchedule: async (loanId: string) => {
    return apiRequest(`/loans/${loanId}/emi-schedule`);
  },

  // Get payment history
  getPayments: async (loanId: string) => {
    return apiRequest(`/loans/${loanId}/payments`);
  },

  // Calculate EMI
  calculateEMI: async (data: {
    principalAmount: number;
    interestRate: number;
    tenureMonths: number;
  }) => {
    return apiRequest('/loans/calculate-emi', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get summary statistics
  getSummary: async (status?: 'active' | 'completed' | 'defaulted' | 'prepaid') => {
    const searchParams = new URLSearchParams();
    if (status) searchParams.append('status', status);
    
    const queryString = searchParams.toString();
    return apiRequest(`/loans/stats/summary${queryString ? `?${queryString}` : ''}`);
  },

  // Get upcoming EMIs
  getUpcomingEMIs: async (days?: number) => {
    const searchParams = new URLSearchParams();
    if (days) searchParams.append('days', days.toString());
    
    const queryString = searchParams.toString();
    return apiRequest(`/loans/upcoming-emis${queryString ? `?${queryString}` : ''}`);
  },
};

// Goals API functions
export const goalsAPI = {
  // Get all goals
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: 'active' | 'completed' | 'cancelled';
    category?: string;
    priority?: 'low' | 'medium' | 'high';
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const queryString = searchParams.toString();
    return apiRequest(`/goals${queryString ? `?${queryString}` : ''}`);
  },

  // Get single goal
  getById: async (id: string) => {
    return apiRequest(`/goals/${id}`);
  },

  // Create goal
  create: async (data: {
    name: string;
    targetAmount: number;
    currentAmount?: number;
    deadline: string;
    category: 'vehicle' | 'home' | 'travel' | 'education' | 'health' | 'technology' | 'luxury' | 'hobby' | 'business' | 'emergency';
    description?: string;
    priority?: 'low' | 'medium' | 'high';
    tags?: string[];
  }) => {
    return apiRequest('/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update goal
  update: async (id: string, data: Partial<{
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
    category: 'vehicle' | 'home' | 'travel' | 'education' | 'health' | 'technology' | 'luxury' | 'hobby' | 'business' | 'emergency';
    description: string;
    priority: 'low' | 'medium' | 'high';
    status: 'active' | 'completed' | 'cancelled';
    tags: string[];
  }>) => {
    return apiRequest(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete goal
  delete: async (id: string) => {
    return apiRequest(`/goals/${id}`, {
      method: 'DELETE',
    });
  },

  // Update current amount
  updateAmount: async (id: string, amount: number) => {
    return apiRequest(`/goals/${id}/amount`, {
      method: 'PUT',
      body: JSON.stringify({ amount }),
    });
  },

  // Get summary statistics
  getSummary: async (status?: 'active' | 'completed' | 'cancelled') => {
    const searchParams = new URLSearchParams();
    if (status) searchParams.append('status', status);
    
    const queryString = searchParams.toString();
    return apiRequest(`/goals/stats/summary${queryString ? `?${queryString}` : ''}`);
  },
};

// Budget API functions
export const budgetAPI = {
  // Get budget for a specific month/year
  getByMonth: async (year: number, month: number) => {
    return apiRequest(`/budgets/${year}/${month}`);
  },

  // Get all budgets for user
  getAll: async () => {
    return apiRequest(`/budgets`);
  },

  // Create or update budget
  save: async (data: {
    month: number;
    year: number;
    categories: Array<{ name: string; amount: number }>;
  }) => {
    return apiRequest('/budgets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update specific category in budget
  updateCategory: async (year: number, month: number, categoryName: string, amount: number) => {
    return apiRequest(`/budgets/${year}/${month}/category/${categoryName}`, {
      method: 'PUT',
      body: JSON.stringify({ amount }),
    });
  },

  // Delete budget for a specific month/year
  delete: async (year: number, month: number) => {
    return apiRequest(`/budgets/${year}/${month}`, {
      method: 'DELETE',
    });
  },
};
