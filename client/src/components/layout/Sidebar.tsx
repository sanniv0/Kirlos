import { Fragment } from "react";
import { Link, useLocation } from "wouter";
import { NAV_ITEMS } from "@/constants";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { 
  Home, 
  Search, 
  PlusCircle, 
  History, 
  Settings, 
  Moon, 
  Sun, 
  Bolt 
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

// Map of icons to their components
const iconMap: Record<string, LucideIcon> = {
  "home": Home,
  "search": Search,
  "plus-circle": PlusCircle,
  "history": History,
  "cog": Settings
};

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => (localStorage.theme === 'dark' || 
      (!('theme' in localStorage) && 
      window.matchMedia('(prefers-color-scheme: dark)').matches)) 
      ? 'dark' : 'light'
  );

  // Handle theme toggle
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.theme = newTheme;
    
    // Apply theme to document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Initialize theme on mount
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className={cn("hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-10", className)}>
      <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center justify-center flex-shrink-0 px-4">
            <div className="flex items-center">
              <div className="bg-primary text-white p-2 rounded-lg">
                <Bolt size={16} />
              </div>
              <h1 className="ml-2 text-xl font-bold">Kirlos</h1>
            </div>
          </div>
          
          <nav className="mt-8 flex-1 px-4 space-y-2">
            {NAV_ITEMS.map((item) => {
              const Icon = iconMap[item.icon];
              const isActive = location === item.path;
              
              return (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={cn(
                    "group flex items-center px-3 py-3 text-sm font-medium rounded-md",
                    isActive 
                      ? "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-100" 
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  )}
                >
                  <Icon 
                    className={cn(
                      "mr-3",
                      isActive 
                        ? "text-primary" 
                        : "text-gray-500 dark:text-gray-400"
                    )} 
                    size={18} 
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
        {/* Theme toggle */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-end">
            <button 
              onClick={toggleTheme}
              className="p-1 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
