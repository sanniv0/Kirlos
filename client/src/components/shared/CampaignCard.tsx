import { Campaign, Category } from '@shared/schema';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins } from 'lucide-react';
import { formatAmount, calculateDaysLeft, calculatePercentage } from '@/lib/utils';
import { useState } from 'react';
import { ContributeModal } from './ContributeModal';

interface CampaignCardProps {
  campaign: Campaign;
  category?: Category;
}

export function CampaignCard({ campaign, category }: CampaignCardProps) {
  const [showContributeModal, setShowContributeModal] = useState(false);
  
  const percentComplete = calculatePercentage(campaign.currentAmount, campaign.goal);
  const daysLeft = calculateDaysLeft(campaign.deadline);
  
  // Determine the color based on category or use default
  const categoryColor = category?.color || '#6366f1';
  const bgColor = categoryColor;
  
  // Helper to choose text color that contrasts with the background
  const isLight = (color: string) => {
    // Simple check - if it starts with a light color name
    return color.includes('amber') || 
           color.includes('yellow') || 
           color.includes('lime') || 
           color.includes('green') || 
           color.includes('emerald') || 
           color.includes('teal');
  };
  
  const textColor = isLight(categoryColor) ? 'text-gray-900' : 'text-white';
  
  return (
    <>
      <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md">
        <div className="relative pb-1/2">
          {/* Use a default image if none provided */}
          <img 
            src={campaign.imageUrl || "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"} 
            alt={campaign.title} 
            className="absolute h-full w-full object-cover"
          />
          <div 
            className={`absolute top-2 right-2 ${textColor} text-xs px-2 py-1 rounded-md`}
            style={{ backgroundColor: bgColor }}
          >
            {category?.name || 'Other'}
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {campaign.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
            {campaign.description}
          </p>
          
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>{percentComplete.toFixed(0)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="h-2 rounded-full" 
                style={{ 
                  width: `${percentComplete}%`,
                  backgroundColor: categoryColor
                }}
              ></div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {formatAmount(campaign.currentAmount)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                of {formatAmount(campaign.goal)} goal
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {daysLeft} days
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                remaining
              </p>
            </div>
          </div>
          
          <Button 
            className="w-full"
            onClick={() => setShowContributeModal(true)}
            style={{ 
              backgroundColor: categoryColor,
              borderColor: 'transparent'
            }}
          >
            <Coins className="mr-2 h-4 w-4" />
            Contribute
          </Button>
        </CardContent>
      </Card>
      
      {/* Contribute Modal */}
      <ContributeModal 
        isOpen={showContributeModal} 
        onClose={() => setShowContributeModal(false)}
        campaign={campaign}
        category={category}
      />
    </>
  );
}
