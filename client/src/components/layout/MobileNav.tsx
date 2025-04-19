import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { NAV_ITEMS } from "@/constants";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Search, 
  PlusCircle, 
  History, 
  User,
  X,
  Menu,
  Moon,
  Sun,
  Bolt
} from "lucide-react";

// Map of icons to their components
const iconMap: Record<string, any> = {
  "home": Home,
  "search": Search,
  "plus-circle": PlusCircle,
  "history": History,
  "user": User
};

export function MobileNav() {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    <>
      {/* Mobile header */}
      <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <div className="bg-primary text-white p-1 rounded-lg">
              <Bolt size={16} />
            </div>
            <h1 className="ml-2 text-lg font-bold">Kirlos</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleTheme}
              className="p-1 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-1 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn(
        "md:hidden fixed inset-0 bg-gray-800 bg-opacity-75 z-20 transition-opacity",
        isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <div className="relative h-full w-64 bg-white dark:bg-gray-800 p-4">
          <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="bg-primary text-white p-1 rounded-lg">
                <Bolt size={16} />
              </div>
              <h1 className="ml-2 text-lg font-bold">Kirlos</h1>
            </div>
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>
          
          <nav className="mt-4 space-y-2">
            {NAV_ITEMS.map((item) => {
              const Icon = iconMap[item.icon] || iconMap["user"];
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
                  onClick={() => setIsMenuOpen(false)}
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
      </div>

      {/* Mobile bottom navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-10">
        <div className="flex justify-around py-2">
          {NAV_ITEMS.slice(0, 2).map((item) => {
            const Icon = iconMap[item.icon];
            const isActive = location === item.path;
            
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className="flex flex-col items-center"
              >
                <Icon 
                  className={isActive ? "text-primary" : "text-gray-500 dark:text-gray-400"} 
                  size={20} 
                />
                <span className="text-xs mt-1">{item.name.split(' ')[0]}</span>
              </Link>
            );
          })}
          
          {/* Create button (center) */}
          <Link 
            href="/create"
            className="flex flex-col items-center"
          >
            <div className="bg-primary text-white p-2 rounded-full -mt-5">
              <PlusCircle size={20} />
            </div>
            <span className="text-xs mt-1">Create</span>
          </Link>
          
          {NAV_ITEMS.slice(3, 5).map((item) => {
            const Icon = iconMap[item.icon === "cog" ? "user" : item.icon];
            const isActive = location === item.path;
            
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className="flex flex-col items-center"
              >
                <Icon 
                  className={isActive ? "text-primary" : "text-gray-500 dark:text-gray-400"} 
                  size={20} 
                />
                <span className="text-xs mt-1">{item.name === "My Contributions" ? "History" : item.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
