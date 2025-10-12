import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import UnifiedOrderService from '@/services/unifiedOrderService';

export const AdminOrderRepair: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState<string>('');
  const [orderIdInput, setOrderIdInput] = useState('');

  const enabled = useMemo(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      return p.get('adminRepair') === '1';
    } catch {
      return false;
    }
  }, []);

  if (!enabled) return null;

  const runBatchRepair = async () => {
    try {
      setLoading(true);
      setResultText('');

      const orders = await UnifiedOrderService.getOrdersNeedingRepair();
      if (!orders || orders.length === 0) {
        toast({ title: '扫描完成', description: '没有发现需要修复的订单', duration: 3000 });
        setResultText('无修复目标');
        return;
      }
      const orderIds = orders.map(o => o.order_id);
      const summary = await UnifiedOrderService.batchRepairOrders(orderIds);

      toast({
        title: '修复完成',
        description: `总计 ${summary.total}，成功 ${summary.repaired}，失败 ${summary.failed}`,
        duration: 5000,
      });
      setResultText(JSON.stringify(summary, null, 2));
    } catch (err: any) {
      toast({ title: '修复失败', description: err?.message || '未知错误', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const repairSingle = async () => {
    if (!orderIdInput) return;
    try {
      setLoading(true);
      setResultText('');
      const res = await UnifiedOrderService.repairOrderPermissions(orderIdInput);
      toast({ title: res.success ? '单笔修复成功' : '单笔修复失败', description: res.error || '' });
      setResultText(JSON.stringify(res, null, 2));
    } catch (err: any) {
      toast({ title: '单笔修复异常', description: err?.message || '未知错误', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto mb-4 border-primary/30">
      <CardHeader>
        <CardTitle>🔧 管理员：订单批量修复（仅 adminRepair=1 可见）</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Button disabled={loading} onClick={runBatchRepair} variant="outline">
            {loading ? '扫描/修复中…' : '一键扫描并修复（已支付且未处理）'}
          </Button>
        </div>
        <div className="flex gap-2 items-center">
          <input
            className="flex-1 px-3 py-2 border rounded-md bg-background text-foreground"
            placeholder="输入订单号（例如：WP1760...）"
            value={orderIdInput}
            onChange={(e) => setOrderIdInput(e.target.value)}
          />
          <Button disabled={loading || !orderIdInput} onClick={repairSingle} variant="secondary">
            修复指定订单
          </Button>
        </div>
        {resultText && (
          <pre className="text-xs p-2 bg-muted rounded-md overflow-auto max-h-48">
            {resultText}
          </pre>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminOrderRepair;

