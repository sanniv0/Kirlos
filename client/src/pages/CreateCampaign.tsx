import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { useWallet } from '@/hooks/use-wallet';
import { useCreateCampaign, useGetCategories } from '@/hooks/use-campaigns';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, Calendar, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// Form validation schema
const campaignFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }).max(100, { message: "Title must not exceed 100 characters" }),
  description: z.string().min(20, { message: "Description must be at least 20 characters" }).max(1000, { message: "Description must not exceed 1000 characters" }),
  goal: z.coerce.number().positive({ message: "Goal must be a positive number" }).min(0.1, { message: "Goal must be at least 0.1 AVAX" }),
  duration: z.coerce.number().int().positive().min(1, { message: "Duration must be at least 1 day" }).max(90, { message: "Duration must not exceed 90 days" }),
  imageUrl: z.string().url({ message: "Please enter a valid URL for the image" }),
  categoryId: z.coerce.number().int().positive({ message: "Please select a category" }),
});

type CampaignFormValues = z.infer<typeof campaignFormSchema>;

export default function CreateCampaign() {
  const [, navigate] = useLocation();
  const { wallet } = useWallet();
  const { toast } = useToast();
  const { data: categories = [], isLoading: isLoadingCategories } = useGetCategories();
  const { mutate: createCampaign, isPending } = useCreateCampaign();
  
  // Show alert if wallet not connected
  const isWalletConnected = wallet.isConnected && wallet.isCorrectNetwork;
  
  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      title: '',
      description: '',
      goal: undefined,
      duration: 30,
      imageUrl: '',
      categoryId: undefined,
    },
  });
  
  function onSubmit(data: CampaignFormValues) {
    if (!isWalletConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to create a campaign",
        variant: "destructive"
      });
      return;
    }
    
    // Calculate deadline based on duration
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + data.duration);
    
    createCampaign({
      title: data.title,
      description: data.description,
      goal: data.goal,
      deadline,
      imageUrl: data.imageUrl,
      creatorId: 1, // This would normally come from the authenticated user
      categoryId: data.categoryId,
    }, {
      onSuccess: () => {
        toast({
          title: "Campaign Created",
          description: "Your campaign has been created successfully"
        });
        navigate('/');
      }
    });
  }
  
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Campaign</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Launch your idea and get funding from the community
        </p>
      </div>
      
      {!isWalletConnected && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Wallet Required</AlertTitle>
          <AlertDescription>
            Please connect your wallet to create a campaign. You need to be on the Avalanche Fuji Testnet.
          </AlertDescription>
        </Alert>
      )}
      
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
          <CardDescription>
            Fill in the information about your campaign to get started.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a catchy title for your campaign" {...field} />
                    </FormControl>
                    <FormDescription>
                      This title will be displayed prominently on your campaign page.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value?.toString()}
                      disabled={isLoadingCategories}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose the category that best fits your campaign.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="goal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Funding Goal (AVAX)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter funding goal" 
                        min="0.1" 
                        step="0.1" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      The amount you're aiming to raise in AVAX.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (days)</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Input 
                          type="number" 
                          placeholder="Campaign duration" 
                          min="1" 
                          max="90" 
                          {...field} 
                        />
                        <Calendar className="ml-2 h-4 w-4 text-gray-500" />
                      </div>
                    </FormControl>
                    <FormDescription>
                      How long your campaign will be active, between 1 and 90 days.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your campaign in detail"
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a detailed description of your campaign, its goals, and how funds will be used.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Image URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/image.jpg" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Enter a URL for the cover image of your campaign.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isPending || !isWalletConnected}
                  className="w-full sm:w-auto"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Campaign...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Campaign
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </Layout>
  );
}
