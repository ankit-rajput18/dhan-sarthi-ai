import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Bot, 
  Send, 
  AlertTriangle,
  TrendingUp,
  PiggyBank,
  Calendar,
  Lightbulb,
  Target,
  ChevronUp,
  ChevronDown,
  X,
  MessageSquare,
  BarChart3,
  Settings,
  Sparkles,
  FileText,
  Menu,
  Plus,
  Trash2,
  Edit3
} from "lucide-react";
import { getAuthUser } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const AIMentor = () => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      type: "ai",
      message: "Hello! I'm your AI Money Mentor. I can help you with expense tracking, savings goals, and financial planning. What would you like to know?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [showInsights, setShowInsights] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Changed default to false
  const [conversations, setConversations] = useState([
    { id: 1, title: "Financial Planning Tips", lastMessage: "How can I save more money?", timestamp: "10:30 AM" },
    { id: 2, title: "Savings Goal Strategies", lastMessage: "Show my spending trends", timestamp: "Yesterday" },
    { id: 3, title: "Investment Advice", lastMessage: "Help with loan prepayment", timestamp: "2 days ago" }
  ]);
  const [activeConversation, setActiveConversation] = useState(1);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Get the authenticated user
  const user = getAuthUser();
  const userName = user?.name || "User";
  const userInitial = userName.charAt(0);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = () => {
    if (message.trim()) {
      // Add user message
      const newUserMessage = {
        id: chatHistory.length + 1,
        type: "user",
        message: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setChatHistory(prev => [...prev, newUserMessage]);
      setMessage("");
      setIsTyping(true);
      
      // Simulate AI response with typing indicator
      setTimeout(() => {
        const aiResponse = {
          id: chatHistory.length + 2,
          type: "ai",
          message: getAIResponse(message),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatHistory(prev => [...prev, aiResponse]);
        setIsTyping(false);
      }, 1500);
    }
  };

  const getAIResponse = (userMessage: string) => {
    const responses = [
      "Based on your spending patterns, I recommend focusing on reducing food expenses by 15% and setting up an automated savings transfer. This could help you save an additional ₹2,500 monthly.",
      "Great question! For your financial goals, I suggest creating a diversified investment portfolio with a mix of equity and debt instruments. Consider starting with low-cost index funds.",
      "I've analyzed your expenses and noticed you could save ₹3,000 monthly by optimizing your subscription services and dining expenses. Would you like specific recommendations?",
      "For loan prepayment, I recommend prioritizing high-interest debt first. This strategy will save you the most money in interest payments over time.",
      "Your savings rate is currently 18%, which is good but could be improved. Consider automating transfers to your savings account right after receiving your salary."
    ];
    
    // Simple keyword-based responses
    if (userMessage.toLowerCase().includes("save")) {
      return "To save more money, try the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings. Also, track your expenses daily to identify spending patterns.";
    } else if (userMessage.toLowerCase().includes("invest")) {
      return "For beginners, I recommend starting with mutual funds through SIP (Systematic Investment Plan). This approach helps average out market volatility and requires as little as ₹500 monthly.";
    } else if (userMessage.toLowerCase().includes("loan")) {
      return "If you have high-interest loans (above 12%), prioritize paying them off first. Consider making extra payments toward the principal to reduce the total interest paid.";
    } else if (userMessage.toLowerCase().includes("budget")) {
      return "Create a monthly budget by listing all income sources and expenses. Use the envelope method - allocate specific amounts for each category and stick to them.";
    } else {
      return responses[Math.floor(Math.random() * responses.length)];
    }
  };

  const handleQuickAction = (actionText: string) => {
    setMessage(actionText);
    inputRef.current?.focus();
  };

  const newChat = () => {
    const newId = conversations.length + 1;
    const newConversation = {
      id: newId,
      title: "New Conversation",
      lastMessage: "Started new chat",
      timestamp: "Just now"
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversation(newId);
    setChatHistory([
      {
        id: 1,
        type: "ai",
        message: "Hello! I'm your AI Money Mentor. How can I help you with your finances today?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setSidebarOpen(false);
  };

  const selectConversation = (id: number) => {
    setActiveConversation(id);
    setSidebarOpen(false);
    // In a real app, you would load the conversation history here
  };

  const deleteConversation = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations(prev => prev.filter(conv => conv.id !== id));
    if (id === activeConversation && conversations.length > 1) {
      const remainingConversations = conversations.filter(conv => conv.id !== id);
      if (remainingConversations.length > 0) {
        setActiveConversation(remainingConversations[0].id);
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-gradient-to-br from-background to-surface">
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar for all screens */}
        <div 
          className={`absolute md:relative z-50 h-full bg-background border-r transform transition-transform duration-300 ease-in-out md:translate-x-0
            ${sidebarOpen ? 'translate-x-0 w-64 lg:w-72' : '-translate-x-full w-64 lg:w-72'} flex flex-col`}
        >
          <div className="p-3 border-b">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-primary" />
                Conversations
              </h2>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden" onClick={() => setSidebarOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Button className="w-full justify-start" variant="default" onClick={newChat}>
              <Plus className="w-4 h-4 mr-2" />
              New chat
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-1">
              {conversations.map((conversation) => (
                <div 
                  key={conversation.id}
                  className={`relative group rounded-lg p-2 cursor-pointer transition-colors ${
                    activeConversation === conversation.id 
                      ? 'bg-primary/10 border border-primary/20' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => selectConversation(conversation.id)}
                >
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <MessageSquare className="w-3 h-3 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium truncate">{conversation.title}</h3>
                      <p className="text-xs text-muted-foreground truncate">{conversation.lastMessage}</p>
                      <p className="text-xs text-muted-foreground mt-1">{conversation.timestamp}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => deleteConversation(conversation.id, e)}
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-3 border-t bg-muted/30">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{userName}</p>
                <p className="text-xs text-muted-foreground">Free Plan</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header - Only visible on mobile */}
          <div className="md:hidden p-3 border-b bg-background">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
                <Menu className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-lg font-semibold">AI Mentor</h1>
              </div>
              <Dialog open={showInsights} onOpenChange={setShowInsights}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setShowInsights(true)}>
                    <BarChart3 className="w-5 h-5" />
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-3xl mx-auto space-y-6">
              {chatHistory.map((chat) => (
                <div 
                  key={chat.id} 
                  className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {chat.type === 'ai' && (
                    <Avatar className="w-8 h-8 mr-3 flex-shrink-0 mt-1">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 ${
                    chat.type === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-tr-none' 
                      : 'bg-muted rounded-tl-none'
                  }`}>
                    <p className="text-sm">{chat.message}</p>
                    <p className={`text-xs mt-1 ${
                      chat.type === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      {chat.time}
                    </p>
                  </div>
                  {chat.type === 'user' && (
                    <Avatar className="w-8 h-8 ml-3 flex-shrink-0 mt-1">
                      <AvatarFallback className="bg-muted text-foreground">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <Avatar className="w-8 h-8 mr-3 flex-shrink-0 mt-1">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-3">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Quick Actions - Only on larger screens */}
          <div className="hidden md:block px-4 py-3 border-t bg-background">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Suggested prompts</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "How can I save more money?",
                  "Show my spending trends",
                  "Help with loan prepayment",
                  "Tax-saving suggestions"
                ].map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => handleQuickAction(action)}
                  >
                    {action}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Message Input */}
          <div className="p-4 border-t bg-background">
            <div className="max-w-3xl mx-auto">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Message AI Money Mentor..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 py-5 px-4 rounded-full border shadow-sm"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!message.trim()}
                  size="icon"
                  className="rounded-full h-12 w-12"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-2 hidden md:block">
                AI Money Mentor can make mistakes. Consider checking important information.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Insights Dialog */}
      <Dialog open={showInsights} onOpenChange={setShowInsights}>
        <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
          <DialogHeader className="sm:text-left">
            <DialogTitle className="text-lg sm:text-xl">Financial Insights</DialogTitle>
            <DialogDescription className="text-sm">
              Detailed financial analysis and recommendations
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  Financial Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Savings Rate", value: "24%", icon: PiggyBank, color: "text-success" },
                    { label: "Goal Progress", value: "40%", icon: Target, color: "text-primary" },
                    { label: "Days to Goal", value: "180 days", icon: Calendar, color: "text-warning" }
                  ].map((stat, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 border">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${stat.color.replace('text-', 'bg-')}/10 flex items-center justify-center`}>
                        <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
                        <p className="font-semibold text-lg sm:text-xl">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-3">
                  <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                      Emergency Fund
                    </p>
                    <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400">
                      Increase your emergency fund to 6 months of expenses
                    </p>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                      Savings Progress
                    </p>
                    <p className="text-xs sm:text-sm text-green-600 dark:text-green-400">
                      Your savings rate is above average. Keep up the good work!
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    Quick Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-3">
                  <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                    <p className="text-sm font-medium text-success mb-1">Budget Tracking</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Track your expenses daily to identify spending patterns
                    </p>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm font-medium text-primary mb-1">Investment Strategy</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Start with low-risk investments and gradually diversify
                    </p>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-warning/5 border border-warning/20">
                    <p className="text-sm font-medium text-warning mb-1">Debt Management</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Pay off high-interest debt first to save on interest costs
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIMentor;