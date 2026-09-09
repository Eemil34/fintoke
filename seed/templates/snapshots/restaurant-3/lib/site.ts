import { unsplash } from '@/lib/imageLibrary';

export const site = {
  id: 'restaurant-cafe',
  layout: 'hospitality',
  mode: 'light',
  name: 'Coral Cove',
  tagline: 'Restaurant of bold culinary solutions',
  description:
    'Netting fresh flavours, one dish at a time. Tradition meets innovation with global influences and locally sourced seasonal fish and shellfish.',
  contact: {
    address: 'Park Avenue, 60146 NY, USA',
    phone: '+1 (212) 555-0148',
    email: 'hello@coralcove.example',
  },
  hero: {
    eyebrow: 'Seafood restaurant · Park Avenue',
    title: 'Coral Cove',
    subtitle:
      'A coastal kitchen of bold culinary solutions — netting seasonal fish and shellfish, one composed dish at a time.',
    cta: 'Reservation',
    ctaSecondary: 'Our Menu',
    image: unsplash('photo-1414235077428-338989a2e8c0', 1800),
    imageAlt: 'Plated restaurant dish',
  },
  about: {
    title: 'About',
    titleAccent: 'our restaurant',
    image: unsplash('photo-1517248135467-4c7edcad34c4', 1400),
    imageAlt: 'Restaurant dining room',
    columns: [
      'At Coral Cove, tradition meets innovation. We craft dishes that honour classic coastal cooking while welcoming global influences — bright citrus, fragrant herbs, and techniques from kitchens across the Mediterranean and Pacific Rim.',
      'Our menu follows the tide: locally sourced seasonal fish and shellfish, prepared simply so the catch stays the star. From raw bar oysters to wood-fired mains, every plate is built around freshness and restraint.',
    ],
  },
  menuHighlights: [
    {
      title: 'Flounder with lemon',
      category: 'main',
      image: unsplash('photo-1544025162-d76694265947', 900),
      imageAlt: 'Plated entree',
    },
    {
      title: 'Fresh oysters',
      category: 'appetizer',
      image: unsplash('photo-1551218808-94e220e084d2', 900),
      imageAlt: 'Plated appetizer',
    },
    {
      title: 'Assorted shrimp',
      category: 'appetizer',
      image: unsplash('photo-1553621042-f6e147245754', 900),
      imageAlt: 'Sushi platter',
    },
    {
      title: 'Shrimp',
      category: 'main',
      image: unsplash('photo-1600891964092-4316c288032e', 900),
      imageAlt: 'Steak dinner',
    },
    {
      title: 'House pasta',
      category: 'main',
      image: unsplash('photo-1466978913421-dad2ebd01d17', 900),
      imageAlt: 'Pasta dish',
    },
    {
      title: 'Chef’s selection',
      category: 'main',
      image: unsplash('photo-1579871494447-9811cf80d66c', 900),
      imageAlt: 'Sushi rolls',
    },
  ],
  events: {
    title: 'Coral Cove',
    titleAccent: 'restaurant events',
    image: unsplash('photo-1559339352-11d035aa65de', 1000),
    imageAlt: 'Set dining table',
    cta: 'Book Now',
    items: [
      {
        date: '15 FEB',
        title: 'Wine and dine 7-9 PM',
        price: '$50',
        body: 'A guided pairing of coastal wines with a three-course seafood tasting.',
      },
      {
        date: '16 FEB',
        title: 'Beverage Workshop',
        price: '$65',
        body: 'Learn cocktail foundations with our bar team — citrus, brine, and botanical notes.',
      },
      {
        date: '20 FEB',
        title: 'Culinary workshop',
        price: '$75',
        body: 'Hands-on session: knife skills, raw bar plating, and a shared supper at the end.',
      },
    ],
  },
  galleryImages: [
    { src: unsplash('photo-1552566626-52f8b828add9', 1200), alt: 'Restaurant interior' },
    { src: unsplash('photo-1555396273-367ea4eb4db5', 1200), alt: 'Open kitchen restaurant' },
    { src: unsplash('photo-1424847651672-bf20a4b0982b', 1200), alt: 'Friends dining' },
    { src: unsplash('photo-1569718212165-3a8278d5f624', 1200), alt: 'Ramen bowl' },
    { src: unsplash('photo-1577219491135-ce391730fb2c', 1200), alt: 'Chef in a kitchen' },
    { src: unsplash('photo-1513475382585-d06e58bcb0e0', 1200), alt: 'Dessert on a plate' },
  ],
  stats: [],
  features: [
    {
      title: 'Raw bar',
      body: 'Oysters, crudo, and chilled shellfish shucked to order.',
    },
    {
      title: 'Catch of the day',
      body: 'Dayboat fish, lemon, herbs — plated the moment it arrives.',
    },
    {
      title: 'Wine & spirits',
      body: 'Coastal bottles, crisp whites, and brine-friendly cocktails.',
    },
    {
      title: 'Private dining',
      body: 'Intimate rooms for celebrations and chef’s table evenings.',
    },
  ],
  testimonials: [
    {
      quote: 'The oysters alone are worth the reservation. Quiet, precise, unforgettable.',
      name: 'Amelia R.',
      role: 'Regular guest',
    },
    {
      quote: 'Bold flavours without noise — Coral Cove feels like a secret shore in the city.',
      name: 'James K.',
      role: 'Food writer',
    },
  ],
  pricing: [],
  team: [
    {
      name: 'Elena Marquez',
      role: 'Executive Chef',
      bio: 'Coastal cooking with a global pantry. Previously led kitchens in Lisbon and Brooklyn.',
    },
    {
      name: 'Noah Chen',
      role: 'Sommelier',
      bio: 'Builds lists around mineral whites, orange wines, and seafood-friendly reds.',
    },
  ],
  pages: [
    {
      slug: 'menu',
      label: 'Menu',
      kind: 'list',
      title: 'Our Menu',
      subtitle: 'Seasonal seafood, raw bar, and coastal plates. Sample evening selection.',
      items: [
        {
          title: 'East Coast oysters',
          body: 'Mignonette, lemon, seaweed salt.',
          meta: '18',
        },
        {
          title: 'Flounder with lemon',
          body: 'Brown butter, capers, soft herbs.',
          meta: '36',
        },
        {
          title: 'Assorted shrimp',
          body: 'Chilled cocktail sauce, pickled fennel.',
          meta: '24',
        },
        {
          title: 'Wood-fired catch',
          body: 'Dayboat fish, olive oil, citrus.',
          meta: '42',
        },
        {
          title: 'Shellfish pasta',
          body: 'Clams, chili, parsley, white wine.',
          meta: '28',
        },
        {
          title: 'Citrus tart',
          body: 'Yuzu cream, shortbread, sea salt.',
          meta: '14',
        },
      ],
    },
    {
      slug: 'gallery',
      label: 'Gallery',
      kind: 'gallery',
      title: 'Interior & plates',
      subtitle: 'A look inside Coral Cove — the room, the kitchen, the table.',
    },
    {
      slug: 'about',
      label: 'About',
      kind: 'about',
      title: 'Our story',
      subtitle:
        'Coral Cove opened on Park Avenue as a home for bold coastal cooking — fresh catch, careful technique, and a calm room built for lingering.',
    },
    {
      slug: 'reservation',
      label: 'Reservation',
      kind: 'contact',
      title: 'Book a table',
      subtitle: 'Parties of 1–8. Larger groups and private dining by email.',
    },
  ],
  cta: {
    title: 'Ready for the next tide?',
    subtitle: 'Reserve a table or join an upcoming restaurant event.',
    button: 'Reservation',
  },
  footer: '2025 © All Rights Reserved',
  nav: [
    { href: '/', label: 'Home' },
    { href: '/menu', label: 'Menu' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/about', label: 'About' },
    { href: '/reservation', label: 'Reservation' },
  ],
  footerLinks: [
    { href: '/reservation', label: 'Reservation' },
    { href: '/about', label: 'About' },
    { href: '/menu', label: 'Menu' },
    { href: '/about', label: 'Our Story' },
    { href: '/#events', label: 'Events' },
    { href: '/gallery', label: 'Interior' },
  ],
} as const;

export type Site = typeof site;
