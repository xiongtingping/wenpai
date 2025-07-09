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
import BrandProfileGenerator from '@/components/creative/BrandProfileGenerator';
import BrandProfileViewer from '@/components/creative/BrandProfileViewer';
import { BrandProfile, BrandAsset } from '@/types/brand';

// Sort options
type SortOption = 'date-new' | 'date-old' | 'name-asc' | 'name-desc' | 'size-asc' | 'size-desc';

export default function BrandLibraryPage() {
  const [activeTab, setActiveTab] = useState('profile');
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
      tone: '专业而亲切',
      slogans: ['专业可靠', '用户友好', '创新引领'],
      keywords: ['专业', '可靠', '创新', '用户友好'],
      forbiddenWords: ['过度营销', '技术术语', '负面词汇'],
      files: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      aiAnalysis: {
        toneAnalysis: '专业而亲切',
        keyThemes: ['专业', '可靠', '创新'],
        brandPersonality: '专业可靠的品牌形象',
        targetAudience: '追求专业解决方案的用户',
        contentSuggestions: ['强调专业性', '突出可靠性', '展现创新性'],
        valueAlignment: ['建议1', '建议2'],
        topicConsistency: ['建议1', '建议2']
      }
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
        type: 'document', // Default to document type
        content: '', // Placeholder for content
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
          return parseFloat(a.size || '0') - parseFloat(b.size || '0');
        case 'size-desc':
          return parseFloat(b.size || '0') - parseFloat(a.size || '0');
        default:
          return 0;
      }
    });

  // 处理品牌档案生成
  const handleProfileGenerated = (profile: BrandProfile) => {
    setBrandProfile(profile);
    toast({
      title: "品牌档案已更新",
      description: "AI 已完成品牌调性分析",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageNavigation
        title="品牌资料库"
        description="上传并管理品牌资料，AI 自动分析品牌调性"
      />

      <div className="container mx-auto py-6 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">
              <Brain className="h-4 w-4 mr-2" />
              品牌调性
            </TabsTrigger>
            <TabsTrigger value="assets">
              <FileText className="h-4 w-4 mr-2" />
              资料管理
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 品牌资料上传和分析 */}
              <BrandProfileGenerator
                onProfileGenerated={handleProfileGenerated}
                existingProfile={brandProfile}
              />

              {/* 品牌调性分析结果 */}
              {brandProfile && (
                <BrandProfileViewer profile={brandProfile} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="assets">
            {/* 保留原有的资料管理功能 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 资料卡片列表 */}
              {brandAssets.map(asset => (
                <Card key={asset.id} className="flex flex-col">
                  <CardHeader className="flex-grow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {asset.fileIcon || <FileText className="h-8 w-8 text-blue-500" />}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{asset.name}</h3>
                          <p className="text-sm text-gray-500">{asset.size || '未知大小'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="text-xs">
                        {asset.category || '未知分类'}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteFile(asset.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {asset.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {asset.description}
                      </p>
                    )}
                  </CardHeader>

                  <CardFooter className="border-t pt-4">
                    {asset.processingStatus === 'pending' && (
                      <Badge variant="outline" className="w-full justify-center">
                        <Clock className="h-3 w-3 mr-1" />
                        待处理
                      </Badge>
                    )}
                    {asset.processingStatus === 'processing' && (
                      <Badge variant="secondary" className="w-full justify-center">
                        <Brain className="h-3 w-3 mr-1 animate-pulse" />
                        分析中
                      </Badge>
                    )}
                    {asset.processingStatus === 'completed' && (
                      <Badge variant="default" className="w-full justify-center">
                        <Check className="h-3 w-3 mr-1" />
                        已完成
                      </Badge>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}