import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { HandCoins, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { Campaign, Category } from '@shared/schema';
import { useWallet } from '@/hooks/use-wallet';
import { useCreateContribution } from '@/hooks/use-contributions';
import { formatAmount, calculatePercentage, getExplorerUrl } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface ContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign;
  category?: Category;
}

export function ContributeModal({ isOpen, onClose, campaign, category }: ContributeModalProps) {
  const { wallet } = useWallet();
  const [amount, setAmount] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [processingTx, setProcessingTx] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const { toast } = useToast();
  const { mutate: contributeToProject, isPending } = useCreateContribution();
  
  const percentComplete = calculatePercentage(campaign.currentAmount, campaign.goal);
  const balance = wallet.balance ? parseFloat(wallet.balance) : 0;
  const amountValue = amount ? parseFloat(amount) : 0;
  const insufficientFunds = amountValue > balance;
  const isButtonDisabled = !amount || amountValue <= 0 || !agreeTerms || insufficientFunds || isPending;
  
  const handleContribute = () => {
    if (!wallet.address || !wallet.isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive"
      });
      return;
    }
    
    if (!wallet.isCorrectNetwork) {
      toast({
        title: "Wrong Network",
        description: "Please switch to Avalanche Fuji Testnet",
        variant: "destructive"
      });
      return;
    }
    
    setProcessingTx(true);
    
    contributeToProject({
      userId: 1, // This would normally come from the authenticated user
      campaignId: campaign.id,
      amount: parseFloat(amount)
    }, {
      onSuccess: (data) => {
        setTxHash(data.transactionHash);
        setProcessingTx(false);
      },
      onError: (error) => {
        setProcessingTx(false);
        toast({
          title: "Contribution Failed",
          description: error instanceof Error ? error.message : "Failed to process your contribution",
          variant: "destructive"
        });
      }
    });
  };
  
  const handleClose = () => {
    if (!processingTx) {
      setAmount('');
      setAgreeTerms(false);
      setTxHash(null);
      onClose();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center">
            <HandCoins className="mr-2 h-5 w-5 text-primary" />
            <DialogTitle>Contribute to Campaign</DialogTitle>
          </div>
          <DialogDescription>
            Support "{campaign.title}" by contributing AVAX.
          </DialogDescription>
        </DialogHeader>
        
        {txHash ? (
          // Success view
          <div className="space-y-4">
            <div className="flex items-center justify-center py-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium">Contribution Successful!</h3>
              <p className="text-sm text-gray-500 mt-1">
                Your contribution of {amount} AVAX has been processed.
              </p>
              <a 
                href={getExplorerUrl(txHash)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center text-primary hover:text-primary-600"
              >
                View on Explorer
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </div>
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        ) : (
          // Contribution form
          <>
            <div className="mt-4 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Your balance</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatAmount(balance)}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-500 dark:text-gray-400">Campaign goal</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatAmount(campaign.goal)}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-500 dark:text-gray-400">Currently raised</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatAmount(campaign.currentAmount)} ({percentComplete.toFixed(0)}%)
                </span>
              </div>
            </div>
            
            <div className="mt-4">
              <Label htmlFor="contribution-amount">Contribution Amount (AVAX)</Label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <Input
                  id="contribution-amount"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pr-12"
                  disabled={processingTx}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 dark:text-gray-400 sm:text-sm">AVAX</span>
                </div>
              </div>
              
              {insufficientFunds && (
                <div className="mt-2 text-sm text-red-500 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Insufficient funds in your wallet
                </div>
              )}
            </div>
            
            {/* Estimated gas fees */}
            <div className="mt-3 flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Estimated gas fee</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">~0.002 AVAX</span>
            </div>
            
            <div className="mt-4 flex items-start">
              <Checkbox 
                id="terms-agreement" 
                checked={agreeTerms}
                onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                disabled={processingTx}
              />
              <div className="ml-3 text-sm">
                <Label 
                  htmlFor="terms-agreement" 
                  className="font-medium text-gray-700 dark:text-gray-300"
                >
                  I understand this transaction is irreversible
                </Label>
                <p className="text-gray-500 dark:text-gray-400">
                  Contributions cannot be refunded once processed on the blockchain.
                </p>
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button 
                variant="outline" 
                onClick={handleClose}
                disabled={processingTx}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleContribute}
                disabled={isButtonDisabled}
                className={processingTx ? 'opacity-80' : ''}
              >
                {processingTx ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-opacity-50 border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : (
                  'Confirm Contribution'
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
