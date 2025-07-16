/**
 * 简单二维码页面
 * 专门展示用户提供的Creem支付链接二维码
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Copy, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DirectLinkQRCode from '@/components/payment/DirectLinkQRCode';

export default function SimpleQRCodePage() {
  const { toast } = useToast();
  
  const creemPaymentUrl = 'https://www.creem.io/payment/prod_3nJOuQeVStqkp6JaDcrKHf';

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(creemPaymentUrl);
      toast({
        title: "链接已复制",
        description: "Creem支付链接已复制到剪贴板",
      });
    } catch (error) {
      toast({
        title: "复制失败",
        description: "无法复制链接到剪贴板",
        variant: "destructive",
      });
    }
  };

  const handleOpenUrl = () => {
    window.open(creemPaymentUrl, '_blank');
  };

  const handleDownloadQRCode = () => {
    // 创建一个临时的a标签来下载二维码
    const link = document.createElement('a');
    link.href = creemPaymentUrl;
    link.download = 'creem-payment-qrcode.png';
    link.click();
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📱 Creem支付二维码
            <Badge variant="secondary">直接链接</Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            将Creem支付链接转换为二维码，方便手机扫码支付
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 链接信息 */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">支付链接信息</h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">产品:</span> 专业版月付</p>
              <p><span className="font-medium">产品ID:</span> prod_3nJOuQeVStqkp6JaDcrKHf</p>
              <p><span className="font-medium">价格:</span> ¥29.00</p>
              <p><span className="font-medium">支付链接:</span> {creemPaymentUrl}</p>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3 justify-center">
            <Button onClick={handleCopyUrl} variant="outline">
              <Copy className="h-4 w-4 mr-2" />
              复制链接
            </Button>
            <Button onClick={handleOpenUrl} variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" />
              打开链接
            </Button>
            <Button onClick={handleDownloadQRCode} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              下载二维码
            </Button>
          </div>

          {/* 二维码显示 */}
          <div className="flex justify-center">
            <DirectLinkQRCode
              defaultUrl={creemPaymentUrl}
              title="Creem支付二维码"
              showControls={false}
            />
          </div>

          {/* 使用说明 */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">使用说明</h4>
            <div className="space-y-2 text-sm text-green-800">
              <div className="flex items-start gap-2">
                <span className="font-medium">1.</span>
                <span>使用手机支付宝扫描上方二维码</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">2.</span>
                <span>扫码后会跳转到Creem安全支付页，请放心支付</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">3.</span>
                <span>支付成功后服务将自动激活</span>
              </div>
            </div>
          </div>

          {/* 注意事项 */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">注意事项</h4>
            <div className="space-y-2 text-sm text-yellow-800">
              <p>• 请确保使用官方支付宝APP扫描二维码</p>
              <p>• 支付过程中请勿关闭页面或刷新</p>
              <p>• 如遇支付问题，请联系客服处理</p>
              <p>• 支付成功后请等待1-2分钟服务激活</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 