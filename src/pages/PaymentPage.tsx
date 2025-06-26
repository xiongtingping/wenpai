import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, WalletCards } from "lucide-react";

export default function PaymentPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>("pro-monthly");
  const [paymentAmount, setPaymentAmount] = useState<string>("19.9");
  const [paymentMethod, setPaymentMethod] = useState<string>("alipay");
  const { toast } = useToast();

  // Get selected plan from localStorage if available
  useEffect(() => {
    const storedPlan = localStorage.getItem("selectedPlan");
    if (storedPlan) {
      setSelectedPlan(storedPlan);
      if (storedPlan === "pro-yearly") {
        setPaymentAmount("199");
      }
    }
  }, []);

  // Display QR code based on payment method
  const handlePayment = () => {
    toast({
      title: "正在生成支付二维码",
      description: "请稍等片刻...",
    });

    // Show QR code modal after a brief delay (simulating API request)
    setTimeout(() => {
      // Create overlay div for QR code modal
      const overlay = document.createElement("div");
      overlay.style.position = "fixed";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
      overlay.style.display = "flex";
      overlay.style.justifyContent = "center";
      overlay.style.alignItems = "center";
      overlay.style.zIndex = "9999";

      // Create QR code container
      const qrContainer = document.createElement("div");
      qrContainer.style.backgroundColor = "white";
      qrContainer.style.padding = "20px";
      qrContainer.style.borderRadius = "8px";
      qrContainer.style.maxWidth = "350px";
      qrContainer.style.width = "90%";
      qrContainer.style.textAlign = "center";

      // Create QR code placeholder (in a real app, this would be an actual QR code)
      const qrImage = document.createElement("div");
      qrImage.style.width = "200px";
      qrImage.style.height = "200px";
      qrImage.style.margin = "20px auto";
      qrImage.style.backgroundColor = "#f3f4f6";
      qrImage.style.display = "flex";
      qrImage.style.alignItems = "center";
      qrImage.style.justifyContent = "center";
      qrImage.style.fontSize = "14px";
      qrImage.style.color = "#6b7280";
      qrImage.style.position = "relative";

      // Create QR code (simulated with a simple black square pattern)
      qrImage.innerHTML = `
        <div style="
          width: 150px;
          height: 150px;
          background-color: #fff;
          padding: 10px;
          position: relative;
        ">
          <div style="
            width: 130px; 
            height: 130px; 
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            grid-template-rows: repeat(5, 1fr);
            gap: 3px;
          ">
            ${Array(25).fill('').map(() => 
              Math.random() > 0.35 ? 
                '<div style="background-color: #000;"></div>' : 
                '<div style="background-color: #fff;"></div>'
            ).join('')}
          </div>
          ${paymentMethod === 'alipay' ? 
            '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 40px; height: 40px; background-color: #fff; display: flex; align-items: center; justify-content: center;"><img src="https://img.alicdn.com/imgextra/i4/O1CN01XCiY1B1MmAzEPzR7s_!!6000000001477-2-tps-200-200.png" style="width: 32px; height: 32px;"/></div>' : 
            '<div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 40px; height: 40px; background-color: #fff; display: flex; align-items: center; justify-content: center;"><img src="https://res.wx.qq.com/a/wx_fed/assets/res/NTI4MWU5.ico" style="width: 32px; height: 32px;"/></div>'
          }
        </div>
      `;

      // Create title
      const title = document.createElement("h3");
      title.style.margin = "0 0 10px 0";
      title.style.fontSize = "18px";
      title.style.fontWeight = "600";
      title.innerText = paymentMethod === "alipay" ? "支付宝支付" : "微信支付";

      // Create amount
      const amount = document.createElement("p");
      amount.style.margin = "0 0 20px 0";
      amount.style.fontSize = "24px";
      amount.style.fontWeight = "700";
      amount.style.color = "#333";
      amount.innerText = `¥${paymentAmount}`;

      // Create description
      const description = document.createElement("p");
      description.style.margin = "0";
      description.style.fontSize = "14px";
      description.style.color = "#6b7280";
      description.innerText = "请使用手机扫描二维码完成支付";

      // Create close button
      const closeButton = document.createElement("button");
      closeButton.style.backgroundColor = "#f3f4f6";
      closeButton.style.border = "none";
      closeButton.style.padding = "8px 16px";
      closeButton.style.borderRadius = "4px";
      closeButton.style.marginTop = "20px";
      closeButton.style.cursor = "pointer";
      closeButton.style.fontSize = "14px";
      closeButton.style.fontWeight = "500";
      closeButton.innerText = "取消支付";
      
      // Add click event to close modal
      closeButton.onclick = () => {
        document.body.removeChild(overlay);
      };

      // Add elements to container
      qrContainer.appendChild(title);
      qrContainer.appendChild(amount);
      qrContainer.appendChild(qrImage);
      qrContainer.appendChild(description);
      qrContainer.appendChild(closeButton);

      // Add container to overlay
      overlay.appendChild(qrContainer);

      // Add overlay to body
      document.body.appendChild(overlay);

      // Auto-redirect after 5 seconds (simulating successful payment)
      setTimeout(() => {
        if (document.body.contains(overlay)) {
          document.body.removeChild(overlay);
          toast({
            title: "支付成功",
            description: "您已成功开通专业版功能",
          });
          
          setTimeout(() => {
            window.location.href = "/adapt";
          }, 1500);
        }
      }, 8000);
    }, 1500);
  };

  return (
    <div className="container mx-auto py-16 px-4 max-w-3xl">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold mb-2">支付中心</h1>
        <p className="text-muted-foreground">完成支付即可开通文派专业版</p>
      </div>

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
            <div className="text-xl font-bold">
              ¥{paymentAmount}
              <span className="text-sm font-normal text-muted-foreground">
                {selectedPlan === "pro-monthly" ? "/月" : "/年"}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="font-medium mb-2">您将获得：</h3>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>无限次生成内容</li>
              <li>全平台内容适配支持</li>
              <li>高级风格定制</li>
              <li>基础品牌库功能</li>
              <li>优先生成通道</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>支付方式</CardTitle>
          <CardDescription>选择您喜欢的支付方式</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="alipay" onValueChange={setPaymentMethod}>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="alipay" className="flex items-center">
                <img
                  src="https://img.alicdn.com/imgextra/i4/O1CN01XCiY1B1MmAzEPzR7s_!!6000000001477-2-tps-200-200.png"
                  alt="支付宝"
                  className="w-5 h-5 mr-2"
                />
                支付宝
              </TabsTrigger>
              <TabsTrigger value="wechat" className="flex items-center">
                <img
                  src="https://res.wx.qq.com/a/wx_fed/assets/res/NTI4MWU5.ico"
                  alt="微信支付"
                  className="w-5 h-5 mr-2"
                />
                微信支付
              </TabsTrigger>
            </TabsList>
            <TabsContent value="alipay" className="py-4">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-md">
                <WalletCards className="text-blue-500 h-8 w-8" />
                <div>
                  <p className="font-medium">支付宝付款</p>
                  <p className="text-sm text-muted-foreground">使用支付宝扫码支付</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="wechat" className="py-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-md">
                <CreditCard className="text-green-500 h-8 w-8" />
                <div>
                  <p className="font-medium">微信支付</p>
                  <p className="text-sm text-muted-foreground">使用微信扫码支付</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600" onClick={handlePayment}>
            立即支付 ¥{paymentAmount}
          </Button>
        </CardFooter>
      </Card>

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