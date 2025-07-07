import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Clock, Calendar, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PaymentPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [showQRCode, setShowQRCode] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // 暑假特惠截止日期：2025年9月30日24:00
  const summerSaleEndDate = new Date('2025-09-30T24:00:00');
  const isSummerSaleActive = new Date() < summerSaleEndDate;

  // Get selected plan from localStorage if available
  useEffect(() => {
    const storedPlan = localStorage.getItem("selectedPlan");
    if (storedPlan) {
      handlePlanSelect(storedPlan);
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          // Time's up, restore to summer sale price or original price
          if (selectedPlan === "pro-monthly") {
            if (isSummerSaleActive) {
              setPaymentAmount("29.9");
            } else {
              setPaymentAmount("39.9");
            }
          } else if (selectedPlan === "pro-yearly") {
            if (isSummerSaleActive) {
              setPaymentAmount("358.8");
            } else {
              setPaymentAmount("478.8");
            }
          }
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedPlan, isSummerSaleActive]);

  // Handle plan selection
  const handlePlanSelect = (plan: string) => {
    setSelectedPlan(plan);
    setShowQRCode(false);
    
    if (plan === "pro-monthly") {
      // 限时特惠价优先
      setPaymentAmount("23.9");
    } else if (plan === "pro-yearly") {
      // 限时特惠价优先
      setPaymentAmount("288");
    }
  };

  // Format time left as MM:SS
  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Calculate days left for summer sale
  const getSummerSaleDaysLeft = () => {
    const now = new Date();
    const diffTime = summerSaleEndDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Display QR code based on payment method
  const handlePayment = () => {
    if (!selectedPlan) {
      toast({
        title: "请选择支付方案",
        description: "请先选择按月支付或按年支付",
        variant: "destructive"
      });
      return;
    }

    setShowQRCode(true);
    toast({
      title: "支付二维码已显示",
      description: "请使用手机扫码完成支付",
          });
  };

  return (
    <div className="container mx-auto py-16 px-4 max-w-4xl">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => window.location.href = '/adapt'}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          返回内容适配器
        </Button>
      </div>
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold mb-2">支付中心</h1>
        <p className="text-muted-foreground">完成支付即可开通文派专业版</p>
      </div>

      {/* Plan Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Monthly Plan */}
        <Card className={`cursor-pointer transition-all ${selectedPlan === "pro-monthly" ? "border-blue-500 shadow-lg" : "hover:shadow-md"}`} onClick={() => handlePlanSelect("pro-monthly")}>
          <CardHeader>
            <CardTitle className="text-xl">按月支付</CardTitle>
            <p className="text-muted-foreground text-sm">适合短期使用</p>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              {/* 限时特惠价 */}
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-3xl font-bold text-red-600">¥23.9</span>
                <div className="flex flex-col items-start">
                  <span className="text-xs text-red-500 font-semibold">限时特惠价</span>
                  <span className="text-xs text-red-500">6折 省¥16</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="w-3 h-3 text-red-500" />
                <span className="text-xs text-red-500">倒计时{formatTimeLeft()}享受优惠</span>
              </div>
              
              {/* 暑假特惠价 */}
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-gray-400 line-through text-sm">¥29.9</span>
                <div className="flex flex-col items-start">
                  <span className="text-xs text-gray-500">暑假特惠价</span>
                  <span className="text-xs text-gray-500">7.5折 省¥10</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <Calendar className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-500">剩余{getSummerSaleDaysLeft()}天有效</span>
              </div>
              
              {/* 原价 */}
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-gray-400 line-through text-sm">¥39.9</span>
                <span className="text-xs text-gray-500">原价</span>
              </div>
              
              <p className="text-gray-500">/月</p>
            </div>
          </CardContent>
        </Card>

        {/* Yearly Plan */}
        <Card className={`cursor-pointer transition-all ${selectedPlan === "pro-yearly" ? "border-blue-500 shadow-lg" : "hover:shadow-md"}`} onClick={() => handlePlanSelect("pro-yearly")}>
          <CardHeader>
            <CardTitle className="text-xl">按年支付</CardTitle>
            <p className="text-muted-foreground text-sm">适合长期使用，更优惠</p>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              {/* 限时特惠价 */}
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-3xl font-bold text-red-600">¥288</span>
                <div className="flex flex-col items-start">
                  <span className="text-xs text-red-500 font-semibold">限时特惠价</span>
                  <span className="text-xs text-red-500">6折 省¥190.8</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="w-3 h-3 text-red-500" />
                <span className="text-xs text-red-500">倒计时{formatTimeLeft()}享受优惠</span>
              </div>
              
              {/* 暑假特惠价 */}
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-gray-400 line-through text-sm">¥358.8</span>
                <div className="flex flex-col items-start">
                  <span className="text-xs text-gray-500">暑假特惠价</span>
                  <span className="text-xs text-gray-500">7.5折 省¥120</span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <Calendar className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-500">剩余{getSummerSaleDaysLeft()}天有效</span>
              </div>
              
              {/* 原价 */}
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-gray-400 line-through text-sm">¥478.8</span>
                <span className="text-xs text-gray-500">原价</span>
              </div>
              
              <p className="text-gray-500">/年</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Plan Details */}
      {selectedPlan && (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>订单信息</CardTitle>
          <p className="text-muted-foreground text-sm">您选择的是文派专业版</p>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center py-4 border-b">
            <div>
              <p className="font-medium">文派专业版</p>
              <p className="text-muted-foreground text-sm">
                {selectedPlan === "pro-monthly" ? "按月订阅" : "按年订阅"}
              </p>
            </div>
              <div className="text-right">
                {selectedPlan === "pro-yearly" ? (
                  <div className="flex flex-col items-end gap-1">
                    <div className="text-xl font-bold text-red-600">
                      ¥{paymentAmount}
                      <span className="text-sm font-normal text-muted-foreground">/年</span>
                    </div>
                    <div className="text-xs text-red-500">限时特惠价 6折 省¥190.8</div>
                    <div className="text-xs text-gray-500 line-through">¥358.8 暑假特惠价 7.5折 省¥120</div>
                    <div className="text-xs text-gray-500 line-through">¥478.8 原价</div>
                    {timeLeft > 0 && (
                      <div className="text-xs text-red-500 mt-1">
                        倒计时：{formatTimeLeft()}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-end gap-1">
                    <div className="text-xl font-bold text-red-600">
                      ¥{paymentAmount}
                      <span className="text-sm font-normal text-muted-foreground">/月</span>
                    </div>
                    <div className="text-xs text-red-500">限时特惠价 6折 省¥16</div>
                    <div className="text-xs text-gray-500 line-through">¥29.9 暑假特惠价 7.5折 省¥10</div>
                    <div className="text-xs text-gray-500 line-through">¥39.9 原价</div>
                    {timeLeft > 0 && (
                      <div className="text-xs text-red-500 mt-1">
                        倒计时：{formatTimeLeft()}
                      </div>
                    )}
                  </div>
                )}
            </div>
          </div>

          <div className="mt-4">
            <h3 className="font-medium mb-2">您将获得：</h3>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>无限次生成内容</li>
              <li>全平台内容适配支持</li>
                <li>可选择AI模型</li>
                <li>使用主流AI平台最新模型（如GPT-4o、DeepSeek V3等）</li>
                <li>基础品牌库（开发中）</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Payment QR Codes */}
      {showQRCode && selectedPlan && (
      <Card>
        <CardHeader>
          <CardTitle>支付方式</CardTitle>
          <p className="text-muted-foreground text-sm">选择您喜欢的支付方式</p>
        </CardHeader>
        <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 支付宝二维码 */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4 text-blue-600">支付宝支付</h3>
                  <div className="bg-white p-6 rounded-lg border-2 border-blue-200 shadow-lg">
                    <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                      <div className="text-center">
                        <div className="text-4xl mb-2">📱</div>
                        <div className="text-sm text-gray-600">支付宝二维码</div>
                        <div className="text-xs text-gray-500 mt-1">请使用支付宝扫码</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600 mb-2">¥{paymentAmount}</div>
                    <p className="text-sm text-gray-600">扫码完成支付</p>
                  </div>
                </div>

                {/* 微信支付二维码 */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-4 text-green-600">微信支付</h3>
                  <div className="bg-white p-6 rounded-lg border-2 border-green-200 shadow-lg">
                    <div className="w-48 h-48 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                      <div className="text-center">
                        <div className="text-4xl mb-2">📱</div>
                        <div className="text-sm text-gray-600">微信二维码</div>
                        <div className="text-xs text-gray-500 mt-1">请使用微信扫码</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-green-600 mb-2">¥{paymentAmount}</div>
                    <p className="text-sm text-gray-600">扫码完成支付</p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  支付二维码已显示，请使用手机扫码完成支付
                </p>
                <div className="flex justify-center gap-4">
                  <Button 
                    variant="outline"
                    onClick={() => {
                      toast({
                        title: "支付提醒",
                        description: "请使用手机支付宝或微信扫码完成支付",
                      });
                    }}
                  >
                    支付说明
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      toast({
                        title: "联系客服",
                        description: "如有支付问题，请联系客服",
                      });
                    }}
                  >
                    联系客服
                  </Button>
                </div>
              </div>
            </div>
        </CardContent>
        </Card>
      )}

      {/* Select Plan Button */}
      {selectedPlan && !showQRCode && (
        <div className="text-center">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-600" 
            onClick={handlePayment}
          >
            立即支付
          </Button>
        </div>
      )}

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>订阅会在期满后自动续费，您可以随时取消</p>
        <p className="mt-2">
          点击"立即支付"，表示您同意我们的
          <a href="#" className="text-blue-500 hover:underline mx-1">
            服务条款
          </a>
          和
          <a href="#" className="text-blue-500 hover:underline mx-1">
            隐私政策
          </a>
        </p>
      </div>
    </div>
  );
}