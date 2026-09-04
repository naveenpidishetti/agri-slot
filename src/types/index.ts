export type Role = 'FARMER' | 'STAFF' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email?: string;
  mobile: string;
  role: Role;
  language: string;
  village?: string;
  district?: string;
  state?: string;
  farmer_id?: string;
  land_area_acres?: number;
  upi_id?: string;
  bank_account?: string;
  primary_crops?: string[];
  center_id?: string;
  designation?: string;
  badge_number?: string;
}

export interface ProcurementCenter {
  id: string;
  name: string;
  type?: 'RICE_MILL' | 'GRAIN_MANDI' | 'COTTON_GIN' | 'APMC_HUB' | 'OIL_MILL';
  code: string;
  village: string;
  district: string;
  state: string;
  address: string;
  contact_phone: string;
  email?: string;
  daily_capacity_quintals: number;
  max_daily_slots: number;
  current_booked_slots: number;
  operating_start_time: string;
  operating_end_time: string;
  avg_unloading_time_mins: number;
  is_active: boolean;
  distance_km?: number;
  rating?: number;
}

export interface Crop {
  id: string;
  name: string;
  code: string;
  category: string;
  msp_price_per_quintal: number;
  max_moisture_percent: number;
}

export type BookingStatus = 'CONFIRMED' | 'CHECKED_IN' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';

export interface Booking {
  id: string;
  token_number: string;
  farmer_id: string;
  farmer_name: string;
  farmer_mobile: string;
  farmer_email?: string;
  email_sent?: boolean;
  center_id: string;
  center_name: string;
  crop_id: string;
  crop_name: string;
  quantity_quintals: number;
  booking_date: string;
  slot_time: string;
  status: BookingStatus;
  estimated_waiting_mins: number;
  checked_in_at?: string;
  completed_at?: string;
  created_at: string;
  verified_quantity?: number;
  moisture_level?: string;
}

export interface QueueEntry {
  id: string;
  booking_id: string;
  center_id: string;
  token_number: string;
  queue_position: number;
  status: 'WAITING' | 'IN_SERVICE' | 'FINISHED' | 'SKIPPED';
  called_at?: string;
  finished_at?: string;
  farmer_name?: string;
  farmer_mobile?: string;
  crop_name?: string;
  quantity_quintals?: number;
  slot_time?: string;
  bookingStatus?: BookingStatus;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'REMINDER' | 'QUEUE_UPDATE' | 'BOOKING_CONFIRMED' | 'SYSTEM_ALERT';
  is_read: boolean;
  created_at: string;
}

export interface ScannerResult {
  farmerId: string;
  cropType: string;
  analyzedAt: string;
  qualityGrade: 'GRADE_A' | 'GRADE_B' | 'GRADE_C' | 'REJECT';
  status: string;
  confidenceScore: number;
  discolorationPercent: number;
  foreignMatterPercent: number;
  moldDetected: boolean;
  damagedGrainsPercent: number;
  estimatedMoisturePercent: number;
  recommendation: string;
  badgeColor: 'green' | 'amber' | 'red';
  disclaimer: string;
}

export interface DiseaseDiagnosisResult {
  id: string;
  farmerId: string;
  cropType: string;
  plantPart: string;
  analyzedAt: string;
  isValidPlant?: boolean;
  invalidReason?: string;
  diseaseName: string;
  teluguName?: string;
  hindiName?: string;
  severity: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH';
  confidence: number;
  category: string;
  symptoms: string[];
  organicRemedy: string;
  chemicalTreatment: string;
  preventionPlan: string;
  urgency: string;
  kvkHelpline: string;
  disclaimer: string;
}

export interface QualityValuation {
  qualityGrade: 'GRADE_A_PREMIUM' | 'FAQ_STANDARD' | 'GRADE_B_DISCOUNT' | 'BELOW_FAQ';
  gradeName: string;
  realizablePricePerQuintal: number;
  totalLotValue: number;
  baseMandiRate: number;
  moistureAdjustment: number;
  diseaseAdjustment: number;
  storageAgeAdjustment: number;
  foreignMatterAdjustment: number;
  purityScore: number;
  dryingAdvice?: string;
  visualAnalysisSummary?: {
    luster: 'HIGH' | 'MEDIUM' | 'DULL';
    discolorationPercent: number;
    pestDamageDetected: boolean;
    aiObservations: string[];
  };
}

export interface PricePredictionFactors {
  moisturePercent?: number;
  daysAfterHarvest?: number;
  brokenGrainPercent?: number;
  foreignMatterPercent?: number;
  appearingDisease?: string;
  yieldImage?: string;
  lotQuantityQuintals?: number;
}

export interface PricePredictionData {
  state: string;
  district: string;
  cropName: string;
  cropId: string;
  currentModalPrice: number;
  mspPrice: number;
  priceDiffMsp: number;
  trend: 'RISING' | 'STABLE' | 'DECLINING';
  forecast7Day: number;
  forecast15Day: number;
  forecast30Day: number;
  confidenceScore: number;
  recommendation: string;
  bestSellingWindow: string;
  nearbyDistricts: {
    district: string;
    modalPrice: number;
    distanceKm: number;
  }[];
  priceHistory: {
    month: string;
    price: number;
    forecast?: boolean;
  }[];
  valuation?: QualityValuation;
}

export interface AgriTechArticle {
  id: string;
  title: string;
  teluguTitle?: string;
  hindiTitle?: string;
  category: 'DRONES' | 'IOT_SENSORS' | 'SATELLITE_AI' | 'COLD_STORAGE' | 'HYDROPONICS' | 'ROBOTICS' | 'CARBON_CREDITS';
  tag: string;
  icon: string;
  summary: string;
  fullDetails: string;
  keyBenefits: string[];
  governmentSubsidy: string;
  estimatedRoi: string;
  realWorldImpact: string;
}

export interface SoilTypeInfo {
  id: string;
  name: string;
  description: string;
  defaultPH: number;
  nitrogenStatus: string;
  phosphorusStatus: string;
  potassiumStatus: string;
  bestCrops: string[];
}

export interface PreviousCropInfo {
  id: string;
  name: string;
  category: string;
  residualNitrogen: string;
  soilImpact: string;
}

export interface SeedVarietyInfo {
  name: string;
  duration: string;
  seedRateKgPerAcre: number;
  yieldPotentialQtlPerAcre: string;
  features: string;
  totalSeedNeededKg?: number;
}

export interface CropAdvisoryRecommendation {
  success: boolean;
  cropKey: string;
  cropName: string;
  farmSizeAcres: number;
  soil: {
    type: string;
    pH: number;
    fertilityLevel: string;
    description: string;
  };
  season: string;
  previousCrop: {
    name: string;
    category: string;
    soilImpact: string;
    nitrogenDiscountPercent: number;
    rotationBenefitText: string;
  };
  seeds: {
    varieties: SeedVarietyInfo[];
    seedTreatment: {
      fungicide: string;
      bioAgent: string;
      protocol: string;
    };
  };
  fertilizerSchedule: {
    basal: string;
    tilleringOrVegetative: string;
    floweringOrReproductive: string;
    foliarNutrients: string;
    organicManure: string;
    bagsEstimate: {
      urea45kgBags: number;
      dap50kgBags: number;
      mop50kgBags: number;
      zincSulphateKg: number;
    };
  };
  protectionPlan: {
    weedManagement: string;
    pestControl: { pest: string; chemical: string; stage: string }[];
    diseaseControl: { disease: string; fungicide: string; timing: string }[];
    bioRemedy: string;
  };
  aiAdvisorySummary: string;
  disclaimer: string;
}
