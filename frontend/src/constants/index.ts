export const variantTypesMap: Record<string, string[]> = {
  size: ['XS', 'S', 'M', 'L', 'XL'],
  mug: ['One size'],
  tumbler: ['12oz', '16oz', '20oz', '24oz'],
  notebook: ['30 pages', '50 pages', '100 pages'],
  pen: ['Black', 'Blue', 'Red'],
  umbrella: ['One size'],
  keychain: ['One size'],
  totebag: ['One size'],
  pillow: ['One size'],
};

export function normalizeImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  return `/storage/${url}`;
}

export function formatPrice(price: number): string {
  return `P${price.toFixed(2)}`;
}
