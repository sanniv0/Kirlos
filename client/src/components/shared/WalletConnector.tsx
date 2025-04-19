import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/use-wallet";
import { formatAddress } from "@/lib/utils";
import { Loader2, Wallet, LogOut } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function WalletConnector() {
  const { wallet, connect, disconnect, switchNetwork } = useWallet();
  const [showNetworkDialog, setShowNetworkDialog] = useState(false);
  
  if (wallet.isLoading) {
    return (
      <Button disabled className="w-full md:w-auto">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Connecting...
      </Button>
    );
  }
  
  if (!wallet.isConnected) {
    return (
      <Button 
        onClick={connect}
        className="w-full md:w-auto"
      >
        <Wallet className="mr-2 h-4 w-4" />
        Connect MetaMask
      </Button>
    );
  }
  
  // Show network switch dialog if on wrong network
  if (!wallet.isCorrectNetwork && !showNetworkDialog) {
    setShowNetworkDialog(true);
  }
  
  return (
    <>
      <div className="w-full md:w-auto px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
            <span className="text-sm font-medium font-mono text-gray-700 dark:text-gray-300">
              {formatAddress(wallet.address || '')}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center ml-4 cursor-pointer">
                <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">
                  {wallet.balance ? `${parseFloat(wallet.balance).toFixed(2)} AVAX` : 'Loading...'}
                </span>
                <LogOut className="h-4 w-4 text-gray-400" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Wallet</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {!wallet.isCorrectNetwork && (
                <DropdownMenuItem onClick={switchNetwork}>
                  Switch to Avalanche Fuji
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={disconnect}>Disconnect</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Network switch dialog */}
      <AlertDialog 
        open={showNetworkDialog} 
        onOpenChange={setShowNetworkDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Wrong Network Detected</AlertDialogTitle>
            <AlertDialogDescription>
              Please switch to the Avalanche Fuji Testnet to use this application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={switchNetwork}>
              Switch Network
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
