import { useProfile } from './useProfile';

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
}

export const currencies: CurrencyInfo[] = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
];

export function useCurrency() {
  const { profile } = useProfile();
  
  const currencyCode = profile?.currency || 'USD';
  const currencyInfo = currencies.find(c => c.code === currencyCode) || currencies[0];

  const formatAmount = (amount: number, options?: { showSign?: boolean; type?: 'income' | 'expense' }) => {
    const absAmount = Math.abs(amount);
    const formatted = absAmount.toLocaleString('en-US', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    });
    
    if (options?.showSign && options?.type) {
      const sign = options.type === 'income' ? '+' : '-';
      return `${sign}${currencyInfo.symbol}${formatted}`;
    }
    
    return `${currencyInfo.symbol}${formatted}`;
  };

  const formatAmountShort = (amount: number) => {
    return `${currencyInfo.symbol}${Math.abs(amount).toFixed(0)}`;
  };

  return {
    currencyCode,
    currencySymbol: currencyInfo.symbol,
    currencyInfo,
    currencies,
    formatAmount,
    formatAmountShort,
  };
}
