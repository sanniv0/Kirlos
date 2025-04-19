import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatAmount(amount: number, currency = 'AVAX', decimals = 2): string {
  return `${amount.toFixed(decimals)} ${currency}`;
}

export function calculateDaysLeft(deadline: Date | string): number {
  const deadlineDate = typeof deadline === 'string' ? new Date(deadline) : deadline;
  const now = new Date();
  const diffTime = deadlineDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function calculatePercentage(current: number, target: number): number {
  if (target === 0) return 0;
  const percentage = (current / target) * 100;
  return Math.min(percentage, 100);
}

export function getExplorerUrl(txHash: string): string {
  return `https://testnet.snowtrace.io/tx/${txHash}`;
}

export function handleDefaultError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown error occurred';
}
