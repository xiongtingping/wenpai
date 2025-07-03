import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Database, Users, TestTube } from 'lucide-react';

interface ToolLayoutProps {
  children: ReactNode;
}

export default function ToolLayout({ children }: ToolLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white/95 backdrop-blur-md sticky top-0 z-50">
        <div className="container flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/" className="flex items-center space-x-2">
              <img src="https://static.devv.ai/ep7eod98hhq8.png" alt="文派" className="h-8 w-8" />
              <span className="font-bold text-lg">文派</span>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/brand-library" className="flex items-center">
                <Database className="h-4 w-4 mr-1" />
                品牌库
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/api-test" className="flex items-center">
                <TestTube className="h-4 w-4 mr-1" />
                API 测试
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/invite" className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                邀请奖励
              </Link>
            </Button>
            <Button size="sm" onClick={() => window.location.href = "/payment"}>升级专业版</Button>
          </div>
        </div>
      </header>
      
      <main className="flex-grow bg-gray-50">
        {children}
      </main>
      
      <footer className="border-t py-6 bg-white">
        <div className="container text-center text-sm text-gray-500">
          <p>&copy; 2024 文派. 保留所有权利.</p>
        </div>
      </footer>
    </div>
  );
}