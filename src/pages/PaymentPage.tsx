import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, WalletCards } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PaymentPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [originalPrice, setOriginalPrice] = useState<string>("");
  const [discount, setDiscount] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [showQRCode, setShowQRCode] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
          // Time's up, restore original price
          if (selectedPlan === "pro-monthly") {
            setPaymentAmount("29.9");
            setDiscount("0");
          } else if (selectedPlan === "pro-yearly") {
            setPaymentAmount("299");
            setDiscount("0");
          }
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedPlan]);

  // Handle plan selection
  const handlePlanSelect = (plan: string) => {
    setSelectedPlan(plan);
    setShowQRCode(false);
    
    if (plan === "pro-monthly") {
      setPaymentAmount("29.9");
      setOriginalPrice("39.9");
      setDiscount("10");
    } else if (plan === "pro-yearly") {
      setPaymentAmount("288");
      setOriginalPrice("478.8");
      setDiscount("190.8");
    }
  };

  // Format time left as MM:SS
  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
            <CardDescription>适合短期使用</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-3xl font-bold text-blue-600">¥{selectedPlan === "pro-monthly" ? "29.9" : "39.9"}</span>
                <span className="text-gray-400 line-through text-lg">¥39.9</span>
              </div>
              <p className="text-gray-500">/月</p>
              <div className="mt-2">
                <span className="text-orange-600 font-semibold text-sm">7.5折</span>
              </div>
              {selectedPlan === "pro-monthly" && timeLeft > 0 && (
                <div className="mt-2">
                  <span className="text-red-500 font-semibold text-sm">限时优惠</span>
                  <div className="text-red-600 font-mono font-bold text-lg">
                    {formatTimeLeft()}
                  </div>
                  <span className="text-green-600 text-sm">省¥10</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Yearly Plan */}
        <Card className={`cursor-pointer transition-all ${selectedPlan === "pro-yearly" ? "border-blue-500 shadow-lg" : "hover:shadow-md"}`} onClick={() => handlePlanSelect("pro-yearly")}>
          <CardHeader>
            <CardTitle className="text-xl">按年支付</CardTitle>
            <CardDescription>适合长期使用，更优惠</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-3xl font-bold text-blue-600">¥{selectedPlan === "pro-yearly" ? "288" : "478.8"}</span>
                <span className="text-gray-400 line-through text-lg">¥478.8</span>
              </div>
              <p className="text-gray-500">/年</p>
              <div className="mt-2">
                <span className="text-orange-600 font-semibold text-sm">6折</span>
              </div>
              {selectedPlan === "pro-yearly" && timeLeft > 0 && (
                <div className="mt-2">
                  <span className="text-red-500 font-semibold text-sm">限时优惠</span>
                  <div className="text-red-600 font-mono font-bold text-lg">
                    {formatTimeLeft()}
                  </div>
                  <span className="text-green-600 text-sm">省¥159.8</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Plan Details */}
      {selectedPlan && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>订单信息</CardTitle>
            <CardDescription>您选择的是文派专业版</CardDescription>
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
                <div className="flex items-center justify-end gap-2">
                  <span className="text-sm text-muted-foreground line-through">¥{originalPrice}</span>
                  <div className="text-xl font-bold text-red-600">
                    ¥{paymentAmount}
                    <span className="text-sm font-normal text-muted-foreground">
                      {selectedPlan === "pro-monthly" ? "/月" : "/年"}
                    </span>
                  </div>
                </div>
                {timeLeft > 0 && (
                  <div className="text-xs text-red-500 mt-1">
                    限时优惠：{formatTimeLeft()}
                  </div>
                )}
                {discount !== "0" && (
                  <div className="text-xs text-green-600 mt-1">
                    省¥{discount}
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
            <CardDescription>选择您喜欢的支付方式</CardDescription>
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