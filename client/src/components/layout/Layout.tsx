import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { useWallet } from "@/hooks/use-wallet";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { wallet } = useWallet();
  
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Sidebar />
      <MobileNav />
      
      {/* Main content */}
      <main className="flex-1 md:ml-64 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-4 md:p-8 pb-20 md:pb-8">
        {children}
      </main>
    </div>
  );
}
