import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut, User, Settings } from 'lucide-react';

/**
 * 用户头像组件
 * 显示当前登录用户的信息和操作菜单
 */
const UserAvatar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  /**
   * 处理登出
   */
  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  /**
   * 跳转到个人资料页面
   */
  const handleProfile = () => {
    navigate('/profile');
    setIsOpen(false);
  };

  /**
   * 获取用户头像的初始字母
   */
  const getInitials = () => {
    if (!user) return '?';
    
    if (user.nickname) {
      return user.nickname.charAt(0).toUpperCase();
    }
    
    if (user.username) {
      return user.username.charAt(0).toUpperCase();
    }
    
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    
    return 'U';
  };

  /**
   * 获取显示名称
   */
  const getDisplayName = () => {
    if (!user) return '未知用户';
    
    return user.nickname || user.username || user.email || '用户';
  };

  // 如果用户未登录，显示登录按钮
  if (!isAuthenticated) {
    return (
      <Button 
        variant="outline" 
        onClick={() => navigate('/authing-login')}
        className="flex items-center gap-2"
      >
        <User className="w-4 h-4" />
        登录
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar} alt={getDisplayName()} />
            <AvatarFallback className="bg-blue-500 text-white text-sm font-medium">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
            {user?.email && (
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleProfile}>
          <User className="mr-2 h-4 w-4" />
          <span>个人资料</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/payment')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>账户设置</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>退出登录</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAvatar; 