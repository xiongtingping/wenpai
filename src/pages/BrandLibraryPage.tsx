import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Database, Upload, FileText, File, FileImage, 
  AlertCircle, Info, Search, Check, Clock, Trash2,
  SortAsc, Filter, Download, Eye, Edit, Copy,
  Globe, Users, Target, Zap, Brain, Sparkles,
  BookOpen, Palette, MessageSquare, Shield,
  Plus, X, RotateCcw, Save, FileUp, FolderOpen
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import PageNavigation from '@/components/layout/PageNavigation';

// Interface for brand assets
interface BrandAsset {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: Date;
  fileIcon: JSX.Element;
  description?: string;
  category?: string;
  content?: string;
  extractedKeywords?: string[];
  brandTone?: string;
  brandVoice?: string;
  isProcessed?: boolean;
  processingStatus?: 'pending' | 'processing' | 'completed' | 'failed';
}

// Interface for brand profile
interface BrandProfile {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  tone: string;
  voice: string;
  style: string;
  doNotUse: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Sort options
type SortOption = 'date-new' | 'date-old' | 'name-asc' | 'name-desc' | 'size-asc' | 'size-desc';

export default function BrandLibraryPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [brandAssets, setBrandAssets] = useState<BrandAsset[]>([]);
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('date-new');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [isAssetDialogOpen, setIsAssetDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<BrandAsset | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Available categories for filtering
  const categories = ["品牌手册", "文案指南", "产品介绍", "营销素材", "新闻稿", "企业介绍", "VI规范", "品牌故事"];
  
  // Initialize brand profile
  useEffect(() => {
    const defaultProfile: BrandProfile = {
      id: '1',
      name: '我的品牌',
      description: '基于上传的品牌资料自动生成的品牌档案',
      keywords: ['专业', '可靠', '创新', '用户友好'],
      tone: '专业而亲切',
      voice: '权威但平易近人',
      style: '简洁明了，注重实用性',
      doNotUse: ['过度营销', '技术术语', '负面词汇'],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setBrandProfile(defaultProfile);
  }, []);

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Process each uploaded file
    const newAssets: BrandAsset[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Generate file icon based on type
      let fileIcon = <FileText className="h-8 w-8 text-blue-500" />;
      
      if (file.type.includes('pdf')) {
        fileIcon = <File className="h-8 w-8 text-red-500" />;
      } else if (file.type.includes('image')) {
        fileIcon = <FileImage className="h-8 w-8 text-green-500" />;
      } else if (file.type.includes('word')) {
        fileIcon = <FileText className="h-8 w-8 text-blue-700" />;
      }
      
      // Assign a random category for demo purposes
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      
      // Create asset object
      const asset: BrandAsset = {
        id: `asset-${Date.now()}-${i}`,
        name: file.name,
        type: file.type,
        size: formatFileSize(file.size),
        uploadDate: new Date(),
        fileIcon,
        description: '',
        category: randomCategory,
        processingStatus: 'pending'
      };
      
      newAssets.push(asset);
      
      // Simulate upload progress
      setUploadProgress(((i + 1) / files.length) * 100);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Add assets to state
    setBrandAssets(prev => [...prev, ...newAssets]);
    
    // Reset file input
    e.target.value = '';
    setIsUploading(false);
    setUploadProgress(0);
    
    toast({
      title: "文件上传成功",
      description: `已成功上传 ${newAssets.length} 个品牌资料文件`,
    });
  };

  // Process brand assets
  const handleProcessAssets = async () => {
    const unprocessedAssets = brandAssets.filter(asset => asset.processingStatus !== 'completed');
    if (unprocessedAssets.length === 0) {
      toast({
        title: "无需处理",
        description: "所有文件都已处理完成",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    for (let i = 0; i < unprocessedAssets.length; i++) {
      const asset = unprocessedAssets[i];
      
      // Update processing status
      setBrandAssets(prev => prev.map(a => 
        a.id === asset.id 
          ? { ...a, processingStatus: 'processing' as const }
          : a
      ));

      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate mock extracted content
      const mockContent = `这是从 ${asset.name} 中提取的品牌相关内容。包含品牌理念、核心价值观、目标受众等信息。`;
      const mockKeywords = ['品牌', '价值', '理念', '目标'];
      const mockTone = '专业而亲切';
      const mockVoice = '权威但平易近人';

      // Update asset with processed data
      setBrandAssets(prev => prev.map(a => 
        a.id === asset.id 
          ? { 
              ...a, 
              content: mockContent,
              extractedKeywords: mockKeywords,
              brandTone: mockTone,
              brandVoice: mockVoice,
              processingStatus: 'completed' as const
            }
          : a
      ));

      setProcessingProgress(((i + 1) / unprocessedAssets.length) * 100);
    }

    setIsProcessing(false);
    setProcessingProgress(0);

    // Update brand profile
    if (brandProfile) {
      const allKeywords = brandAssets
        .filter(asset => asset.extractedKeywords)
        .flatMap(asset => asset.extractedKeywords || []);
      
      const uniqueKeywords = [...new Set(allKeywords)];
      
      setBrandProfile(prev => prev ? {
        ...prev,
        keywords: uniqueKeywords.slice(0, 10),
        updatedAt: new Date()
      } : prev);
    }

    toast({
      title: "处理完成",
      description: `已成功处理 ${unprocessedAssets.length} 个文件`,
    });
  };

  // Handle file deletion
  const handleDeleteFile = (assetId: string) => {
    setBrandAssets(prev => prev.filter(asset => asset.id !== assetId));
    
    toast({
      title: "文件已删除",
      description: "品牌资料文件已从品牌库中移除",
    });
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Toggle category selection
  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // Get sort option display name
  const getSortOptionName = (option: SortOption): string => {
    switch (option) {
      case 'date-new': return '最新上传';
      case 'date-old': return '最早上传';
      case 'name-asc': return '名称 A-Z';
      case 'name-desc': return '名称 Z-A';
      case 'size-asc': return '大小（小到大）';
      case 'size-desc': return '大小（大到小）';
      default: return '最新上传';
    }
  };

  // Filter and sort assets
  const filteredAndSortedAssets = brandAssets
    .filter(asset => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return asset.name.toLowerCase().includes(query) || 
               asset.description?.toLowerCase().includes(query) ||
               asset.category?.toLowerCase().includes(query);
      }
      if (selectedCategories.length > 0) {
        return asset.category && selectedCategories.includes(asset.category);
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortOption) {
        case 'date-new':
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
        case 'date-old':
          return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'size-asc':
          return parseFloat(a.size) - parseFloat(b.size);
        case 'size-desc':
          return parseFloat(b.size) - parseFloat(a.size);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面导航 */}
      <PageNavigation
        title="品牌资料库"
        description="上传、管理和应用您的品牌资料，提升内容生成质量"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsProfileDialogOpen(true)}
            >
              <Users className="h-4 w-4 mr-2" />
              品牌档案
            </Button>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              已上线
            </Badge>
          </div>
        }
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-6">
          {/* Upload Section */}
          <Card className="shadow-md border-blue-100 border">
            <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-600/10">
              <CardTitle className="flex items-center text-lg">
                <Upload className="h-5 w-5 mr-2" />
                上传品牌资料
              </CardTitle>
              <CardDescription>
                上传您的品牌指南、文案风格指南、宣传资料等，帮助AI更好地理解您的品牌调性
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Input 
                  type="file" 
                  id="file-upload" 
                  className="hidden"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.md,.jpg,.png,.gif"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  ref={fileInputRef}
                />
                <Label 
                  htmlFor="file-upload" 
                  className={`cursor-pointer flex flex-col items-center justify-center ${
                    isUploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Database className="h-12 w-12 text-blue-500 mb-3" />
                  <p className="text-lg font-medium mb-1">点击或拖拽文件上传</p>
                  <p className="text-sm text-gray-500 mb-4">支持 PDF, Word, Markdown, TXT 等文本格式</p>
                  
                  <Button 
                    disabled={isUploading}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90"
                  >
                    {isUploading ? (
                      <>
                        <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                        上传中... {Math.round(uploadProgress)}%
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        选择文件
                      </>
                    )}
                  </Button>
                </Label>
              </div>
              
              {isUploading && (
                <Progress value={uploadProgress} className="mt-4" />
              )}
              
              <Alert className="mt-6 bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  上传的品牌资料将用于优化内容生成，AI将模仿品牌语言规范，融入品牌价值，规避公关风险，保持品牌形象始终如一。
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
          
          {/* Library Section */}
          <Card className="shadow-md border-blue-100 border">
            <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-600/10">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                  <CardTitle className="flex items-center text-lg">
                    <Database className="h-5 w-5 mr-2" />
                    品牌资料管理
                  </CardTitle>
                  <CardDescription>
                    管理已上传的品牌资料，分类整理并应用于内容生成
                  </CardDescription>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input 
                      placeholder="搜索资料..." 
                      className="pl-9 w-full sm:w-64" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  {/* Sort Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="h-10 w-10">
                        <SortAsc className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => setSortOption('date-new')} className="flex items-center justify-between">
                        最新上传 {sortOption === 'date-new' && <Check className="h-4 w-4 ml-2" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortOption('date-old')} className="flex items-center justify-between">
                        最早上传 {sortOption === 'date-old' && <Check className="h-4 w-4 ml-2" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortOption('name-asc')} className="flex items-center justify-between">
                        名称 A-Z {sortOption === 'name-asc' && <Check className="h-4 w-4 ml-2" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortOption('name-desc')} className="flex items-center justify-between">
                        名称 Z-A {sortOption === 'name-desc' && <Check className="h-4 w-4 ml-2" />}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  {/* Category Filter */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-1 px-3">
                        <Filter className="h-4 w-4 mr-1" />
                        分类筛选
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64">
                      <Command>
                        <CommandInput placeholder="搜索资料分类..." />
                        <CommandList>
                          <CommandEmpty>未找到分类</CommandEmpty>
                          <CommandGroup heading="可选分类">
                            {categories.map(category => (
                              <CommandItem 
                                key={category} 
                                onSelect={() => toggleCategory(category)}
                                className="flex items-center justify-between"
                              >
                                {category}
                                {selectedCategories.includes(category) && <Check className="h-4 w-4 ml-2" />}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {/* Process Button */}
                  <Button
                    onClick={handleProcessAssets}
                    disabled={isProcessing || brandAssets.filter(a => a.processingStatus !== 'completed').length === 0}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90"
                  >
                    {isProcessing ? (
                      <>
                        <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                        处理中... {Math.round(processingProgress)}%
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        AI处理
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all" className="flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    全部文件 ({filteredAndSortedAssets.length})
                  </TabsTrigger>
                  <TabsTrigger value="documents" className="flex items-center">
                    <File className="h-4 w-4 mr-1" />
                    文本资料
                  </TabsTrigger>
                  <TabsTrigger value="images" className="flex items-center">
                    <FileImage className="h-4 w-4 mr-1" />
                    图像资料
                  </TabsTrigger>
                  <TabsTrigger value="processed" className="flex items-center">
                    <Check className="h-4 w-4 mr-1" />
                    已处理
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="all">
                  {filteredAndSortedAssets.length === 0 ? (
                    <div className="text-center py-12 border border-dashed rounded-lg">
                      <Database className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-lg font-medium text-gray-600">暂无品牌资料</p>
                      <p className="text-sm text-gray-500 mb-4">上传您的品牌资料文件开始使用</p>
                      <Button onClick={() => fileInputRef.current?.click()}>
                        <Upload className="w-4 h-4 mr-2" />
                        上传文件
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredAndSortedAssets.map((asset) => (
                        <Card key={asset.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                {asset.fileIcon}
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-medium text-gray-900 truncate">{asset.name}</h3>
                                  <p className="text-sm text-gray-500">{asset.size}</p>
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <X className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleDeleteFile(asset.id)}>
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    删除
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            
                            <div className="flex items-center justify-between mb-3">
                              <Badge variant="outline" className="text-xs">
                                {asset.category}
                              </Badge>
                              <div className="flex items-center gap-1">
                                {asset.processingStatus === 'completed' && (
                                  <Check className="h-4 w-4 text-green-500" />
                                )}
                                {asset.processingStatus === 'processing' && (
                                  <RotateCcw className="h-4 w-4 text-blue-500 animate-spin" />
                                )}
                                {asset.processingStatus === 'failed' && (
                                  <AlertCircle className="h-4 w-4 text-red-500" />
                                )}
                                <span className="text-xs text-gray-500">
                                  {asset.processingStatus === 'completed' ? '已处理' :
                                   asset.processingStatus === 'processing' ? '处理中' :
                                   asset.processingStatus === 'failed' ? '处理失败' : '待处理'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{asset.uploadDate.toLocaleDateString()}</span>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => {
                                    setSelectedAsset(asset);
                                    setIsAssetDialogOpen(true);
                                  }}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                >
                                  <Download className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="documents">
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600">文本资料功能</p>
                  </div>
                </TabsContent>

                <TabsContent value="images">
                  <div className="text-center py-12">
                    <FileImage className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600">图像资料功能</p>
                  </div>
                </TabsContent>

                <TabsContent value="processed">
                  <div className="text-center py-12">
                    <Check className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600">已处理资料功能</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="p-4 bg-gray-50">
              <div className="flex justify-between w-full items-center">
                <div className="text-sm text-gray-500">
                  共 {brandAssets.length} 个文件，{brandAssets.filter(a => a.processingStatus === 'completed').length} 个已处理
                </div>
                <div className="text-sm text-blue-600">
                  <span className="inline-flex items-center">
                    <Info className="h-4 w-4 mr-1" />
                    AI将自动学习品牌调性
                  </span>
                </div>
              </div>
            </CardFooter>
          </Card>
          
          {/* Brand Profile Section */}
          {brandProfile && (
            <Card className="shadow-md border-purple-100 border">
              <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-600/10">
                <CardTitle className="flex items-center text-lg">
                  <Users className="h-5 w-5 mr-2" />
                  品牌档案
                </CardTitle>
                <CardDescription>
                  基于上传资料自动生成的品牌调性分析
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-3">品牌关键词</h3>
                    <div className="flex flex-wrap gap-2">
                      {brandProfile.keywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">品牌调性</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-500">语气：</span>
                        <span className="text-sm font-medium">{brandProfile.tone}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">声音：</span>
                        <span className="text-sm font-medium">{brandProfile.voice}</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">风格：</span>
                        <span className="text-sm font-medium">{brandProfile.style}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-medium mb-3">避免使用的词汇</h3>
                  <div className="flex flex-wrap gap-2">
                    {brandProfile.doNotUse.map((word, index) => (
                      <Badge key={index} variant="destructive" className="text-xs">
                        {word}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Asset Detail Dialog */}
        <Dialog open={isAssetDialogOpen} onOpenChange={setIsAssetDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>文件详情</DialogTitle>
            </DialogHeader>
            {selectedAsset && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {selectedAsset.fileIcon}
                  <div>
                    <h3 className="font-medium">{selectedAsset.name}</h3>
                    <p className="text-sm text-gray-500">{selectedAsset.size} • {selectedAsset.category}</p>
                  </div>
                </div>
                
                {selectedAsset.content && (
                  <div>
                    <h4 className="font-medium mb-2">提取内容</h4>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      {selectedAsset.content}
                    </div>
                  </div>
                )}
                
                {selectedAsset.extractedKeywords && selectedAsset.extractedKeywords.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">关键词</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedAsset.extractedKeywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>上传时间：{selectedAsset.uploadDate.toLocaleString()}</span>
                  <span>处理状态：{selectedAsset.processingStatus}</span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Brand Profile Dialog */}
        <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>品牌档案设置</DialogTitle>
              <DialogDescription>
                自定义您的品牌调性和关键词
              </DialogDescription>
            </DialogHeader>
            {brandProfile && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="brandName">品牌名称</Label>
                    <Input
                      id="brandName"
                      value={brandProfile.name}
                      onChange={(e) => setBrandProfile(prev => prev ? { ...prev, name: e.target.value } : prev)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="brandDescription">品牌描述</Label>
                    <Input
                      id="brandDescription"
                      value={brandProfile.description}
                      onChange={(e) => setBrandProfile(prev => prev ? { ...prev, description: e.target.value } : prev)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="brandKeywords">品牌关键词（用逗号分隔）</Label>
                  <Input
                    id="brandKeywords"
                    value={brandProfile.keywords.join(', ')}
                    onChange={(e) => setBrandProfile(prev => prev ? { 
                      ...prev, 
                      keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                    } : prev)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="brandTone">品牌语气</Label>
                    <Input
                      id="brandTone"
                      value={brandProfile.tone}
                      onChange={(e) => setBrandProfile(prev => prev ? { ...prev, tone: e.target.value } : prev)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="brandVoice">品牌声音</Label>
                    <Input
                      id="brandVoice"
                      value={brandProfile.voice}
                      onChange={(e) => setBrandProfile(prev => prev ? { ...prev, voice: e.target.value } : prev)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="brandStyle">品牌风格</Label>
                    <Input
                      id="brandStyle"
                      value={brandProfile.style}
                      onChange={(e) => setBrandProfile(prev => prev ? { ...prev, style: e.target.value } : prev)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="doNotUse">避免使用的词汇（用逗号分隔）</Label>
                  <Input
                    id="doNotUse"
                    value={brandProfile.doNotUse.join(', ')}
                    onChange={(e) => setBrandProfile(prev => prev ? { 
                      ...prev, 
                      doNotUse: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                    } : prev)}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setIsProfileDialogOpen(false)}>
                <Save className="w-4 h-4 mr-2" />
                保存设置
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}