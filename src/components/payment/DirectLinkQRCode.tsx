/**
 * 直接链接二维码组件
 * 将Creem支付链接转换为二维码
 */

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, RefreshCw, Copy, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DirectLinkQRCodeProps {
  defaultUrl?: string;
  title?: string;
  showControls?: boolean;
}

export default function DirectLinkQRCode({
  defaultUrl = 'https://www.creem.io/payment/prod_3nJOuQeVStqkp6JaDcrKHf',
  title = 'Creem支付链接二维码',
  showControls = true
}: DirectLinkQRCodeProps) {
  const [paymentUrl, setPaymentUrl] = useState(defaultUrl);
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generateQRCode = async (url: string) => {
    if (!url) {
      setError('请输入有效的支付链接');
      setQrCodeDataURL('');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 验证URL格式
      const urlObj = new URL(url);
      if (!urlObj.hostname.includes('creem.io')) {
        throw new Error('请输入有效的Creem支付链接');
      }

      // 生成二维码
      const qrCodeDataURL = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H' // 高纠错级别
      });

      setQrCodeDataURL(qrCodeDataURL);
      console.log('二维码生成成功:', url);
    } catch (err: any) {
      console.error('生成二维码失败:', err);
      setError(err.message || '生成二维码失败');
      setQrCodeDataURL('');
    } finally {
      setLoading(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentUrl(e.target.value);
  };

  const handleGenerate = () => {
    generateQRCode(paymentUrl);
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(paymentUrl);
      toast({
        title: "链接已复制",
        description: "支付链接已复制到剪贴板",
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
    window.open(paymentUrl, '_blank');
  };

  const handleCopyQRCode = async () => {
    if (!qrCodeDataURL) return;
    
    try {
      // 将DataURL转换为Blob
      const response = await fetch(qrCodeDataURL);
      const blob = await response.blob();
      
      // 复制到剪贴板
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      
      toast({
        title: "二维码已复制",
        description: "二维码图片已复制到剪贴板",
      });
    } catch (error) {
      toast({
        title: "复制失败",
        description: "无法复制二维码到剪贴板",
        variant: "destructive",
      });
    }
  };

  // 初始生成二维码
  useEffect(() => {
    if (defaultUrl) {
      generateQRCode(defaultUrl);
    }
  }, [defaultUrl]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center gap-2">
          <span>📱</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* URL输入 */}
        {showControls && (
          <div className="space-y-2">
            <Label htmlFor="paymentUrl">Creem支付链接</Label>
            <div className="flex gap-2">
              <Input
                id="paymentUrl"
                type="url"
                placeholder="https://www.creem.io/payment/..."
                value={paymentUrl}
                onChange={handleUrlChange}
                className="flex-1"
              />
              <Button
                onClick={handleGenerate}
                disabled={loading}
                size="sm"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        {/* 错误显示 */}
        {error && (
          <div className="text-destructive text-sm text-center p-2 bg-accent rounded">
            {error}
          </div>
        )}

        {/* 二维码显示 */}
        {loading ? (
          <div className="flex items-center justify-center space-x-2 py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>正在生成二维码...</span>
          </div>
        ) : qrCodeDataURL ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img 
                src={qrCodeDataURL} 
                alt="支付二维码" 
                className="border-2 border-border rounded-lg"
                style={{ width: 300, height: 300 }}
              />
            </div>
            
            {/* 操作按钮 */}
            <div className="flex gap-2 justify-center">
              <Button
                onClick={handleCopyUrl}
                variant="outline"
                size="sm"
              >
                <Copy className="h-4 w-4 mr-1" />
                复制链接
              </Button>
              <Button
                onClick={handleOpenUrl}
                variant="outline"
                size="sm"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                打开链接
              </Button>
              <Button
                onClick={handleCopyQRCode}
                variant="outline"
                size="sm"
              >
                <Copy className="h-4 w-4 mr-1" />
                复制二维码
              </Button>
            </div>

            {/* 使用说明 */}
            <div className="text-sm text-muted-foreground space-y-2 text-center">
              <p>扫码后会跳转到Creem安全支付页，请放心支付</p>
            </div>
          </div>
        ) : null}

        {/* 当前链接信息 */}
        {showControls && (
          <div className="bg-accent p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2">当前链接</h4>
            <p className="text-xs text-muted-foreground break-all">
              {paymentUrl}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 