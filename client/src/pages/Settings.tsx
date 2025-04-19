import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useWallet } from '@/hooks/use-wallet';
import { useToast } from '@/hooks/use-toast';
import { formatAddress } from '@/lib/utils';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { 
  Copy, 
  AlertCircle, 
  Check, 
  ExternalLink,
  Moon,
  Sun,
  Laptop,
  Shield,
  Wallet,
  RefreshCcw
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { AVALANCHE_FUJI_CONFIG } from '@/constants';

export default function Settings() {
  const { wallet, connect, disconnect, switchNetwork } = useWallet();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [copied, setCopied] = useState(false);

  // Copy wallet address to clipboard
  const copyAddress = () => {
    if (!wallet.address) return;
    
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard"
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your account and application preferences
        </p>
      </div>
      
      <Tabs defaultValue="wallet" className="max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="wallet">Wallet & Network</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>
        
        {/* Wallet & Network Tab */}
        <TabsContent value="wallet" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Wallet Connection
              </CardTitle>
              <CardDescription>
                Manage your Web3 wallet connection settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {wallet.isConnected ? (
                <>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Status</span>
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Connected</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Address</span>
                        <div className="flex items-center">
                          <span className="text-sm font-mono text-gray-900 dark:text-white mr-2">
                            {formatAddress(wallet.address || '', 6)}
                          </span>
                          <button onClick={copyAddress} className="text-gray-400 hover:text-gray-500">
                            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Balance</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {wallet.balance ? `${parseFloat(wallet.balance).toFixed(4)} AVAX` : 'Loading...'}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Network</span>
                        <div className="flex items-center">
                          {wallet.isCorrectNetwork ? (
                            <>
                              <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                Avalanche Fuji Testnet
                              </span>
                            </>
                          ) : (
                            <>
                              <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                                Wrong Network
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {!wallet.isCorrectNetwork && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Network Mismatch</AlertTitle>
                      <AlertDescription>
                        Please switch to the Avalanche Fuji Testnet to use this application.
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={switchNetwork}
                          className="mt-2"
                        >
                          Switch Network
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <Button variant="outline" onClick={() => window.open("https://testnet.snowtrace.io/", "_blank")}>
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Avalanche Explorer
                    </Button>
                    <Button variant="destructive" onClick={disconnect}>
                      Disconnect Wallet
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900">
                      <Wallet className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Wallet Not Connected
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Connect your wallet to interact with campaigns on the Avalanche network.
                  </p>
                  <Button onClick={connect}>
                    Connect Wallet
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Network Information
              </CardTitle>
              <CardDescription>
                Details about the Avalanche Fuji Testnet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Network Name</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {AVALANCHE_FUJI_CONFIG.chainName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Chain ID</span>
                  <span className="text-sm font-mono text-gray-900 dark:text-white">
                    {parseInt(AVALANCHE_FUJI_CONFIG.chainId, 16)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Currency</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {AVALANCHE_FUJI_CONFIG.nativeCurrency.name} ({AVALANCHE_FUJI_CONFIG.nativeCurrency.symbol})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">RPC URL</span>
                  <span className="text-sm font-mono text-gray-900 dark:text-white truncate max-w-[250px]">
                    {AVALANCHE_FUJI_CONFIG.rpcUrls[0]}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <a 
                href="https://faucet.avax.network/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-primary hover:underline flex items-center"
              >
                <RefreshCcw className="mr-1 h-3 w-3" />
                Get Test AVAX
              </a>
              <a 
                href={AVALANCHE_FUJI_CONFIG.blockExplorerUrls[0]} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-primary hover:underline flex items-center"
              >
                Explorer 
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Appearance Tab */}
        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how the application looks on your device
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant={theme === "light" ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => setTheme("light")}
                  >
                    <Sun className="mr-2 h-4 w-4" />
                    Light
                  </Button>
                  <Button 
                    variant={theme === "dark" ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => setTheme("dark")}
                  >
                    <Moon className="mr-2 h-4 w-4" />
                    Dark
                  </Button>
                  <Button 
                    variant={theme === "system" ? "default" : "outline"}
                    className="justify-start"
                    onClick={() => setTheme("system")}
                  >
                    <Laptop className="mr-2 h-4 w-4" />
                    System
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="animation-toggle" className="flex flex-col space-y-1">
                  <span>UI Animations</span>
                  <span className="font-normal text-gray-500 dark:text-gray-400 text-xs">
                    Enable animations for smoother transitions
                  </span>
                </Label>
                <Switch id="animation-toggle" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="compact-toggle" className="flex flex-col space-y-1">
                  <span>Compact Mode</span>
                  <span className="font-normal text-gray-500 dark:text-gray-400 text-xs">
                    Display more information with less spacing
                  </span>
                </Label>
                <Switch id="compact-toggle" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
