/**
 * 支付宝二维码组件
 * 使用QRCode库生成二维码图片，集成支付宝品牌元素
 */

import { useEffect, useState } from "react";
import { generateAlipayQRCode } from "@/api/creemClientService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Shield, Smartphone, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AlipayQRCodeProps {
  priceId: string;
  customerEmail?: string;
  title?: string;
  showPrice?: boolean;
  onRefresh?: () => void;
}

/**
 * 支付宝Logo组件
 */
const AlipayLogo: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <div 
    className="bg-blue-500 text-white rounded flex items-center justify-center font-bold"
    style={{ width: size, height: size, fontSize: size * 0.6 }}
  >
    支
  </div>
);

/**
 * 支付宝二维码组件
 * @param priceId 价格ID
 * @param customerEmail 客户邮箱
 * @param title 标题
 * @param showPrice 是否显示价格
 * @param onRefresh 刷新回调
 * @returns {JSX.Element}
 */
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
  const [retryCount, setRetryCount] = useState(0);

  /**
   * 获取二维码数据
   */
  const fetchQRCode = async (isRetry = false) => {
    try {
      if (isRetry) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      // 检查网络连接
      if (!navigator.onLine) {
        throw new Error('网络连接不可用，请检查网络设置');
      }

      console.log('开始获取支付二维码:', { priceId, customerEmail });

      const result = await generateAlipayQRCode(priceId, customerEmail);
      
      if (result.success && result.qrCodeDataURL) {
        setQrCodeDataURL(result.qrCodeDataURL);
        setPrice(result.price);
        setRetryCount(0); // 重置重试计数
        console.log('二维码获取成功');
      } else {
        throw new Error('二维码生成失败');
      }
    } catch (error: any) {
      console.error('二维码获取失败:', error);
      
      // 增加重试计数
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);
      
      // 根据错误类型提供不同的错误信息
      let errorMessage = '二维码生成失败，请稍后重试';
      
      if (error.message.includes('网络连接')) {
        errorMessage = '网络连接不可用，请检查网络设置';
      } else if (error.message.includes('支付服务')) {
        errorMessage = '支付服务暂时不可用，请稍后重试';
      } else if (error.message.includes('配置')) {
        errorMessage = '支付配置错误，请联系客服';
      } else if (error.message.includes('产品')) {
        errorMessage = '商品信息错误，请重新选择';
      }
      
      setError(errorMessage);
      
      // 如果是重试，显示重试次数
      if (isRetry && newRetryCount < 3) {
        setError(`${errorMessage} (重试 ${newRetryCount}/3)`);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * 处理刷新
   */
  const handleRefresh = async () => {
    if (retryCount >= 3) {
      setRetryCount(0); // 重置重试计数
    }
    await fetchQRCode(true);
    onRefresh?.();
  };

  /**
   * 组件挂载时获取二维码
   */
  useEffect(() => {
    if (priceId) {
      fetchQRCode();
    }
  }, [priceId, customerEmail]);

  // 加载状态
  if (loading) {
    return (
      <Card className="w-full max-w-sm mx-auto border-blue-100 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <AlipayLogo size={32} />
            <span className="text-blue-900">{title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm text-gray-600">正在生成支付二维码...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 错误状态
  if (error) {
    return (
      <Card className="w-full max-w-sm mx-auto border-red-100 bg-gradient-to-br from-red-50 to-white">
        <CardHeader className="pb-4">
          <CardTitle className="text-center flex items-center justify-center gap-2">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <span className="text-red-900">支付二维码生成失败</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="space-y-3">
            <p className="text-sm text-red-600">{error}</p>
            
            <div className="flex gap-2 justify-center">
              <Button 
                onClick={handleRefresh}
                disabled={refreshing}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                重试
              </Button>
              
              {retryCount >= 3 && (
                <Button 
                  onClick={() => window.location.reload()}
                  variant="outline"
                  size="sm"
                >
                  刷新页面
                </Button>
              )}
            </div>
            
            {retryCount >= 3 && (
              <p className="text-xs text-gray-500">
                如果问题持续存在，请联系客服
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // 正常显示二维码
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
              <p className="text-xs leading-5 text-center">
                扫码后会跳转到
                <span className="text-blue-600 font-bold mx-1">Creem</span>
                安全支付页，请放心支付
              </p>
            </div>
            
            {/* 操作提示 */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-center gap-2 text-gray-600 mb-2">
                <Smartphone className="h-4 w-4" />
                <span className="text-sm font-medium">使用支付宝App扫码</span>
              </div>
              <p className="text-xs text-gray-500 text-center">
                请确保支付宝App已安装并登录
              </p>
            </div>
            
            {/* 刷新按钮 */}
            <Button 
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-center gap-2"
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              刷新二维码
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 