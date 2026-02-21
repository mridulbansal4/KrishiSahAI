export type Language = 'EN' | 'HI' | 'MR';

export interface Farm {
  nickname: string;
  landType: 'Irrigated' | 'Rainfed' | 'Semi-Irrigated' | 'Organic Certified' | 'Greenhouse' | 'Polyhouse' | 'Mixed';
  soilType: string;
  waterResource: string;
  landSize: string;
  unit: 'Acre' | 'Hectare'; // kept for backward compat with existing data
  crop: string; // kept for backward compat
  crops?: string[]; // new: multi-crop support
  // Per-farm location (optional for backward compat)
  state?: string;
  district?: string;
  village?: string;
}

export interface UserProfile {
  name: string;
  age: string;
  phone: string;
  email?: string;
  language: Language;
  farms: Farm[];
  pin?: string;
  // Maintain legacy compatibility if needed
  occupation?: string;
  gender?: string;
  experience_years?: string;
}


export interface NavItem {
  id: string;
  label: string;
  path: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface BusinessOption {
  name: string;
  capital: string;
  risk: 'Low' | 'Moderate' | 'High';
  type: 'Safe' | 'Moderate' | 'High-Potential';
}

export interface PlanMilestone {
  period: string;
  label: string;
  description: string;
}
