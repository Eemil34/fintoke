export const site = {
  id: 'fine-dining',
  layout: 'hospitality',
  mode: 'dark',
  name: 'Säde',
  tagline: 'A tasting room in Punavuori',
  description:
    'Twenty seats, one sitting, and a menu that shifts with the season. Säde is a candlelit tasting room on Iso Roobertinkatu — Nordic produce, open kitchen, no repeats.',
  hero: {
    eyebrow: 'Punavuori · Helsinki',
    title: 'Light, plate, and the long table.',
    subtitle:
      'Nine courses at a single sitting. Finnish ingredients treated with patience — cured archipelago fish, garden greens from Vantaa, lamb from a farm we visit ourselves.',
    cta: 'Request a reservation',
    ctaSecondary: 'View the menu',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=80',
  },
  images: {
    gallery: {
      title: 'A glimpse before you arrive',
      subtitle: 'Low light, open kitchen, plates that change with the week.',
      items: [
        {
          src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80',
          alt: 'Fine dining course on a dark table',
          caption: 'From the pass',
        },
        {
          src: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80',
          alt: 'Candlelit restaurant interior',
        },
        {
          src: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=80',
          alt: 'Wine being poured into a glass',
        },
        {
          src: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80',
          alt: 'Chef plating a dish',
          caption: 'Open kitchen',
        },
        {
          src: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80',
          alt: 'Elegant dessert plate',
          caption: 'Last light',
        },
        {
          src: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
          alt: 'Nordic ingredients on a board',
        },
      ],
    },
    pages: {
      menu: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=1400&q=80',
      about: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=1400&q=80',
      reservation: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1400&q=80',
      contact: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1400&q=80',
    },
    pricing: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=900&q=80',
    testimonialFeatured:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1000&q=80',
  },
  stats: [
    { value: '20', label: 'Seats per evening' },
    { value: '9', label: 'Courses' },
    { value: '19:00', label: 'Single sitting' },
  ],
  sections: {
    features: {
      title: 'An evening at Säde',
      subtitle: 'Everything is built around one unhurried service — from the first pour to the last bite.',
    },
    testimonials: {
      title: 'From our guests',
    },
    pricing: {
      title: 'The evening',
      subtitle: 'All prices per person. Service included.',
    },
    team: {
      title: 'The kitchen',
      subtitle: 'A small team that prefers fewer covers to louder rooms.',
    },
  },
  features: [
    {
      title: 'Seasonal tasting menu',
      body: 'Nine courses that change weekly. A vegetarian path with forty-eight hours notice. Allergies noted at booking.',
      image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=900&q=80',
    },
    {
      title: 'The room',
      body: 'Low light, linen napkins, and an open kitchen you can watch from every seat. Punavuori outside; quiet inside.',
      image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=900&q=80',
    },
    {
      title: 'Wine & ferments',
      body: 'Nordic bottles curated by our sommelier, plus house ferments — birch sap, sea buckthorn, last summer’s berries.',
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=900&q=80',
    },
    {
      title: 'Private sittings',
      body: 'Buy out the room on Sunday evenings. Birthdays, small teams, or a table that wants the kitchen to itself.',
      image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=900&q=80',
    },
  ],
  testimonials: [
    {
      quote:
        'Not theatre — just cooking with nowhere to hide. The archipelago course still comes up in conversation months later.',
      name: 'M. Korhonen',
      role: 'Helsinki Food Guide',
    },
    {
      quote:
        'We booked for an anniversary and left feeling like the only two people in Helsinki. Worth every minute of the waitlist.',
      name: 'J. & A. Lindström',
      role: 'Anniversary dinner',
    },
    {
      quote:
        'The pairing felt considered without being precious. Someone here actually tastes what they pour.',
      name: 'E. Virtanen',
      role: 'Regular guest',
    },
  ],
  pricing: [
    {
      name: 'Tasting menu',
      price: '€165',
      features: ['Nine courses', 'Bread & butter service', 'Dietary notes welcome'],
    },
    {
      name: 'Wine pairing',
      price: '€95',
      features: ['Six pours', 'Low-alcohol option', 'Non-alcoholic pairing €55'],
      highlighted: true,
    },
    {
      name: 'Sunday buyout',
      price: '€2,800',
      features: ['Up to 18 guests', 'Custom menu', 'Sommelier on request'],
    },
  ],
  team: [
    {
      name: 'Aino Leppänen',
      role: 'Executive Chef',
      bio: 'Copenhagen and Stockholm before Helsinki. Obsessed with Finnish winter produce and fire.',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
    },
    {
      name: 'Marcus Wuori',
      role: 'Head Sommelier',
      bio: 'Small Nordic wineries, natural when it makes sense, always in balance with the plate.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
    },
    {
      name: 'Sara Niemi',
      role: 'Pastry & Fermentation',
      bio: 'Runs our larder — misos, vinegars, and the desserts that land after the savoury arc.',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80',
    },
  ],
  contact: {
    address: 'Iso Roobertinkatu 14',
    city: '00120 Helsinki, Finland',
    email: 'hello@sade.fi',
    phone: '+358 40 123 4567',
    hours: 'Thu–Sat · doors 18:30 · service 19:00',
    instagram: '@sade.helsinki',
  },
  pages: [
    {
      slug: 'menu',
      label: 'Menu',
      kind: 'list',
      title: 'This week’s menu',
      subtitle: 'A sketch — the printed menu at your table is the final word.',
      items: [
        {
          title: 'Archipelago, cold',
          body: 'Cured vendace, spruce oil, cultured cream, pickled elderflower.',
          meta: 'I',
        },
        {
          title: 'Root & ember',
          body: 'Charred celeriac, smoked butter, horseradish snow.',
          meta: 'II',
        },
        {
          title: 'Garden, warm',
          body: 'Compressed cabbage, last year’s honey, burnt onion broth.',
          meta: 'III',
        },
        {
          title: 'From the coast',
          body: 'Hand-dived scallop, sea kale, fermented cucumber.',
          meta: 'IV',
        },
        {
          title: 'Between courses',
          body: 'Sorbet of foraged berries — a pause before the fire.',
          meta: 'V',
        },
        {
          title: 'Fire',
          body: 'Agnes the lamb, or celeriac steak — depends on what the farm sends.',
          meta: 'VI',
        },
        {
          title: 'Forest floor',
          body: 'Wild mushrooms, pine needle, aged cheese from Jukola.',
          meta: 'VII',
        },
        {
          title: 'Pre-dessert',
          body: 'Birch sap granita, lemon thyme.',
          meta: 'VIII',
        },
        {
          title: 'Last light',
          body: 'Cloudberry, rye crumble, brown butter ice cream.',
          meta: 'IX',
        },
      ],
    },
    {
      slug: 'about',
      label: 'House',
      kind: 'about',
      title: 'A small room on purpose',
      subtitle:
        'We cook for twenty because that is how many plates we can finish properly — and because Punavuori deserves a table that feels like a secret, not a spectacle.',
    },
    {
      slug: 'reservation',
      label: 'Reservation',
      kind: 'contact',
      title: 'Request a night',
      subtitle:
        'We confirm by email within two days. A card holds your table; cancel free up to seventy-two hours before service.',
    },
    {
      slug: 'contact',
      label: 'Contact',
      kind: 'contact',
      title: 'Write to the house',
      subtitle: 'Press, private sittings, supplier inquiries — or a question before you book.',
    },
  ],
  cta: {
    title: 'If you can be on time, we can cook.',
    subtitle: 'Reservations for the next month open on the first Thursday at 10:00.',
    button: 'Request a table',
  },
  footer:
    'A tasting room on Iso Roobertinkatu. One sitting, three nights a week — Thursday through Saturday.',
  nav: [
    { href: '/', label: 'Home' },
    { href: '/menu', label: 'Menu' },
    { href: '/about', label: 'House' },
    { href: '/reservation', label: 'Reservation' },
    { href: '/contact', label: 'Contact' },
  ],
} as const;

export type Site = typeof site;

export const reservationHref =
  site.nav.find((item) => item.href === '/reservation')?.href ?? '/reservation';
