// Lease data types matching API response structure

export interface LeaseData {
  lease_name: string;
  lessor_name: string;
  lessee_name: string;
  contract_type: string;
  status: 'active' | 'inactive' | 'terminated';
  document_id: string;
  lease_id: string;
  contact_person: string;
  email: string;
  phone: string;
  property_address: string;
  property_type: 'office' | 'retail' | 'industrial' | 'warehouse' | 'other';
  asset_class: string;
  asset_description: string;
  lease_start_date: string;
  rent_start_date: string;
  accounting_standard: string;
  renewal_option_available: boolean;
  purchase_option_available: boolean;
  additional_notes: string;
  commencement_date: string;
  end_date: string;
  payment_terms: string;
  initial_direct_costs: number;
  prepaid_rent: number;
  lease_incentives: number;
  residual_value: number;
  incremental_borrowing_rate: number;
  discount_rate: number;
  classification: 'operating' | 'finance';
}

// For form data that may have partial or string values
export interface LeaseFormData {
  [key: string]: string | boolean | number | null | undefined;
}

// API response when creating/updating a lease
export interface LeaseApiResponse extends LeaseData {
  id?: number;
  created_at?: string;
  updated_at?: string;
}
