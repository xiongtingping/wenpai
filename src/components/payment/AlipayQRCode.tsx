/**
 * 支付宝二维码组件
 * 使用QRCode库生成二维码图片，集成支付宝品牌元素
 */

import { useEffect, useState } from "react";
import { generateAlipayQRCode } from "@/api/creemClientService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Shield, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AlipayQRCodeProps {
  priceId: string;
  customerEmail?: string;
  title?: string;
  showPrice?: boolean;
  onRefresh?: () => void;
}

/**
 * 支付宝官方Logo组件
 */
const AlipayLogo: React.FC<{ size?: number; className?: string }> = ({ 
  size = 24, 
  className = "text-blue-500" 
}) => (
  <svg 
    viewBox="0 0 1024 1024" 
    className={className}
    style={{ width: size, height: size }}
    fill="currentColor"
  >
    {/* 支付宝官方logo - 简洁版本 */}
    <rect x="128" y="128" width="768" height="768" rx="128" fill="#1677FF"/>
    {/* 支付宝文字 "支" */}
    <text x="512" y="580" textAnchor="middle" fill="white" fontSize="320" fontWeight="bold" fontFamily="Arial, sans-serif">支</text>
  </svg>
);

export default function AlipayQRCode({
  priceId,
  customerEmail,
  title = "使用支付宝扫码付款",
  showPrice = true,
  onRefresh
}: AlipayQRCodeProps) {
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>("");
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchQRCode = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('生成支付宝二维码:', { priceId, customerEmail });
      
      const result = await generateAlipayQRCode(priceId, customerEmail);
      
      if (result.success) {
        setQrCodeDataURL(result.qrCodeDataURL);
        setPrice(result.price);
        console.log('二维码生成成功:', result);
      } else {
        throw new Error('二维码生成失败');
      }
    } catch (err: any) {
      console.error('生成二维码失败:', err);
      setError(err?.message || "二维码生成失败");
      setQrCodeDataURL("");
      setPrice(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchQRCode();
    setRefreshing(false);
    onRefresh?.();
  };

  useEffect(() => {
    if (priceId) {
      fetchQRCode();
    }
  }, [priceId, customerEmail]);

  if (loading) {
    return (
      <Card className="w-full max-w-sm mx-auto">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <AlipayLogo size={24} />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            <span>正在生成二维码...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-sm mx-auto border-red-200">
        <CardHeader>
          <CardTitle className="text-center text-red-600 flex items-center justify-center gap-2">
            <AlipayLogo size={24} className="text-red-500" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-4">
            <p className="text-red-600 text-sm">{error}</p>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm"
              disabled={refreshing}
            >
              {refreshing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  刷新中...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  重新生成
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm mx-auto border-blue-100 bg-gradient-to-br from-blue-50 to-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-center flex items-center justify-center gap-2">
          <AlipayLogo size={32} />
          <span className="text-blue-900">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {showPrice && price !== null && (
          <div className="space-y-2">
            <Badge variant="outline" className="text-xl px-6 py-3 bg-blue-50 border-blue-200 text-blue-700 font-semibold">
              ¥{price.toFixed(2)}
            </Badge>
          </div>
        )}
        
        {qrCodeDataURL && (
          <div className="space-y-4">
            {/* 二维码容器 */}
            <div className="flex justify-center">
              <div className="relative">
                <img 
                  src={qrCodeDataURL} 
                  alt="支付宝二维码" 
                  className="border-4 border-blue-200 rounded-xl shadow-lg"
                  style={{ width: 220, height: 220 }}
                />
                {/* 二维码上的价格显示 */}
                {showPrice && price !== null && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-white bg-opacity-95 rounded-lg px-3 py-2 shadow-md border border-blue-200">
                      <div className="text-blue-600 font-bold text-lg">¥{price.toFixed(2)}</div>
                    </div>
                  </div>
                )}
                {/* 支付宝logo覆盖 */}
                <div className="absolute bottom-2 right-2">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-blue-200">
                    <AlipayLogo size={20} />
                  </div>
                </div>
              </div>
            </div>
            
            {/* 安全提示 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-center gap-2 text-blue-700">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">安全支付</span>
              </div>
              <p className="text-xs text-blue-600 leading-relaxed">
                扫码后会跳转到Creem安全支付页，请放心支付
              </p>
            </div>
            
            {/* 操作提示 */}
            <div className="flex items-center justify-center gap-2 text-gray-600">
              <Smartphone className="h-4 w-4" />
              <span className="text-sm">使用手机支付宝扫码</span>
            </div>
            
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm"
              disabled={refreshing}
              className="border-blue-200 text-blue-600 hover:bg-blue-50"
            >
              {refreshing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  刷新中...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  刷新二维码
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 