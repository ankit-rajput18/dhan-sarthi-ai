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
  FileText
} from "lucide-react";

const AIMentor = () => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      type: "ai",
      message: "Hi! I'm your AI Money Mentor. I can help you with expense tracking, savings goals, and financial planning. What would you like to know?",
      time: "10:30 AM"
    }
  ]);
  const [showInsights, setShowInsights] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickActions = [
    { id: 1, text: "How can I save more money?", category: "savings" },
    { id: 2, text: "Show my spending trends", category: "analysis" },
    { id: 3, text: "Help with loan prepayment", category: "loans" },
    { id: 4, text: "Tax-saving suggestions", category: "tax" }
  ];

  const stats = [
    { label: "Savings Rate", value: "24%", icon: PiggyBank, color: "text-success" },
    { label: "Goal Progress", value: "40%", icon: Target, color: "text-primary" },
    { label: "Days to Goal", value: "180 days", icon: Calendar, color: "text-warning" }
  ];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: chatHistory.length + 1,
        type: "user",
        message: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setChatHistory(prev => [...prev, newMessage]);
      setMessage("");
      setIsTyping(true);
      
      // Simulate AI response with typing indicator
      setTimeout(() => {
        const aiResponse = {
          id: chatHistory.length + 2,
          type: "ai",
          message: "Thanks for your question! Based on your spending patterns, I recommend focusing on reducing food expenses by 15% and setting up an automated savings transfer. This could help you save an additional ₹2,500 monthly.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatHistory(prev => [...prev, aiResponse]);
        setIsTyping(false);
      }, 2000);
    }
  };

  const handleQuickAction = (actionText: string) => {
    setMessage(actionText);
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI Money Mentor</h1>
            <p className="text-muted-foreground">Your personal finance coach</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Chat Interface */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chat Messages */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                Chat
              </CardTitle>
              <CardDescription>Ask me anything about your finances</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Chat Messages - Scrollable Area */}
              <div 
                className="h-96 overflow-y-auto space-y-4 mb-4 chat-scrollbar"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d1d5db #f3f4f6'
                }}
              >
                {chatHistory.map((chat) => (
                  <div key={chat.id} className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-3 max-w-[85%] ${chat.type === 'user' ? 'flex-row-reverse' : ''}`}>
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className={chat.type === 'ai' ? 'bg-primary text-white' : 'bg-gray-600 text-white'}>
                          {chat.type === 'ai' ? <Bot className="w-4 h-4" /> : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`p-4 rounded-2xl ${
                        chat.type === 'user' 
                          ? 'bg-primary text-white' 
                          : 'bg-white border border-gray-200 shadow-sm'
                      }`}>
                        <p className="text-sm leading-relaxed">{chat.message}</p>
                        <p className={`text-xs mt-2 ${
                          chat.type === 'user' ? 'text-white/70' : 'text-gray-500'
                        }`}>
                          {chat.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex gap-3 max-w-[85%]">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-primary text-white">
                          <Bot className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-white border border-gray-200 shadow-sm p-4 rounded-2xl">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Quick Actions */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Quick Actions</h3>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action) => (
                    <Button
                      key={action.id}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleQuickAction(action.text)}
                    >
                      {action.text}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask me anything about your finances..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 border-gray-300 focus:border-primary focus:ring-primary rounded-xl"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!message.trim()}
                  className="px-4 rounded-xl bg-primary hover:bg-primary/90"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Insights */}
        <div className="space-y-6">
          {/* Financial Insights */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Financial Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-surface/50">
                    <div className={`w-10 h-10 rounded-full ${stat.color.replace('text-', 'bg-')}/10 flex items-center justify-center`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="font-bold text-lg">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-sm font-medium text-blue-700 mb-1">
                  <Lightbulb className="w-4 h-4 inline mr-1" />
                  Recommendation
                </p>
                <p className="text-xs text-blue-600">
                  Consider increasing your emergency fund to 6 months of expenses
                </p>
              </div>
              
              <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                <p className="text-sm font-medium text-green-700 mb-1">
                  <TrendingUp className="w-4 h-4 inline mr-1" />
                  Progress Update
                </p>
                <p className="text-xs text-green-600">
                  Your savings rate is above average. Keep up the good work!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Quick Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                <p className="text-sm font-medium text-success mb-1">Budget Tracking</p>
                <p className="text-xs text-muted-foreground">
                  Track your expenses daily to identify spending patterns
                </p>
              </div>
              
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm font-medium text-primary mb-1">Investment Strategy</p>
                <p className="text-xs text-muted-foreground">
                  Start with low-risk investments and gradually diversify
                </p>
              </div>

              <div className="p-3 rounded-lg bg-warning/5 border border-warning/20">
                <p className="text-sm font-medium text-warning mb-1">Debt Management</p>
                <p className="text-xs text-muted-foreground">
                  Pay off high-interest debt first to save on interest costs
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIMentor;