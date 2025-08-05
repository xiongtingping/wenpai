/**
 * PDF对话问答组件
 * 支持用户与AI实时对话，针对上传的PDF内容进行问答
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  ScrollArea
} from "@/components/ui/scroll-area";
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  FileText, 
  Loader2,
  Copy,
  Download,
  BookOpen,
  Sparkles,
  X,
  RefreshCw,
  History,
  Settings,
  Lightbulb,
  Target,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { callAI } from '@/api/aiService';

/**
 * 对话消息接口
 */
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  error?: string;
}

/**
 * PDF文档接口
 */
interface PDFDocument {
  id: string;
  name: string;
  content: string;
  uploadDate: Date;
  size?: string;
}

/**
 * PDF对话问答组件属性
 */
interface PDFChatDialogProps {
  documents: PDFDocument[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}

/**
 * PDF对话问答组件
 */
export function PDFChatDialog({ 
  documents, 
  isOpen, 
  onOpenChange,
  className 
}: PDFChatDialogProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<PDFDocument | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[][]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 初始化对话
  useEffect(() => {
    if (isOpen && documents.length > 0) {
      // 选择第一个文档作为默认文档
      setSelectedDocument(documents[0]);
      
      // 创建新的对话ID
      const newChatId = `chat_${Date.now()}`;
      setCurrentChatId(newChatId);
      
      // 添加欢迎消息
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: `您好！我是您的PDF文档助手。我可以帮助您分析文档内容、回答问题、提取关键信息等。

当前文档：${documents[0].name}

您可以问我：
• 文档的主要内容是什么？
• 文档中的关键信息有哪些？
• 帮我总结文档的要点
• 文档中提到了哪些重要数据？
• 基于文档内容，给我一些建议

请告诉我您想了解什么？`,
        timestamp: new Date()
      };
      
      setMessages([welcomeMessage]);
    }
  }, [isOpen, documents]);

