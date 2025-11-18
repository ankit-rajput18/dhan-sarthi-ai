import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Target, CreditCard, Lightbulb, RefreshCw, Trash2, AlertCircle } from 'lucide-react';

interface MemorySummary {
  profile: {
    avgMonthlyIncome: number;
    avgMonthlyExpenses: number;
    savingsRate: number;
    topSpendingCategories: Array<{ category: string; percentage: number }>;
  };
  currentState: {
    lastExpenses: string;
    goalsSummary: string;
    activeLoans: Array<{ summary: string }>;
    lastAIAdvice: string;
  };
  extractedFacts: {
    mentionedGoals?: string[];
    incomeSource?: string;
    riskTolerance?: string;
    spendingHabits?: string[];
    lifeEvents?: string[];
    preferences?: string[];
  };
  behavioralInsights: {
    recurringExpenses?: Array<{ description: string; frequency: number }>;
    transactionCount?: number;
  };
  stats: {
    totalGoals: number;
    totalLoans: number;
    totalConversations: number;
    lastUpdated: string;
  };
}

const MemoryDashboard: React.FC = () => {
  const [memory, setMemory] = useState<MemorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [insights, setInsights] = useState<string>('');
  const [showInsights, setShowInsights] = useState(false);

  useEffect(() => {
    fetchMemory();
  }, []);

  const fetchMemory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('ds_auth_token') || localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_BASE_URL}/memory`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setMemory(data.memory);
      }
    } catch (error) {
      console.error('Error fetching memory:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMemory = async () => {
    try {
      setUpdating(true);
      const token = localStorage.getItem('ds_auth_token') || localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_BASE_URL}/memory/update`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        await fetchMemory();
        alert('Memory updated successfully!');
      }
    } catch (error) {
      console.error('Error updating memory:', error);
      alert('Failed to update memory');
    } finally {
      setUpdating(false);
    }
  };

  const analyzeConversations = async () => {
    try {
      setUpdating(true);
      const token = localStorage.getItem('ds_auth_token') || localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_BASE_URL}/memory/analyze`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        await fetchMemory();
        alert('Conversations analyzed successfully!');
      }
    } catch (error) {
      console.error('Error analyzing:', error);
      alert('Failed to analyze conversations');
    } finally {
      setUpdating(false);
    }
  };

  const generateInsights = async () => {
    try {
      setUpdating(true);
      const token = localStorage.getItem('ds_auth_token') || localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_BASE_URL}/memory/insights`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        setInsights(data.insights);
        setShowInsights(true);
      }
    } catch (error) {
      console.error('Error generating insights:', error);
      alert('Failed to generate insights');
    } finally {
      setUpdating(false);
    }
  };

  const clearMemory = async (sections: string[]) => {
    if (!confirm(`Are you sure you want to clear ${sections.join(', ')} memory?`)) {
      return;
    }

    try {
      setUpdating(true);
      const token = localStorage.getItem('ds_auth_token') || localStorage.getItem('token');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_BASE_URL}/memory`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ sections })
      });
      const data = await response.json();
      
      if (data.success) {
        await fetchMemory();
        alert('Memory cleared successfully!');
      }
    } catch (error) {
      console.error('Error clearing memory:', error);
      alert('Failed to clear memory');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-16 h-16 text-purple-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading memory...</p>
        </div>
      </div>
    );
  }

  if (!memory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load memory</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-10 h-10 text-purple-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Context Memory</h1>
                <p className="text-gray-600">What DhanSarthi remembers about you</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={updateMemory}
                disabled={updating}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${updating ? 'animate-spin' : ''}`} />
                Update
              </button>
              <button
                onClick={analyzeConversations}
                disabled={updating}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                <Brain className="w-4 h-4" />
                Analyze
              </button>
              <button
                onClick={generateInsights}
                disabled={updating}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Lightbulb className="w-4 h-4" />
                Insights
              </button>
            </div>
          </div>
        </div>

        {/* Insights Modal */}
        {showInsights && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl shadow-lg p-6 mb-6 border-2 border-green-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-bold text-gray-800">Personalized Insights</h2>
              </div>
              <button
                onClick={() => setShowInsights(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-line">{insights}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Financial Profile */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-800">Financial Profile</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Avg Monthly Income</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{memory.profile.avgMonthlyIncome.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Monthly Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  ₹{memory.profile.avgMonthlyExpenses.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Savings Rate</p>
                <p className="text-2xl font-bold text-purple-600">
                  {memory.profile.savingsRate}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Top Spending Categories</p>
                {memory.profile.topSpendingCategories.map((cat, idx) => (
                  <div key={idx} className="flex justify-between items-center mb-2">
                    <span className="text-gray-700">{cat.category}</span>
                    <span className="font-semibold text-blue-600">{cat.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Current State */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-800">Current State</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Recent Expenses</p>
                <p className="text-gray-700">{memory.currentState.lastExpenses || 'No data yet'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Goals Summary</p>
                <p className="text-gray-700">{memory.currentState.goalsSummary || 'No goals set'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Loans</p>
                {memory.currentState.activeLoans.length > 0 ? (
                  memory.currentState.activeLoans.map((loan, idx) => (
                    <p key={idx} className="text-gray-700 text-sm mb-1">{loan.summary}</p>
                  ))
                ) : (
                  <p className="text-gray-700">No active loans</p>
                )}
              </div>
            </div>
          </div>

          {/* Extracted Facts */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-800">Learned About You</h2>
            </div>
            <div className="space-y-3">
              {memory.extractedFacts.incomeSource && (
                <div>
                  <p className="text-sm text-gray-600">Income Source</p>
                  <p className="text-gray-700">{memory.extractedFacts.incomeSource}</p>
                </div>
              )}
              {memory.extractedFacts.riskTolerance && (
                <div>
                  <p className="text-sm text-gray-600">Risk Tolerance</p>
                  <p className="text-gray-700 capitalize">{memory.extractedFacts.riskTolerance}</p>
                </div>
              )}
              {memory.extractedFacts.mentionedGoals && memory.extractedFacts.mentionedGoals.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Mentioned Goals</p>
                  {memory.extractedFacts.mentionedGoals.map((goal, idx) => (
                    <span key={idx} className="inline-block bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm mr-2 mb-2">
                      {goal}
                    </span>
                  ))}
                </div>
              )}
              {memory.extractedFacts.spendingHabits && memory.extractedFacts.spendingHabits.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Spending Habits</p>
                  {memory.extractedFacts.spendingHabits.map((habit, idx) => (
                    <p key={idx} className="text-gray-700 text-sm">• {habit}</p>
                  ))}
                </div>
              )}
              {memory.extractedFacts.lifeEvents && memory.extractedFacts.lifeEvents.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Life Events</p>
                  {memory.extractedFacts.lifeEvents.map((event, idx) => (
                    <p key={idx} className="text-gray-700 text-sm">• {event}</p>
                  ))}
                </div>
              )}
              {!memory.extractedFacts.incomeSource && 
               !memory.extractedFacts.riskTolerance && 
               (!memory.extractedFacts.mentionedGoals || memory.extractedFacts.mentionedGoals.length === 0) && (
                <p className="text-gray-500 italic">Chat with AI Mentor to help me learn about you</p>
              )}
            </div>
          </div>

          {/* Behavioral Insights */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-bold text-gray-800">Behavioral Patterns</h2>
            </div>
            <div className="space-y-3">
              {memory.behavioralInsights.transactionCount && (
                <div>
                  <p className="text-sm text-gray-600">Total Transactions Analyzed</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {memory.behavioralInsights.transactionCount}
                  </p>
                </div>
              )}
              {memory.behavioralInsights.recurringExpenses && 
               memory.behavioralInsights.recurringExpenses.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Recurring Expenses</p>
                  {memory.behavioralInsights.recurringExpenses.slice(0, 5).map((expense, idx) => (
                    <div key={idx} className="flex justify-between items-center mb-2 text-sm">
                      <span className="text-gray-700">{expense.description}</span>
                      <span className="text-blue-600 font-semibold">{expense.frequency}x</span>
                    </div>
                  ))}
                </div>
              )}
              {(!memory.behavioralInsights.recurringExpenses || 
                memory.behavioralInsights.recurringExpenses.length === 0) && (
                <p className="text-gray-500 italic">Add more transactions to see patterns</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats & Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Memory Stats</h2>
            <p className="text-sm text-gray-600">
              Last updated: {new Date(memory.stats.lastUpdated).toLocaleString()}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{memory.stats.totalGoals}</p>
              <p className="text-sm text-gray-600">Active Goals</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{memory.stats.totalLoans}</p>
              <p className="text-sm text-gray-600">Active Loans</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{memory.stats.totalConversations}</p>
              <p className="text-sm text-gray-600">Conversations</p>
            </div>
          </div>

          {/* Clear Memory Actions */}
          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-3">Clear Memory Sections:</p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => clearMemory(['conversations'])}
                className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Conversations
              </button>
              <button
                onClick={() => clearMemory(['financial'])}
                className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Financial Data
              </button>
              <button
                onClick={() => clearMemory(['behavioral'])}
                className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Behavioral
              </button>
              <button
                onClick={() => clearMemory(['all'])}
                className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Last AI Advice */}
        {memory.currentState.lastAIAdvice && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl shadow-lg p-6 mt-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Last AI Advice</h2>
            <p className="text-gray-700">{memory.currentState.lastAIAdvice}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryDashboard;
