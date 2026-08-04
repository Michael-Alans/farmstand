export function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const UNITS = [
  'kg', 'bag', 'basket', 'piece', 'tuber', 'paint bucket', 'bunch', 'crate',
];

export const CATEGORIES = ['Vegetables', 'Tubers', 'Fruits', 'Staples'] as const;

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];
