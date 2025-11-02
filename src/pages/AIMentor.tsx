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
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Edit,
  Trash2
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Define chat item type
interface ChatItem {
  id: number;
  title: string;
}

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
  const [showInsights, setShowInsights] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [hoveredChatId, setHoveredChatId] = useState<number | null>(null);
  const [chatItems, setChatItems] = useState<ChatItem[]>(() => {
    // Load chat items from localStorage or use defaults
    const savedChatItems = localStorage.getItem('aimentor-chat-items');
    if (savedChatItems) {
      try {
        return JSON.parse(savedChatItems);
      } catch (e) {
        console.error("Failed to parse chat items from localStorage", e);
      }
    }
    // Default chat items
    return [
      { id: 1, title: "Financial planning tips" },
      { id: 2, title: "Savings goal strategies" },
      { id: 3, title: "Investment advice" }
    ];
  });
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameChatId, setRenameChatId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [mobileMenuChatId, setMobileMenuChatId] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Get the authenticated user
  const user = getAuthUser();
  const userName = user?.name || "User";

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

  // Save chat items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('aimentor-chat-items', JSON.stringify(chatItems));
  }, [chatItems]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (hoveredChatId !== null) {
        setHoveredChatId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [hoveredChatId]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (mobileMenuChatId !== null) {
        setMobileMenuChatId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [mobileMenuChatId]);

  // Close mobile menu when sidebar is closed
  useEffect(() => {
    if (!isMobileSidebarOpen) {
      setMobileMenuChatId(null);
    }
  }, [isMobileSidebarOpen]);

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

  const newChat = () => {
    setChatHistory([
      {
        id: 1,
        type: "ai",
        message: "Hi! I'm your AI Money Mentor. How can I help you with your finances today?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    // Close mobile sidebar when starting a new chat
    setIsMobileSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleRename = (id: number) => {
    const chatItem = chatItems.find(item => item.id === id);
    if (chatItem) {
      setRenameChatId(id);
      setRenameValue(chatItem.title);
      setRenameDialogOpen(true);
    }
  };

  const handleDelete = (id: number) => {
    // Implementation for deleting a message
    setChatHistory(prev => prev.filter(msg => msg.id !== id));
  };

  const saveRename = () => {
    if (renameChatId !== null && renameValue.trim() !== "") {
      setChatItems(prev => 
        prev.map(item => 
          item.id === renameChatId ? { ...item, title: renameValue.trim() } : item
        )
      );
      setRenameDialogOpen(false);
      setRenameChatId(null);
      setRenameValue("");
    }
  };

  const cancelRename = () => {
    setRenameDialogOpen(false);
    setRenameChatId(null);
    setRenameValue("");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          {/* Mobile sidebar toggle */}
          <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetHeader className="p-4 border-b">
                <SheetTitle>AI Money Mentor</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col h-full">
                <div className="p-2">
                  <Button 
                    className="w-full justify-start" 
                    variant="secondary" 
                    onClick={newChat}
                  >
                    <Plus className="w-4 h-4" />
                    <span className="ml-2">New chat</span>
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  <div className="space-y-1">
                    {chatItems.map((chatItem) => (
                      <div 
                        key={chatItem.id}
                        className="relative flex items-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMobileMenuChatId(prev => prev === chatItem.id ? null : chatItem.id);
                        }}
                      >
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start h-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsMobileSidebarOpen(false);
                          }}
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span className="ml-2 truncate">{chatItem.title}</span>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 ml-1 absolute right-1 top-1/2 transform -translate-y-1/2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              handleRename(chatItem.id);
                              setIsMobileSidebarOpen(false);
                            }} className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20">
                              <Edit className="w-4 h-4 mr-2 text-blue-500" />
                              <span className="text-blue-600 dark:text-blue-300">Rename</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              handleDelete(chatItem.id);
                              setIsMobileSidebarOpen(false);
                            }} className="cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20">
                              <Trash2 className="w-4 h-4 mr-2 text-red-500" />
                              <span className="text-red-600 dark:text-red-300">Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-2 border-t">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm truncate">{userName}</span>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">AI Money Mentor</h1>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showInsights} onOpenChange={setShowInsights}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setShowInsights(true)}>
                <BarChart3 className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Financial Insights</DialogTitle>
                <DialogDescription>
                  Detailed financial analysis and recommendations
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Financial Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {stats.map((stat, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 border">
                          <div className={`w-10 h-10 rounded-full ${stat.color.replace('text-', 'bg-')}/10 flex items-center justify-center`}>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">{stat.label}</p>
                            <p className="font-semibold text-lg">{stat.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Lightbulb className="w-4 h-4 text-primary" />
                        Recommendations
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                          Emergency Fund
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          Increase your emergency fund to 6 months of expenses
                        </p>
                      </div>
                      
                      <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                          Savings Progress
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400">
                          Your savings rate is above average. Keep up the good work!
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        <FileText className="w-4 h-4 text-primary" />
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
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for larger screens */}
        <div className={`hidden md:flex flex-col border-r bg-gray-50 dark:bg-gray-900 transition-all duration-300 ${isSidebarCollapsed ? 'md:w-16' : 'md:w-64 lg:w-72'}`}>
          <div className="p-2 flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-1 h-8 w-8"
              onClick={toggleSidebar}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <div className="space-y-1">
              {chatItems.map((chatItem) => (
                <div 
                  key={chatItem.id}
                  className="relative"
                  onMouseEnter={() => setHoveredChatId(chatItem.id)}
                  onMouseLeave={() => setHoveredChatId(null)}
                  onClick={(e) => {
                    // For mobile/tablet touch devices
                    if (window.innerWidth < 768) {
                      e.stopPropagation();
                      setMobileMenuChatId(mobileMenuChatId === chatItem.id ? null : chatItem.id);
                    }
                  }}
                >
                  <Button variant="ghost" className={`w-full justify-start h-10 ${isSidebarCollapsed ? 'px-2' : 'px-2'}`}>
                    <MessageSquare className="w-4 h-4" />
                    {!isSidebarCollapsed && <span className="ml-2 truncate">{chatItem.title}</span>}
                  </Button>
                  {!isSidebarCollapsed && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={`absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 ${hoveredChatId === chatItem.id || mobileMenuChatId === chatItem.id ? 'opacity-100' : 'opacity-0'} transition-opacity hover:bg-gray-200 dark:hover:bg-gray-700`}
                          onClick={(e) => {
                            // For mobile/tablet touch devices
                            if (window.innerWidth < 768) {
                              e.stopPropagation();
                              setMobileMenuChatId(chatItem.id);
                            }
                          }}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          handleRename(chatItem.id);
                          setMobileMenuChatId(null);
                        }} className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20">
                          <Edit className="w-4 h-4 mr-2 text-blue-500" />
                          <span className="text-blue-600 dark:text-blue-300">Rename</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          handleDelete(chatItem.id);
                          setMobileMenuChatId(null);
                        }} className="cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20">
                          <Trash2 className="w-4 h-4 mr-2 text-red-500" />
                          <span className="text-red-600 dark:text-red-300">Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="p-2 border-t">
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
              </Avatar>
              {!isSidebarCollapsed && <span className="text-sm truncate">{userName}</span>}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 py-6">
              {chatHistory.map((chat) => (
                <div key={chat.id} className={`flex ${chat.type === 'user' ? 'justify-end' : 'justify-start'} mb-6`}>
                  {chat.type === 'ai' && (
                    <Avatar className="w-8 h-8 mr-3 flex-shrink-0">
                      <AvatarFallback className="bg-primary text-white">
                        <Bot className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-[85%] ${chat.type === 'user' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800'} rounded-2xl px-4 py-3 relative group flex items-center`}>
                    <p className="text-sm pr-8">{chat.message}</p>
                    {/* Three dots menu for user messages - only visible on hover/tap */}
                    {chat.type === 'user' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200 dark:hover:bg-gray-700 md:opacity-0"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleRename(chat.id)} className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20">
                            <Edit className="w-4 h-4 mr-2 text-blue-500" />
                            <span className="text-blue-600 dark:text-blue-300">Rename</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(chat.id)} className="cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20">
                            <Trash2 className="w-4 h-4 mr-2 text-red-500" />
                            <span className="text-red-600 dark:text-red-300">Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                    <p className={`text-xs mt-1 ${chat.type === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                      {chat.time}
                    </p>
                  </div>
                  {chat.type === 'user' && (
                    <Avatar className="w-8 h-8 ml-3 flex-shrink-0">
                      <AvatarFallback className="bg-gray-600 text-white">
                        {userName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start mb-6">
                  <Avatar className="w-8 h-8 mr-3 flex-shrink-0">
                    <AvatarFallback className="bg-primary text-white">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="px-4 py-2 border-t">
            <div className="max-w-3xl mx-auto">
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
          </div>

          {/* Message Input */}
          <div className="p-4 border-t">
            <div className="max-w-3xl mx-auto">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Message AI Money Mentor..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!message.trim()}
                  className="px-4"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-center text-muted-foreground mt-2">
                AI Money Mentor can make mistakes. Consider checking important information.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Chat</DialogTitle>
            <DialogDescription>
              Enter a new name for this chat
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="Enter new chat name"
              onKeyPress={(e) => e.key === 'Enter' && saveRename()}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={cancelRename}>
                Cancel
              </Button>
              <Button onClick={saveRename}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIMentor;