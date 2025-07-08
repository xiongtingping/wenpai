import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface ToolLayoutProps {
  children: ReactNode;
}

export default function ToolLayout({ children }: ToolLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white/95 backdrop-blur-md sticky top-0 z-50">
        <div className="container flex justify-start items-center h-16 px-6">
          <Link to="/" className="flex items-center space-x-2">
            <img src="https://static.devv.ai/ep7eod98hhq8.png" alt="文派" className="h-8 w-8" />
            <span className="font-bold text-lg">文派</span>
          </Link>
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