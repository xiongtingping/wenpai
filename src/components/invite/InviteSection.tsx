/**
 * 邀请功能区域组件
 * @description 整合邀请链接和统计的完整区域
 */

import { InviteLinkCard } from './InviteLinkCard';
import { InviteStatsCard } from './InviteStatsCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gift, BarChart3 } from 'lucide-react';

interface InviteSectionProps {
  userId: string;
}

export function InviteSection({ userId }: InviteSectionProps) {
  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          邀请好友，共享奖励
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          邀请好友注册，你和好友都能获得丰厚奖励
        </p>
      </div>

      {/* Tab切换 */}
      <Tabs defaultValue="invite" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="invite" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            邀请好友
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            我的统计
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invite" className="mt-6">
          <InviteLinkCard userId={userId} />
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <InviteStatsCard userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

