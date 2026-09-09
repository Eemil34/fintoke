import { unsplash } from '@/lib/imageLibrary';

export const site = {
  id: 'medical-hospital',
  layout: 'medical',
  mode: 'light',
  name: 'Medwell',
  tagline: 'Trusted hospital care in Töölö',
  description:
    'Medwell is a modern community hospital offering emergency care, surgery, diagnostics, and continuous support for patients and families.',
  contact: {
    email: 'care@medwell.fi',
    phone: '+358 9 4242 1100',
    address: 'Mannerheimintie 42, 00260 Helsinki',
    hours: 'Emergency open 24/7 · Clinics Mon–Fri 8–18',
  },
  hero: {
    eyebrow: 'Hospital care that matters',
    titleBefore: 'A Safe Place Where Patients ',
    titleEmphasis: 'Feel',
    titleAfter: ' Cared For.',
    subtitle:
      'From urgent care to planned treatment, Medwell combines specialist teams, calm wards, and clear communication every step of the way.',
    cta: 'Book An Appointment',
    ctaSecondary: 'Watch Intro',
    reviewsLabel: '1.5K+ Reviews',
  },
  heroFeatures: [
    {
      title: '24/7 Emergency Care',
      body: 'Round-the-clock triage and acute support when minutes matter.',
    },
    {
      title: 'Personalized Treatment',
      body: 'Care plans shaped around your diagnosis, goals, and recovery.',
    },
    {
      title: 'Safe & Calm Wards',
      body: 'Quiet rooms, attentive nurses, and family-friendly visiting.',
    },
  ],
  about: {
    eyebrow: 'About Medwell',
    title: 'Dedicated Experts For Every Stage Of Care',
    visionTitle: 'Our Vision',
    vision:
      'A hospital where every patient feels informed, respected, and never rushed through treatment.',
    missionTitle: 'Our Mission',
    mission:
      'Deliver precise medical care with compassion — from first assessment to lasting recovery support.',
    cta: 'More About Us',
  },
  stats: [
    { value: '20+', label: 'Years Of Experience' },
    { value: '12K+', label: 'Patients Supported' },
    { value: '85+', label: 'Specialist Clinicians' },
  ],
  features: [
    {
      title: 'Emergency & Acute Care',
      body: 'Immediate assessment, stabilisation, and coordinated hospital admission when needed.',
    },
    {
      title: 'Diagnostic Imaging',
      body: 'On-site X-ray, ultrasound, and CT with rapid reporting for faster decisions.',
    },
    {
      title: 'Surgical Services',
      body: 'Planned and urgent procedures with clear pre-op guidance and recovery pathways.',
    },
    {
      title: 'Internal Medicine',
      body: 'Ongoing management for chronic illness, infections, and complex medical cases.',
    },
    {
      title: 'Maternity & Family Care',
      body: 'Prenatal visits, delivery support, and gentle postnatal follow-up.',
    },
    {
      title: 'Rehabilitation',
      body: 'Physiotherapy and recovery programs that rebuild strength after illness or surgery.',
    },
  ],
  whyChoose: {
    eyebrow: 'Why Choose Medwell',
    titleBefore: 'Thoughtful Care You Can ',
    titleEmphasis: 'Trust',
    titleAfter: '.',
    items: [
      {
        title: 'Compassionate Clinicians',
        body: 'Doctors and nurses who explain options clearly and listen before they act.',
      },
      {
        title: 'Personalized Pathways',
        body: 'Treatment plans tailored to your condition, schedule, and support network.',
      },
      {
        title: 'Safe Hospital Environment',
        body: 'Modern infection control, calm wards, and continuous monitoring when required.',
      },
    ],
    cta: 'Learn More',
  },
  process: {
    eyebrow: 'How We Support You',
    titleBefore: 'Simple Steps To ',
    titleEmphasis: 'Better',
    titleAfter: ' Care',
    subtitle:
      'A clear path from first conversation to recovery — so patients and families always know what comes next.',
    steps: [
      {
        number: '01',
        title: 'Understand & Assess',
        body: 'We review symptoms, history, and tests so the diagnosis is clear from the start.',
        image: unsplash('photo-1600880292203-757bb62b4baf', 900),
        imageAlt: 'Care team meeting around a table',
      },
      {
        number: '02',
        title: 'Plan & Treat',
        body: 'Your care team builds a plan — medication, procedures, or monitoring — with your input.',
        image: unsplash('photo-1522071820081-009f0129c71c', 900),
        imageAlt: 'Clinicians collaborating on a care plan',
      },
      {
        number: '03',
        title: 'Recover & Communicate',
        body: 'We follow progress, update families, and guide rehabilitation until you are steady again.',
        image: unsplash('photo-1551434678-e076c223a692', 900),
        imageAlt: 'Follow-up conversation with the care team',
      },
    ],
  },
  testimonials: [
    {
      quote:
        'From admission to discharge, every nurse explained what was happening. I never felt lost in the system.',
      name: 'Anna K.',
      role: 'Patient',
    },
    {
      quote:
        'The surgical team was precise and kind. Follow-up calls after my operation made recovery feel manageable.',
      name: 'Mikko R.',
      role: 'Surgery patient',
    },
    {
      quote:
        'They treated my mother with real dignity. Clear updates every evening helped our whole family.',
      name: 'Sofia L.',
      role: 'Family member',
    },
  ],
  pricing: [],
  team: [
    {
      name: 'Dr. Emilia Saarinen',
      role: 'Chief of Medicine',
      bio: 'Internal medicine lead focused on complex cases and coordinated inpatient care.',
    },
    {
      name: 'Dr. Henrik Virtanen',
      role: 'Head of Surgery',
      bio: 'General and acute surgery with an emphasis on safe, well-explained procedures.',
    },
    {
      name: 'Dr. Aino Korhonen',
      role: 'Emergency Physician',
      bio: 'Triage and acute care specialist who keeps families informed under pressure.',
    },
    {
      name: 'Nurse Lead Veera Laine',
      role: 'Director of Nursing',
      bio: 'Ward standards, patient comfort, and the calm voice patients remember.',
    },
  ],
  pages: [
    {
      slug: 'treatments',
      label: 'Our Services',
      kind: 'list',
      title: 'Hospital services for everyday and urgent needs',
      subtitle: 'Specialist departments working as one care team — not isolated clinics.',
      items: [
        {
          title: 'Emergency department',
          body: '24/7 triage, acute assessment, and rapid pathways into the right specialty.',
        },
        {
          title: 'Diagnostics & imaging',
          body: 'Lab work and imaging under one roof so treatment does not wait on paperwork.',
        },
        {
          title: 'Surgery & recovery',
          body: 'Planned operations with pre-op counselling and structured post-op rehab.',
        },
        {
          title: 'Inpatient wards',
          body: 'Monitored stays with clear visiting hours and daily physician rounds.',
        },
        {
          title: 'Outpatient clinics',
          body: 'Follow-ups, specialist consults, and chronic care without overnight admission.',
        },
        {
          title: 'Rehabilitation',
          body: 'Physio and recovery coaching after stroke, injury, or major surgery.',
        },
      ],
    },
    {
      slug: 'team',
      label: 'Our Team',
      kind: 'team',
      title: 'Specialists you will meet',
      subtitle: 'Clinicians who coordinate across departments so you are never passed around blindly.',
    },
    {
      slug: 'about',
      label: 'About Us',
      kind: 'about',
      title: 'A calmer kind of hospital',
      subtitle:
        'Medwell opened in Töölö to bring specialist hospital care closer to daily life — with time to explain, and room to recover.',
    },
    {
      slug: 'appointment',
      label: 'Contact Us',
      kind: 'contact',
      title: 'Make an appointment',
      subtitle: 'Share your symptoms or referral details. Our team will guide the next available slot.',
    },
  ],
  cta: {
    title: 'Need care today? Start with a conversation.',
    subtitle: 'Book a clinic visit or call our care desk — emergency patients are always welcome 24/7.',
    button: 'Make An Appointment',
  },
  footer:
    'Medwell Hospital · Mannerheimintie 42, Helsinki · Emergency 24/7 · Fictional template copy for this healthcare demo.',
  nav: [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About Us' },
    { href: '/treatments', label: 'Our Services' },
    { href: '/team', label: 'Our Team' },
    { href: '/appointment', label: 'Contact Us' },
  ],
  images: {
    hero: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=1800&q=80',
    about: 'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?auto=format&fit=crop&w=1200&q=80',
    why1: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=900&q=80',
    why2: 'https://images.unsplash.com/photo-1571772996211-2f02c9727629?auto=format&fit=crop&w=900&q=80',
    why3: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=80',
    avatar1: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=200&q=80',
    avatar2: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?auto=format&fit=crop&w=200&q=80',
    avatar3: 'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=200&q=80',
  },
} as const;

export type Site = typeof site;