  /**
   * 发送消息
   */
  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading || !selectedDocument) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    const assistantMessage: ChatMessage = {
      id: `assistant_${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // 构建上下文提示词
      const contextPrompt = `你是一个专业的PDF文档分析助手。用户上传了一个名为"${selectedDocument.name}"的文档，文档内容如下：

${selectedDocument.content}

用户问题：${inputValue}

请基于文档内容回答用户的问题。要求：
1. 回答要准确、详细，直接引用文档中的相关内容
2. 如果文档中没有相关信息，请明确说明
3. 回答要结构清晰，可以使用列表或分段
4. 保持专业、友好的语调
5. 如果用户的问题涉及分析或建议，请基于文档内容给出合理的建议

请开始回答：`;

      // 调用AI服务
      const response = await callAI({
        prompt: `请分析以下PDF内容并回答问题：\n\nPDF内容：${selectedDocument.content}\n\n问题：${inputValue}`
      });

      if (response.success) {
        let content = '';
        if (typeof response.content === 'string') {
          content = response.content;
        } else if (response.content && typeof response.content === 'object') {
          const dataObj = response.content as any;
          if (dataObj.text) {
            content = dataObj.text;
          } else if (dataObj.content) {
            content = dataObj.content;
          } else {
            content = JSON.stringify(response.content);
          }
        }

        // 更新助手消息
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessage.id 
            ? { ...msg, content, isLoading: false }
            : msg
        ));
      } else {
        throw new Error(response.error || 'AI服务响应失败');
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      
      // 更新错误消息
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, content: '抱歉，我暂时无法回答您的问题。请稍后再试。', isLoading: false, error: '发送失败' }
          : msg
      ));

      toast({
        title: "发送失败",
        description: error instanceof Error ? error.message : "消息发送失败，请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 复制消息内容
   */
  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "已复制",
      description: "消息内容已复制到剪贴板",
    });
  };

  /**
   * 开始新对话
   */
  const startNewChat = () => {
    // 保存当前对话历史
    if (messages.length > 1) {
      setChatHistory(prev => [...prev, messages.slice(1)]);
    }
    
    // 清空当前消息
    setMessages([]);
    
    // 创建新的对话ID
    const newChatId = `chat_${Date.now()}`;
    setCurrentChatId(newChatId);
    
    // 重新初始化欢迎消息
    if (selectedDocument) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: `您好！我是您的PDF文档助手。我可以帮助您分析文档内容、回答问题、提取关键信息等。

当前文档：${selectedDocument.name}

您可以问我：
• 文档的主要内容是什么？
• 文档中的关键信息有哪些？
• 帮我总结文档的要点
• 文档中提到了哪些重要数据？
• 基于文档内容，给我一些建议

请告诉我您想了解什么？`,
        timestamp: new Date()
      };
      
      setMessages([welcomeMessage]);
    }
  };

  /**
   * 处理键盘事件
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /**
   * 生成建议问题
   */
  const generateSuggestions = () => {
    return [
      "文档的主要内容是什么？",
      "文档中的关键信息有哪些？",
      "帮我总结文档的要点",
      "文档中提到了哪些重要数据？",
      "基于文档内容，给我一些建议"
    ];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">PDF文档对话</h2>
              <p className="text-sm text-gray-600">与AI助手对话，深入了解您的PDF文档内容</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={startNewChat}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            新对话
          </Button>
        </div>

        {/* 主体内容区域 */}
        <div className="flex-1 flex flex-col min-h-0 p-4">
          {/* 文档选择器 */}
          {documents.length > 1 && (
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">选择文档：</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {documents.map((doc) => (
                  <Button
                    key={doc.id}
                    variant={selectedDocument?.id === doc.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDocument(doc)}
                    className="text-sm"
                  >
                    {doc.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* 对话区域 */}
          <div className="flex-1 flex flex-col min-h-0 mb-4">
            <div className="flex-1 border border-gray-300 rounded-lg bg-white overflow-hidden">
              {/* 对话内容区域 */}
              <ScrollArea className="h-full p-4">
                <div className="space-y-4 min-h-[350px]">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-48 text-gray-500">
                      <div className="text-center">
                        <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p className="text-lg font-medium mb-1">开始与AI助手对话</p>
                        <p className="text-sm">选择下方的建议问题或直接输入您的问题</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {message.role === 'assistant' && (
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Bot className="h-4 w-4 text-blue-600" />
                          </div>
                        )}

                        <div
                          className={`max-w-[75%] p-3 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-blue-500 text-white rounded-br-sm'
                              : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                          }`}
                        >
                          {message.isLoading ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>正在思考...</span>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                              {message.role === 'assistant' && !message.error && (
                                <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyMessage(message.content)}
                                    className="h-6 px-2 text-xs opacity-70 hover:opacity-100"
                                  >
                                    <Copy className="h-3 w-3 mr-1" />
                                    复制
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {message.role === 'user' && (
                          <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* 建议问题区域 */}
          {messages.length <= 1 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">建议问题：</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {generateSuggestions().map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-sm h-9 px-4 text-blue-700 border-blue-300 hover:bg-blue-100 justify-start"
                    onClick={() => setInputValue(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 输入区域 - 固定在底部 */}
        <div className="border-t bg-gray-50 p-4">
          <div className="flex gap-3">
            <Textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入您的问题，按Enter发送..."
              className="flex-1 min-h-[60px] max-h-[120px] resize-none bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              disabled={isLoading || !selectedDocument}
            />
            <Button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading || !selectedDocument}
              className="px-6 self-end"
              size="lg"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  发送
                </>
              )}
            </Button>
          </div>

          {/* 状态信息 */}
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>
              当前文档：{selectedDocument?.name || '未选择'}
            </span>
            <span>
              按Enter快速发送 • Shift+Enter换行
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PDFChatDialog; 