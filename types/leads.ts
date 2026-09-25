export type LeadResponse = 'none' | 'waiting' | 'yes' | 'no';
export type ResearchStatus = 'none' | 'partial' | 'ready';

export interface WorkspaceLead {
  id: string;
  business: string;
  contactName: string;
  whatTheyDo: string;
  email: string;
  emailSource: string;
  phone: string;
  city: string;
  address: string;
  website: string;
  hasWebsite: boolean;
  facebook: string;
  instagram: string;
  sources: string;
  researchNotes: string;
  researchStatus: ResearchStatus;
  language: string;
  style: string;
  audience: string;
  currentSiteNotes: string;
  siteLook: string;
  siteState: string;
  siteActions: string;
  offerPrice: string;
  offerSent: boolean;
  responded: LeadResponse;
  called: boolean;
  messageSent: boolean;
  vercelUrl: string;
  nextStep: string;
  followUpAt: string;
  notes: string;
  details: string;
  personId?: string;
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

export type LeadInput = Partial<Omit<WorkspaceLead, 'id' | 'createdAt' | 'updatedAt'>>;
