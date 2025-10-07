/**
 * 支付模态框测试页面
 * 用于测试和演示支付模态框功能
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PaymentModal } from '@/components/payment/PaymentModal';
import { PaymentModalData } from '@/types/payment-modal';
import { toast } from 'sonner';

export const PaymentModalTestPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentModalData>({
    state: 'waiting_scan',
    orderId: 'test-order-' + Date.now(),
    qrCode: 'https://example.com/qr',
    qrImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    amount: 29.00,
    timeLeft: 300,
    retryCount: 0
  });

  const handleOpenModal = (state: PaymentModalData['state']) => {
    setPaymentData({
      ...paymentData,
      state,
      orderId: 'test-order-' + Date.now()
    });
    setShowModal(true);
  };

  const handlePaymentSuccess = () => {
    toast.success('支付成功！', {
      description: '这是一个测试支付'
    });
    setShowModal(false);
  };

  const handlePaymentFailed = (error: string) => {
    toast.error('支付失败', {
      description: error
    });
  };

  const handlePaymentTimeout = () => {
    toast.error('支付超时', {
      description: '二维码已过期'
    });
  };

  const handleCancel = () => {
    toast('已取消支付');
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>支付模态框测试页面</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={() => handleOpenModal('waiting_scan')}>
                测试：等待扫码
              </Button>
              <Button onClick={() => handleOpenModal('scanning')}>
                测试：扫码中
              </Button>
              <Button onClick={() => handleOpenModal('verifying')}>
                测试：验证中
              </Button>
              <Button onClick={() => handleOpenModal('success')}>
                测试：支付成功
              </Button>
              <Button onClick={() => handleOpenModal('failed')}>
                测试：支付失败
              </Button>
              <Button onClick={() => handleOpenModal('timeout')}>
                测试：支付超时
              </Button>
            </div>

            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">功能说明：</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>模态框锁定：无法通过点击遮罩或ESC键关闭</li>
                <li>浏览器拦截：刷新页面时会提示确认</li>
                <li>支付状态轮询：自动检测支付状态（测试环境不会真实轮询）</li>
                <li>倒计时显示：5分钟倒计时</li>
                <li>进度指示器：显示当前支付进度</li>
                <li>支付宝品牌：显示支付宝Logo和品牌元素</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 支付模态框 */}
      {showModal && (
        <PaymentModal
          open={showModal}
          onClose={() => setShowModal(false)}
          paymentData={paymentData}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentFailed={handlePaymentFailed}
          onPaymentTimeout={handlePaymentTimeout}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default PaymentModalTestPage;

