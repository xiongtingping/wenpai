/**
 * 邀请页面
 * @description 完整的邀请功能页面
 */

// import { useAuth } from '@/contexts/AuthContext'; // 模块不存在，使用stores代替
import { useAuthState } from '@/stores/unified-state-store';
import { InviteSection } from '@/components/invite/InviteSection';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function InvitePage() {
  const authState = useAuthState();
  const user = authState.user;
  const isAuthenticated = authState.isAuthenticated;
  const navigate = useNavigate();

  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">请先登录</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          登录后即可查看邀请功能
        </p>
        <Button onClick={() => navigate('/login')}>
          前往登录
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 返回按钮 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        返回
      </Button>

      {/* 邀请功能区域 */}
      <InviteSection userId={(user as any).id || ''} />
    </div>
  );
}

