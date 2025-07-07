import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Database, Upload, FileText, File, FileImage, 
  AlertCircle, Info, Search,
  SortAsc, Filter, Check, Clock, ArrowLeft
} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
}

// Sorting options
type SortOption = 'date-new' | 'date-old' | 'name-asc' | 'name-desc' | 'size-asc' | 'size-desc';

export default function BrandLibraryPage() {
  const [activeTab, setActiveTab] = useState('all');
  // const [brandAssets, setBrandAssets] = useState<BrandAsset[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('date-new');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Available categories for filtering
  const categories = ["品牌手册", "文案指南", "产品介绍", "营销素材", "新闻稿", "企业介绍"];
  
  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    
    // Process each uploaded file (for demo purposes)
    const newAssets: BrandAsset[] = [];
    
    Array.from(files).forEach((file, index) => {
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
        id: `asset-${Date.now()}-${index}`,
        name: file.name,
        type: file.type,
        size: formatFileSize(file.size),
        uploadDate: new Date(),
        fileIcon,
        description: '',
        category: randomCategory
      };
      
      newAssets.push(asset);
    });
    
    // Simulate uploading delay
    setTimeout(() => {
      // setBrandAssets(prev => [...prev, ...newAssets]);
      setIsUploading(false);
      
      // Reset file input
      e.target.value = '';
      
      toast({
        title: "文件上传成功",
        description: `已成功上传 ${newAssets.length} 个品牌资料文件`
      });
    }, 1500);
  };
  
  // Handle file deletion (currently unused but kept for future implementation)
  // const handleDeleteFile = (assetId: string) => {
  //   setBrandAssets(prev => prev.filter(asset => asset.id !== assetId));
  //   
  //   toast({
  //     title: "文件已删除",
  //     description: "品牌资料文件已从品牌库中移除"
  //   });
  // };
  
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
  
  // Get sort option display name (currently unused but kept for future implementation)
  // const getSortOptionName = (option: SortOption): string => {
  //   switch (option) {
  //     case 'date-new': return '最新上传';
  //     case 'date-old': return '最早上传';
  //     case 'name-asc': return '名称 A-Z';
  //     case 'name-desc': return '名称 Z-A';
  //     case 'size-asc': return '大小（小到大）';
  //     case 'size-desc': return '大小（大到小）';
  //     default: return '最新上传';
  //   }
  // };
  

  
  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => window.location.href = '/adapt'}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          返回内容适配器
        </Button>
      </div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent flex items-center">
            品牌资料库
            <Badge variant="outline" className="ml-3 bg-amber-50 text-amber-700 border-amber-200">
              <Clock className="h-3 w-3 mr-1" />
              功能开发中
            </Badge>
          </h1>
          <p className="text-gray-500 mt-1">上传、管理和应用您的品牌资料，提升内容生成质量</p>
        </div>
      </div>
      
      {/* Development In Progress Notification */}
      <Alert className="mb-6 bg-amber-50 border-amber-200">
        <AlertCircle className="h-5 w-5 text-amber-600" />
        <AlertDescription className="text-amber-700 flex-1">
          <p className="font-medium">品牌库功能正在开发中</p>
          <p className="text-sm mt-1">我们正在努力开发这项高级功能，预计将于近期上线。品牌库将帮助您维护品牌一致性，确保所有生成内容符合您的品牌调性。</p>
        </AlertDescription>
      </Alert>
      
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
                disabled={isUploading || true} // Disabled for development notification
              />
              <Label 
                htmlFor="file-upload" 
                className="cursor-not-allowed flex flex-col items-center justify-center opacity-70"
              >
                <Database className="h-12 w-12 text-blue-500 mb-3" />
                <p className="text-lg font-medium mb-1">点击或拖拽文件上传</p>
                <p className="text-sm text-gray-500 mb-4">支持 PDF, Word, Markdown, TXT 等文本格式</p>
                
                <Button 
                  disabled={true}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 opacity-50"
                >
                  功能即将上线
                </Button>
              </Label>
            </div>
            
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
              
              <div className="flex flex-col sm:flex-row gap-3 opacity-50">
                {/* Search Input */}
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input 
                    placeholder="搜索资料..." 
                    className="pl-9 w-full sm:w-64" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={true}
                  />
                </div>
                
                {/* Sort Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-10 w-10" disabled={true}>
                      <SortAsc className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => setSortOption('date-new')} className="flex items-center justify-between">
                      最新上传 {sortOption === 'date-new' && <Check className="h-4 w-4 ml-2" />}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {/* Category Filter */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-1 px-3" disabled={true}>
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
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all" className="flex items-center" disabled>
                  <FileText className="h-4 w-4 mr-1" />
                  全部文件
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center" disabled>
                  <File className="h-4 w-4 mr-1" />
                  文本资料
                </TabsTrigger>
                <TabsTrigger value="images" className="flex items-center" disabled>
                  <FileImage className="h-4 w-4 mr-1" />
                  图像资料
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <div className="text-center py-12 border border-dashed rounded-lg">
                  <Clock className="h-12 w-12 mx-auto text-amber-500 mb-3" />
                  <p className="text-lg font-medium text-gray-600">功能即将上线</p>
                  <p className="text-sm text-gray-500 mb-4">我们正在开发品牌库功能，敬请期待！</p>
                  <div className="mt-4 flex justify-center">
                    <span className="inline-flex items-center bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-sm">
                      <Clock className="h-4 w-4 mr-2" />
                      预计7月15日上线
                    </span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="p-4 bg-gray-50">
            <div className="flex justify-between w-full items-center">
              <div className="text-sm text-gray-500">
                功能开发中，敬请期待
              </div>
              <div className="text-sm text-blue-600">
                <span className="inline-flex items-center">
                  <Info className="h-4 w-4 mr-1" />
                  上线后将会通知您
                </span>
              </div>
            </div>
          </CardFooter>
        </Card>
        
        {/* How it works section */}
        <Card className="shadow-md border-blue-100 border">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Info className="h-5 w-5 mr-2" />
              品牌库功能预览
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="font-medium text-blue-700">1</span>
                </div>
                <div>
                  <h3 className="font-medium">上传品牌资料</h3>
                  <p className="text-gray-600 text-sm">上传您的品牌指南、文案风格指南、产品描述、企业介绍等文档</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="font-medium text-blue-700">2</span>
                </div>
                <div>
                  <h3 className="font-medium">内容生成时勾选使用</h3>
                  <p className="text-gray-600 text-sm">在编写内容时，勾选"使用品牌资料"选项，AI将参考您的品牌资料</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="font-medium text-blue-700">3</span>
                </div>
                <div>
                  <h3 className="font-medium">获得品牌一致的内容</h3>
                  <p className="text-gray-600 text-sm">AI会自动提取品牌库中的相关资料，生成符合品牌调性的内容</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="font-medium mb-2 text-blue-700">品牌库功能计划：</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>支持上传多种文档类型（PDF、Word、TXT等）</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>智能提取品牌表达风格、关键词和语气</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>生成内容时自动应用品牌风格和禁用词规避</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                  <span>多平台内容适配时保持品牌一致性</span>
                </li>
              </ul>
            </div>
            
            <Alert className="mt-6 bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700">
                敬请期待！品牌库功能即将上线，帮助您维护跨平台内容的品牌一致性。
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}