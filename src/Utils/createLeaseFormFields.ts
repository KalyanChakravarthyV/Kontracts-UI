

export type FieldType =
  | "text"
  | "number"
  | "email"
  | "phone"
  | "date"
  | "textarea"
  | "select"
  | "checkbox";

export interface FieldConfig {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
}

export interface SectionConfig {
  section: string;
  description?: string;
  fields: FieldConfig[];
}

export const createLeaseFormFields: SectionConfig[] = [
  // 1. Lease Identification
  {
    section: "Lease Identification",
    description: "Basic lease information and identifiers",
    fields: [
      { id: "document_id", label: "Document ID", type: "text", required: false },
      { id: "lease_id", label: "Lease ID", type: "text", required: true },
      { id: "lease_name", label: "Lease Name", type: "text", required: true },
      { id: "lessor_name", label: "Lessor Name", type: "text", required: true },
      {
        id: "contract_type",
        label: "Contract Type",
        type: "select",
        options: ["real-estate", "equipment", "vehicle"],
      },
      {
        id: "status",
        label: "Status",
        type: "select",
        options: ["draft", "active", "expired", "terminated"],
      },
    ],
  },

  // 2. Tenant Information
  {
    section: "Tenant Information",
    description: "Details about the lessee",
    fields: [
      { id: "lessee_name", label: "Tenant Name", type: "text", required: true },
      { id: "contact_person", label: "Contact Person", type: "text" },
      { id: "email", label: "Email", type: "email" },
      { id: "phone", label: "Phone", type: "phone" },
    ],
  },

  // 3. Property / Asset Information
  {
    section: "Property / Asset Information",
    description: "Details about the leased asset",
    fields: [
      { id: "property_address", label: "Property Address", type: "text" },
      {
        id: "property_type",
        label: "Property Type",
        type: "select",
        options: ["office", "retail", "industrial", "warehouse", "residential"],
        required: true
      },
      { id: "asset_class", label: "Asset Class", type: "text" },
      { id: "property_tax", label: "Property Tax", type: "number" },
      {
        id: "asset_description",
        label: "Asset Description",
        type: "textarea",
      },
    ],
  },

  // 4. Lease Dates
  {
    section: "Lease Dates",
    description: "Key dates for the lease",
    fields: [
      {
        id: "commencement_date",
        label: "Commencement Date",
        type: "date",
        required:true
      },
      {
        id: "lease_start_date",
        label: "Lease Start Date",
        type: "date",
        required: true
      },
      {
        id: "end_date",
        label: "Lease End Date",
        type: "date",
        required:true
      },
      {
        id: "rent_start_date",
        label: "Rent Start Date",
        type: "date",
        required: true
      },
    ],
  },

  // 5. Accounting Classification
  {
    section: "Accounting Classification",
    description: "IFRS / ASC details",
    fields: [
      {
        id: "accounting_standard",
        label: "Accounting Standard",
        type: "select",
        options: ["ASC842", "IFRS16"],
      },
      {
        id: "classification",
        label: "Lease Classification",
        type: "select",
        required:true,
        options: ["operating", "finance"],
      },
      {
        id: "incremental_borrowing_rate",
        label: "Incremental Borrowing Rate",
        type: "number",
        required:true
      },
      { id: "discount_rate", label: "Discount Rate", type: "number" },
      { id: "residual_value", label: "Residual Value", type: "number" },
    ],
  },

  // 6. Lease Options
  {
    section: "Lease Options",
    description: "Renewal and purchase options",
    fields: [
      {
        id: "renewal_option_available",
        label: "Renewal Option Available",
        type: "checkbox",
      },
      {
        id: "purchase_option_available",
        label: "Purchase Option Available",
        type: "checkbox",
      },
    ],
  },

  // 7. Financial & Adjustments
  {
    section: "Financial & Adjustments",
    description: "Payment terms, costs, and financial incentives",
    fields: [
      { id: "currency", label: "Currency", type: "select", options: [], required: true },
      { id: "payment_terms", label: "Payment Terms", type: "text" },
      {
        id: "initial_direct_costs",
        label: "Initial Direct Costs",
        type: "number",
      },
      { id: "prepaid_rent", label: "Prepaid Rent", type: "number" },
      {
        id: "lease_incentives",
        label: "Lease Incentives",
        type: "number",
      },
    ],
  },

  // 8. Additional Notes
  {
    section: "Additional Notes",
    description: "Any additional information or special terms",
    fields: [
      {
        id: "additional_notes",
        label: "Additional Notes",
        type: "textarea",
      },
    ],
  },
];
