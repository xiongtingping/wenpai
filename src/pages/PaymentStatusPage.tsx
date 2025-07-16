/**
 * 支付状态管理页面
 * 用于查看和管理所有支付状态
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  RefreshCw, 
  Download, 
  Upload, 
  Trash2, 
  Settings, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  X,
  Search,
  Filter
} from 'lucide-react';
import { paymentStatusService, PaymentStatusData } from '@/services/paymentStatusService';
import { EnhancedPaymentStatusMonitor } from '@/components/payment/EnhancedPaymentStatusMonitor';

export default function PaymentStatusPage() {
  const [allPayments, setAllPayments] = useState<PaymentStatusData[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentStatusData[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [monitoringPayments, setMonitoringPayments] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadPaymentData();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [allPayments, searchTerm, statusFilter]);

  /**
   * 加载支付数据
   */
  const loadPaymentData = () => {
    try {
      setIsLoading(true);
      const allPaymentsData = paymentStatusService.getAllPaymentStatuses();
      const paymentsArray = Object.values(allPaymentsData);
      setAllPayments(paymentsArray);
      
      const statsData = paymentStatusService.getPaymentStats();
      setStats(statsData);
    } catch (error) {
      console.error('加载支付数据失败:', error);
      toast({
        title: "加载失败",
        description: "无法加载支付数据",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 过滤支付记录
   */
  const filterPayments = () => {
    let filtered = allPayments;

    // 按状态过滤
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    // 按搜索词过滤
    if (searchTerm) {
      filtered = filtered.filter(payment => 
        payment.checkoutId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPayments(filtered);
  };

  /**
   * 开始监控支付状态
   */
  const startMonitoring = (checkoutId: string) => {
    setMonitoringPayments(prev => [...prev, checkoutId]);
    toast({
      title: "开始监控",
      description: "正在监控支付状态",
    });
  };

  /**
   * 停止监控支付状态
   */
  const stopMonitoring = (checkoutId: string) => {
    setMonitoringPayments(prev => prev.filter(id => id !== checkoutId));
    toast({
      title: "停止监控",
      description: "已停止监控该支付",
    });
  };

  /**
   * 删除支付记录
   */
  const deletePayment = (checkoutId: string) => {
    paymentStatusService.removePaymentStatus(checkoutId);
    setMonitoringPayments(prev => prev.filter(id => id !== checkoutId));
    loadPaymentData();
    
    toast({
      title: "删除成功",
      description: "支付记录已删除",
    });
  };

  /**
   * 导出支付数据
   */
  const exportData = () => {
    try {
      const data = paymentStatusService.exportPaymentData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payment-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "导出成功",
        description: "支付数据已导出",
      });
    } catch (error) {
      console.error('导出失败:', error);
      toast({
        title: "导出失败",
        description: "无法导出支付数据",
        variant: "destructive",
      });
    }
  };

  /**
   * 导入支付数据
   */
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string;
        const success = paymentStatusService.importPaymentData(data);
        
        if (success) {
          loadPaymentData();
          toast({
            title: "导入成功",
            description: "支付数据已导入",
          });
        } else {
          toast({
            title: "导入失败",
            description: "数据格式错误",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('导入失败:', error);
        toast({
          title: "导入失败",
          description: "无法解析文件",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  /**
   * 清理所有数据
   */
  const clearAllData = () => {
    if (window.confirm('确定要删除所有支付数据吗？此操作不可恢复。')) {
      paymentStatusService.resetAllData();
      setAllPayments([]);
      setFilteredPayments([]);
      setMonitoringPayments([]);
      setStats(null);
      
      toast({
        title: "清理完成",
        description: "所有支付数据已删除",
      });
    }
  };

  /**
   * 获取状态图标
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
      case 'expired':
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  /**
   * 获取状态颜色
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'expired':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * 格式化时间
   */
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-gray-600">正在加载支付数据...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="container mx-auto max-w-6xl">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">支付状态管理</h1>
          <p className="text-gray-600 mt-2">查看和管理所有支付状态</p>
        </div>

        {/* 统计信息 */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-gray-600">总支付数</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
                <div className="text-sm text-gray-600">支付成功</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-sm text-gray-600">等待支付</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                <div className="text-sm text-gray-600">支付失败</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-gray-600">{stats.expired}</div>
                <div className="text-sm text-gray-600">已过期</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 操作栏 */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* 搜索 */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索支付记录..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* 状态过滤 */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="pending">等待支付</SelectItem>
                  <SelectItem value="processing">处理中</SelectItem>
                  <SelectItem value="paid">支付成功</SelectItem>
                  <SelectItem value="failed">支付失败</SelectItem>
                  <SelectItem value="expired">已过期</SelectItem>
                </SelectContent>
              </Select>

              {/* 操作按钮 */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={loadPaymentData}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  刷新
                </Button>
                <Button variant="outline" size="sm" onClick={exportData}>
                  <Download className="h-4 w-4 mr-2" />
                  导出
                </Button>
                <label className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      导入
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className="hidden"
                  />
                </label>
                <Button variant="outline" size="sm" onClick={clearAllData}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  清空
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 支付记录列表 */}
        <div className="space-y-4">
          {filteredPayments.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-600">暂无支付记录</p>
              </CardContent>
            </Card>
          ) : (
            filteredPayments.map((payment) => (
              <Card key={payment.checkoutId}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(payment.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(payment.status)}>
                            {payment.message}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {payment.checkoutId}
                          </span>
                        </div>
                        {payment.amount && (
                          <div className="text-sm text-gray-600 mt-1">
                            金额: ¥{(payment.amount / 100).toFixed(2)}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          创建时间: {formatTime(payment.createdAt)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {monitoringPayments.includes(payment.checkoutId) ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => stopMonitoring(payment.checkoutId)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startMonitoring(payment.checkoutId)}
                        >
                          监控
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePayment(payment.checkoutId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* 监控中的支付状态 */}
        {monitoringPayments.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">实时监控</h2>
            <div className="space-y-4">
              {monitoringPayments.map((checkoutId) => {
                const payment = allPayments.find(p => p.checkoutId === checkoutId);
                if (!payment) return null;

                return (
                  <EnhancedPaymentStatusMonitor
                    key={checkoutId}
                    checkoutId={checkoutId}
                    apiKey={import.meta.env.VITE_CREEM_API_KEY || ''}
                    onPaymentSuccess={(paymentData) => {
                      stopMonitoring(checkoutId);
                      loadPaymentData();
                    }}
                    onPaymentFailed={(error) => {
                      stopMonitoring(checkoutId);
                      loadPaymentData();
                    }}
                    onPaymentExpired={() => {
                      stopMonitoring(checkoutId);
                      loadPaymentData();
                    }}
                    autoRefresh={true}
                    refreshInterval={3000}
                    maxRetries={10}
                    enableNotifications={true}
                    enableSound={true}
                    showAdvancedInfo={true}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 