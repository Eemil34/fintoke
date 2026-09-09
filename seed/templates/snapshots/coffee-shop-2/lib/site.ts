import { unsplash } from '@/lib/imageLibrary';

export const uploads = {
  hero: '/uploads/a884d2eb-9809-4da7-b35c-54deee43f946.png',
} as const;

export const cafe = {
  pour: unsplash('photo-1495474472287-4d71bcdd2085', 1200),
  counter: unsplash('photo-1501339847302-ac426a4a7cbb', 1200),
  espresso: unsplash('photo-1497935586351-b67a49e012bf', 900),
} as const;

export const navLinks = [
  { href: '#products', label: 'Products' },
  { href: '#features', label: 'Features' },
  { href: '#about', label: 'About us' },
  { href: '#reviews', label: 'Reviews' },
] as const;

export const reasons = [
  {
    title: 'Freshly Roasted',
    body: 'Our beans are roasted in small batches for peak freshness, ensuring every cup bursts with bold flavor.',
    icon: 'roast' as const,
    image: cafe.pour,
    note: 'Small-batch craft',
  },
  {
    title: 'Ethically Sourced',
    body: 'We partner directly with farmers for sustainable practices, fair trade, and quality beans that support communities.',
    icon: 'sprout' as const,
    image: cafe.counter,
    note: 'Farm to cup',
  },
  {
    title: 'Unique Blends',
    body: 'From smooth single-origins to adventurous blends, we craft a variety of roasts tailored to your taste.',
    icon: 'heart' as const,
    image: cafe.espresso,
    note: 'Signature profiles',
  },
] as const;

export const products = [
  {
    name: 'Mocha Swirl Brew',
    note: 'Rich & Velvety',
    price: '$17.00',
    rating: '4.9',
    image: cafe.espresso,
  },
  {
    name: 'Caramel Cloud Latte',
    note: 'Sweet & Silky',
    price: '$16.00',
    rating: '4.7',
    image: cafe.pour,
  },
  {
    name: 'Vanilla Drift Cold Brew',
    note: 'Smooth & Bright',
    price: '$15.00',
    rating: '4.8',
    image: cafe.counter,
  },
] as const;

export const brands = ['Nespresso', 'Lavazza', 'Starbucks', "Peet's", 'illy'] as const;
