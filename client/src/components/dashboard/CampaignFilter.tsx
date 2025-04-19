import { useState } from 'react';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGetCategories } from '@/hooks/use-campaigns';

interface CampaignFilterProps {
  onSearch: (searchTerm: string) => void;
  onCategoryChange: (categoryId: number | undefined) => void;
  onSortChange: (sortOption: string) => void;
}

export function CampaignFilter({ onSearch, onCategoryChange, onSortChange }: CampaignFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: categories = [], isLoading } = useGetCategories();

  return (
    <Card className="bg-white dark:bg-gray-800 shadow overflow-hidden mb-6">
      <CardContent className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Featured Campaigns
          </h2>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative rounded-md w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-gray-400" size={16} />
              </div>
              <Input
                type="text"
                placeholder="Search campaigns..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onSearch(searchTerm);
                  }
                }}
              />
            </div>
            
            <Select onValueChange={(value) => onCategoryChange(value === 'all' ? undefined : parseInt(value))}>
              <SelectTrigger className="w-full sm:w-auto">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select onValueChange={onSortChange}>
              <SelectTrigger className="w-full sm:w-auto">
                <SelectValue placeholder="Sort: Newest" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Sort: Newest</SelectItem>
                <SelectItem value="most-funded">Most Funded</SelectItem>
                <SelectItem value="ending-soon">Ending Soon</SelectItem>
                <SelectItem value="recently-added">Recently Added</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
