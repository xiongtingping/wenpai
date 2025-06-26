import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Database, Upload, FileText, File, FileImage, 
  FileX, AlertCircle, Trash2, Info, Plus, Search,
  SortAsc, SortDesc, Filter, Check
} from "lucide-react";
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
  const [brandAssets, setBrandAssets] = useState<BrandAsset[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('date-new');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { toast } = useToast();
  
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
      setBrandAssets(prev => [...prev, ...newAssets]);
      setIsUploading(false);
      
      // Reset file input
      e.target.value = '';
      
      toast({
        title: "文件上传成功",
        description: `已成功上传 ${newAssets.length} 个品牌资料文件`
      });
    }, 1500);
  };
  
  // Handle file deletion
  const handleDeleteFile = (assetId: string) => {
    setBrandAssets(prev => prev.filter(asset => asset.id !== assetId));
    
    toast({
      title: "文件已删除",
      description: "品牌资料文件已从品牌库中移除"
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
  
  // Sort and filter assets based on search, tab, sort option, and categories
  const filteredAndSortedAssets = (() => {
    // First filter by search query
    let assets = brandAssets.filter(asset => {
      const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (asset.description && asset.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      if (activeTab === 'all') return matchesSearch;
      
      const matchesTab = activeTab === 'documents' ? 
        (asset.type.includes('pdf') || asset.type.includes('word') || asset.type.includes('text')) :
        (activeTab === 'images' ? asset.type.includes('image') : true);
      
      return matchesSearch && matchesTab;
    });
    
    // Then filter by selected categories (if any)
    if (selectedCategories.length > 0) {
      assets = assets.filter(asset => asset.category && selectedCategories.includes(asset.category));
    }
    
    // Finally sort based on selected option
    return assets.sort((a, b) => {
      switch (sortOption) {
        case 'date-new':
          return b.uploadDate.getTime() - a.uploadDate.getTime();
        case 'date-old':
          return a.uploadDate.getTime() - b.uploadDate.getTime();
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
  })();
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">品牌资料库</h1>
          <p className="text-gray-500 mt-1">上传、管理和应用您的品牌资料，提升内容生成质量</p>
        </div>
      </div>
      
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
              />
              <Label 
                htmlFor="file-upload" 
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <Database className="h-12 w-12 text-blue-500 mb-3" />
                <p className="text-lg font-medium mb-1">点击或拖拽文件上传</p>
                <p className="text-sm text-gray-500 mb-4">支持 PDF, Word, Markdown, TXT 等文本格式</p>
                
                <Button 
                  disabled={isUploading}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90"
                >
                  {isUploading ? (
                    <>上传中...</>
                  ) : (
                    <>选择文件</>
                  )}
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
                    <DropdownMenuItem onClick={() => setSortOption('size-asc')} className="flex items-center justify-between">
                      大小（小到大） {sortOption === 'size-asc' && <Check className="h-4 w-4 ml-2" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption('size-desc')} className="flex items-center justify-between">
                      大小（大到小） {sortOption === 'size-desc' && <Check className="h-4 w-4 ml-2" />}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {/* Category Filter */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-1 px-3">
                      <Filter className="h-4 w-4 mr-1" />
                      分类筛选
                      {selectedCategories.length > 0 && (
                        <Badge variant="secondary" className="ml-1">{selectedCategories.length}</Badge>
                      )}
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
                    <div className="mt-2 flex justify-between">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedCategories([])}
                        disabled={selectedCategories.length === 0}
                      >
                        清除筛选
                      </Button>
                      <div className="text-xs text-muted-foreground pt-2">
                        已选: {selectedCategories.length}/{categories.length}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            {/* Active Filters and Sorting Display */}
            {(selectedCategories.length > 0 || sortOption !== 'date-new') && (
              <div className="flex flex-wrap items-center gap-2 mt-4 text-sm">
                <span className="text-gray-500">当前:</span>
                {sortOption !== 'date-new' && (
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                    排序: {getSortOptionName(sortOption)}
                  </Badge>
                )}
                {selectedCategories.map(category => (
                  <Badge 
                    key={category} 
                    variant="secondary" 
                    className="bg-purple-50 text-purple-700 border-purple-200 cursor-pointer"
                    onClick={() => toggleCategory(category)}
                  >
                    {category} ×
                  </Badge>
                ))}
                {(selectedCategories.length > 0 || sortOption !== 'date-new') && (
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-gray-500 text-xs"
                    onClick={() => {
                      setSelectedCategories([]);
                      setSortOption('date-new');
                    }}
                  >
                    重置
                  </Button>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent className="pt-4">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="all" className="flex items-center">
                  <FileText className="h-4 w-4 mr-1" />
                  全部文件
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex items-center">
                  <File className="h-4 w-4 mr-1" />
                  文本资料
                </TabsTrigger>
                <TabsTrigger value="images" className="flex items-center">
                  <FileImage className="h-4 w-4 mr-1" />
                  图像资料
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <div className="space-y-4">
                  {filteredAndSortedAssets.length === 0 ? (
                    <div className="text-center py-12 border border-dashed rounded-lg">
                      <FileX className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-lg font-medium text-gray-600">暂无资料文件</p>
                      <p className="text-sm text-gray-500 mb-4">上传品牌文档、指南或图像以增强内容生成</p>
                      <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90" asChild>
                        <Label htmlFor="file-upload" className="cursor-pointer m-0">
                          <Plus className="h-4 w-4 mr-2" />
                          添加文件
                        </Label>
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 gap-4">
                        {filteredAndSortedAssets.map((asset) => (
                          <Card key={asset.id} className="overflow-hidden border-gray-200 hover:border-blue-300 transition-colors">
                            <div className="flex items-center p-4">
                              <div className="mr-4">
                                {asset.fileIcon}
                              </div>
                              <div className="flex-grow">
                                <h3 className="font-medium text-gray-900">{asset.name}</h3>
                                <div className="flex flex-wrap items-center text-xs text-gray-500 mt-1 gap-2">
                                  <span>{asset.type.split('/')[1]?.toUpperCase()}</span>
                                  <span className="text-gray-300">•</span>
                                  <span>{asset.size}</span>
                                  <span className="text-gray-300">•</span>
                                  <span>{asset.uploadDate.toLocaleDateString()}</span>
                                  {asset.category && (
                                    <>
                                      <span className="text-gray-300">•</span>
                                      <span className="text-blue-600">{asset.category}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <Badge variant="outline" className="ml-2 text-xs border-blue-200 text-blue-700 bg-blue-50">
                                品牌资料
                              </Badge>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDeleteFile(asset.id)}
                                className="ml-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="documents">
                <div className="space-y-4">
                  {filteredAndSortedAssets.filter(asset => asset.type.includes('pdf') || asset.type.includes('word') || asset.type.includes('text')).length === 0 ? (
                    <div className="text-center py-12 border border-dashed rounded-lg">
                      <File className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-lg font-medium text-gray-600">暂无文档资料</p>
                      <p className="text-sm text-gray-500 mb-4">上传品牌文档或指南以增强内容生成</p>
                      <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90" asChild>
                        <Label htmlFor="file-upload" className="cursor-pointer m-0">
                          <Plus className="h-4 w-4 mr-2" />
                          添加文件
                        </Label>
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {filteredAndSortedAssets
                        .filter(asset => asset.type.includes('pdf') || asset.type.includes('word') || asset.type.includes('text'))
                        .map((asset) => (
                          <Card key={asset.id} className="overflow-hidden border-gray-200 hover:border-blue-300 transition-colors">
                            <div className="flex items-center p-4">
                              <div className="mr-4">
                                {asset.fileIcon}
                              </div>
                              <div className="flex-grow">
                                <h3 className="font-medium text-gray-900">{asset.name}</h3>
                                <div className="flex flex-wrap items-center text-xs text-gray-500 mt-1 gap-2">
                                  <span>{asset.type.split('/')[1]?.toUpperCase()}</span>
                                  <span className="text-gray-300">•</span>
                                  <span>{asset.size}</span>
                                  <span className="text-gray-300">•</span>
                                  <span>{asset.uploadDate.toLocaleDateString()}</span>
                                  {asset.category && (
                                    <>
                                      <span className="text-gray-300">•</span>
                                      <span className="text-blue-600">{asset.category}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <Badge variant="outline" className="ml-2 text-xs border-blue-200 text-blue-700 bg-blue-50">
                                品牌文档
                              </Badge>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDeleteFile(asset.id)}
                                className="ml-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="images">
                <div className="space-y-4">
                  {filteredAndSortedAssets.filter(asset => asset.type.includes('image')).length === 0 ? (
                    <div className="text-center py-12 border border-dashed rounded-lg">
                      <FileImage className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-lg font-medium text-gray-600">暂无图像资料</p>
                      <p className="text-sm text-gray-500 mb-4">上传品牌相关图像以增强视觉内容生成</p>
                      <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90" asChild>
                        <Label htmlFor="file-upload" className="cursor-pointer m-0">
                          <Plus className="h-4 w-4 mr-2" />
                          添加图像
                        </Label>
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {filteredAndSortedAssets
                        .filter(asset => asset.type.includes('image'))
                        .map((asset) => (
                          <Card key={asset.id} className="overflow-hidden border-gray-200 hover:border-blue-300 transition-colors">
                            <div className="flex items-center p-4">
                              <div className="mr-4">
                                {asset.fileIcon}
                              </div>
                              <div className="flex-grow">
                                <h3 className="font-medium text-gray-900">{asset.name}</h3>
                                <div className="flex flex-wrap items-center text-xs text-gray-500 mt-1 gap-2">
                                  <span>{asset.type.split('/')[1]?.toUpperCase()}</span>
                                  <span className="text-gray-300">•</span>
                                  <span>{asset.size}</span>
                                  <span className="text-gray-300">•</span>
                                  <span>{asset.uploadDate.toLocaleDateString()}</span>
                                  {asset.category && (
                                    <>
                                      <span className="text-gray-300">•</span>
                                      <span className="text-blue-600">{asset.category}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <Badge variant="outline" className="ml-2 text-xs border-blue-200 text-blue-700 bg-blue-50">
                                品牌图像
                              </Badge>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDeleteFile(asset.id)}
                                className="ml-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <Separator />
          <CardFooter className="p-4 bg-gray-50">
            <div className="flex justify-between w-full items-center">
              <div className="text-sm text-gray-500">
                已使用: <span className="font-medium">{brandAssets.length} 个文件</span>
              </div>
              <Button variant="outline" className="text-sm" asChild>
                <Label htmlFor="file-upload" className="cursor-pointer m-0">
                  <Plus className="h-4 w-4 mr-1" />
                  添加更多
                </Label>
              </Button>
            </div>
          </CardFooter>
        </Card>
        
        {/* How it works section */}
        <Card className="shadow-md border-blue-100 border">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Info className="h-5 w-5 mr-2" />
              品牌资料使用说明
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
            
            <Alert className="mt-6 bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700">
                品牌资料仅存储在您的账户中，不会共享给其他用户，确保品牌信息安全。
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}