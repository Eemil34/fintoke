export const site = {
  id: 'dental-clinic',
  layout: 'medical',
  mode: 'light',
  name: 'Dentria',
  tagline: 'Dental care that lets you smile confidently',
  description:
    'Dentria is a modern dental clinic for check-ups, restorations, whitening, and gentle care for nervous patients — clear plans, same-day options when possible, and a team that explains before it starts.',
  phone: '+123 456 7890',
  email: 'hello@dentria.care',
  address: '14 Töölönkatu, Helsinki',
  hours: 'Mon–Fri 8:00–18:00',
  hero: {
    eyebrow: '4.9★ Google Rating',
    title: 'Dental Care for Smile Confidently.',
    subtitle:
      'Friendly clinicians, modern rooms, and comprehensive care — from first exams to long-term smile plans — without the rush or the upsell.',
    cta: 'Book Appointment',
    ctaSecondary: 'Our treatments',
  },
  stats: [
    { value: '4.9★', label: 'Google Rating' },
    { value: '98%', label: 'Patient Satisfaction' },
    { value: '12+', label: 'Years of Care' },
  ],
  intro:
    'We built Dentria for people who want honest dentistry: unhurried exams, digital imaging you can see, and treatment plans written in plain language. Whether you need a routine clean or a full restorative path, we start with comfort and clarity.',
  highlights: [
    {
      number: '01',
      title: 'Same-day appointments',
      body: 'Urgent pain or a cracked filling? We keep open slots for same-day relief when schedules allow.',
      tone: 'teal' as const,
    },
    {
      number: '03',
      title: 'Clear treatment plans',
      body: 'Photos, options, and pricing before we start — you choose the pace.',
      tone: 'light' as const,
    },
    {
      number: '04',
      title: 'Insurance support',
      body: 'We help with claims paperwork so you are not left guessing after the visit.',
      tone: 'teal' as const,
    },
  ],
  whyChoose: [
    {
      title: 'Comfort for nervous patients',
      body: 'Longer slots, breaks whenever you need them, and clinicians who talk through each step without rushing.',
      tone: 'teal' as const,
    },
    {
      title: 'Modern dental technology',
      body: 'Digital imaging, quiet handpieces, and materials chosen for the tooth — not the brochure.',
      tone: 'light' as const,
    },
  ],
  features: [
    {
      title: 'Preventive check-ups',
      body: 'Unhurried exams, clear photos, and a plan you can take home.',
    },
    {
      title: 'Restorations & crowns',
      body: 'Inlays, crowns, and work designed to last — explained before we begin.',
    },
    {
      title: 'Whitening',
      body: 'Only when enamel and gums are ready. We’ll say no if they aren’t.',
    },
    {
      title: 'Anxiety-friendly visits',
      body: 'Extra time built in, with pauses and pacing you control.',
    },
  ],
  testimonials: [
    {
      quote: 'First dentist who talked me through every step without baby talk. I actually looked forward to the follow-up.',
      name: 'Laura M.',
      role: 'New patient',
    },
    {
      quote: 'They showed me the X-ray and the options. I chose. That felt new — and respectful.',
      name: 'Peter H.',
      role: 'Restorative care',
    },
    {
      quote: 'Same-day slot when I cracked a filling. Calm room, clear aftercare. Highly recommend Dentria.',
      name: 'Sofia K.',
      role: 'Emergency visit',
    },
  ],
  pricing: [
    {
      name: 'Exam & consult',
      price: '€85',
      features: ['Full check-up', 'Digital photos', 'Written plan'],
      highlighted: false,
    },
    {
      name: 'Hygiene visit',
      price: '€110',
      features: ['Professional clean', 'Gum assessment', 'Home-care tips'],
      highlighted: true,
    },
    {
      name: 'Emergency slot',
      price: '€120',
      features: ['Same-day when possible', 'Pain relief focus', 'Follow-up plan'],
      highlighted: false,
    },
  ],
  faq: [
    {
      title: 'Do you take new patients?',
      body: 'Yes. Tell us if you are nervous or need a translator — we adjust the visit length.',
    },
    {
      title: 'Can I book same-day?',
      body: 'We reserve slots for urgent cases. Call or use the appointment form and select “Emergency”.',
    },
    {
      title: 'Do you help with insurance?',
      body: 'We prepare invoices and codes so claims are straightforward. Coverage depends on your plan.',
    },
    {
      title: 'What if I have dental anxiety?',
      body: 'Ask for an anxiety visit. Longer appointments, breaks on request, and no pressure to decide on the spot.',
    },
  ],
  team: [
    {
      name: 'Dr. Emilia Saarinen',
      role: 'Lead dentist',
      bio: 'Restorative focus. Trained in Turku. Known for calm explanations and zero upsell.',
      image: 'photo-1559839734-2b71ea197ec2',
    },
    {
      name: 'Dr. Markus Lehtinen',
      role: 'General dentist',
      bio: 'Same-day relief, fillings, and crowns. Speaks EN / FI.',
      image: 'photo-1612349317150-e413f6a5b16d',
    },
    {
      name: 'Veera Laine',
      role: 'Dental hygienist',
      bio: 'Gentle cleans and the person patients actually confess to about flossing.',
      image: 'photo-1631217868264-e5b90bb7e133',
    },
  ],
  pages: [
    {
      slug: 'treatments',
      label: 'Services',
      kind: 'list',
      title: 'Treatments built around clarity',
      subtitle: 'Preventive care, restorations, whitening, and anxiety-friendly visits — referred out when surgery is needed.',
      items: [
        {
          title: 'Exams & hygiene',
          body: 'The important foundation. Photos included, gum health checked, plan in writing.',
        },
        {
          title: 'Fillings & crowns',
          body: 'Materials chosen for the tooth. Digital imaging so you see what we see.',
        },
        {
          title: 'Whitening',
          body: 'After we check enamel and gums — never as a first-visit pressure sale.',
        },
        {
          title: 'Emergency care',
          body: 'Pain, trauma, or a lost filling. Same-day when the schedule allows.',
        },
      ],
    },
    {
      slug: 'team',
      label: 'Doctors',
      kind: 'team',
      title: 'Clinicians who explain before they start',
      subtitle: 'A small practice on purpose — you will recognize the faces.',
    },
    {
      slug: 'about',
      label: 'About',
      kind: 'about',
      title: 'Why Dentria exists',
      subtitle:
        'We opened so patients could get more than twelve rushed minutes. Comfort, modern tools, and honest options — that is the whole idea.',
    },
    {
      slug: 'appointment',
      label: 'Appointment',
      kind: 'contact',
      title: 'Book your visit',
      subtitle: 'New patients: tell us if you’re nervous. We’ll add minutes, not a lecture.',
    },
  ],
  cta: {
    title: 'Ready for a calmer dental visit?',
    subtitle: 'Request a time online or call us — no pressure to book treatment on the first appointment.',
    button: 'Book Appointment',
  },
  footer: 'Dentria · Modern dental care in Töölö. Demo clinic copy for this healthcare template.',
  nav: [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/treatments', label: 'Services' },
    { href: '/team', label: 'Doctors' },
    { href: '/appointment', label: 'Appointment' },
  ],
} as const;

export type Site = typeof site;
