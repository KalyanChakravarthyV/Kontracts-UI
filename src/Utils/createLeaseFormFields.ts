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
      { id: "external_id", label: "External ID", type: "text" },
      { id: "lease_name", label: "Lease Name", type: "text", required: true },
      { id: "lessor_name", label: "Lessor Name", type: "text", required: true },
      { id: "lessor_group", label: "Lessor Group", type: "text" },
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

  // 3. Organizational Information
  {
    section: "Organizational Information",
    description: "Business unit and ownership details",
    fields: [
      { id: "reviewer_id", label: "Reviewer ID", type: "text" },
      { id: "approver_id", label: "Approver ID", type: "text" },
      { id: "legal_entity", label: "Legal Entity", type: "text" },
      { id: "business_unit", label: "Business Unit", type: "text" },
      { id: "department_cost_center", label: "Department / Cost Center", type: "text" },
      { id: "region_country", label: "Region / Country", type: "text" },
      { id: "related_party_flag", label: "Related Party Flag", type: "checkbox" },
      { id: "accounting_owner", label: "Accounting Owner", type: "text" },
    ],
  },

  // 4. Property / Asset Information
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
      { id: "asset_serial_number", label: "Asset Serial Number", type: "text" },
      {
        id: "asset_description",
        label: "Asset Description",
        type: "textarea",
      },
    ],
  },

  // 5. Scope Assessment (ASC 842 / IFRS 16)
  {
    section: "Scope Assessment",
    description: "Lease identification and scope determination",
    fields: [
      { id: "embedded_lease_flag", label: "Embedded Lease Flag", type: "checkbox" },
      { id: "judgment_memo", label: "Judgment Memo", type: "textarea" },
      { id: "arrangement_contains_lease", label: "Arrangement Contains Lease", type: "checkbox" },
      { id: "identified_asset_flag", label: "Identified Asset Flag", type: "checkbox" },
      { id: "asset_explicitly_specified", label: "Asset Explicitly Specified", type: "checkbox" },
      { id: "asset_implicitly_specified", label: "Asset Implicitly Specified", type: "checkbox" },
      { id: "supplier_substitution_rights", label: "Supplier Substitution Rights", type: "checkbox" },
      { id: "substitution_rights_substantive", label: "Substitution Rights Substantive", type: "checkbox" },
      { id: "customer_controls_use", label: "Customer Controls Use", type: "checkbox" },
      { id: "customer_obtains_econ_benefits", label: "Customer Obtains Economic Benefits", type: "checkbox" },
      { id: "customer_directs_use", label: "Customer Directs Use", type: "checkbox" },
      { id: "protective_rights_only", label: "Protective Rights Only", type: "checkbox" },
      { id: "scope_conclusion_memo", label: "Scope Conclusion Memo", type: "textarea" },
      { id: "scope_assessment_date", label: "Scope Assessment Date", type: "date" },
    ],
  },

  // 6. Lease Dates
  {
    section: "Lease Dates",
    description: "Key dates for the lease",
    fields: [
      { id: "contract_execution_date", label: "Contract Execution Date", type: "date" },
      { id: "lease_inception_date", label: "Lease Inception Date", type: "date" },
      { id: "possession_access_date", label: "Possession / Access Date", type: "date" },
      {
        id: "commencement_date",
        label: "Commencement Date",
        type: "date",
        required: true
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
        required: true
      },
      { id: "original_contractual_end_date", label: "Original Contractual End Date", type: "date" },
      {
        id: "rent_start_date",
        label: "Rent Start Date",
        type: "date",
        required: true
      },
      { id: "rent_free_period_start", label: "Rent Free Period Start", type: "date" },
      { id: "rent_free_period_end", label: "Rent Free Period End", type: "date" },
      { id: "notice_deadline_renewal", label: "Notice Deadline (Renewal)", type: "date" },
      { id: "notice_deadline_termination", label: "Notice Deadline (Termination)", type: "date" },
    ],
  },

  // 7. Renewal Options
  {
    section: "Renewal Options",
    description: "Renewal option details and assessment",
    fields: [
      { id: "renewal_option_available", label: "Renewal Option Available", type: "checkbox" },
      { id: "renewal_option_count", label: "Renewal Option Count", type: "number" },
      { id: "renewal_option_1_term", label: "Renewal Option 1 Term (months)", type: "number" },
      { id: "renewal_option_2_term", label: "Renewal Option 2 Term (months)", type: "number" },
      { id: "renewal_option_3_term", label: "Renewal Option 3 Term (months)", type: "number" },
      { id: "renewal_option_1_reasonably_certain", label: "Renewal Option 1 Reasonably Certain", type: "checkbox" },
      { id: "renewal_option_2_reasonably_certain", label: "Renewal Option 2 Reasonably Certain", type: "checkbox" },
      { id: "renewal_option_3_reasonably_certain", label: "Renewal Option 3 Reasonably Certain", type: "checkbox" },
      { id: "renewal_assessment_date", label: "Renewal Assessment Date", type: "date" },
      { id: "renewal_assessment_memo", label: "Renewal Assessment Memo", type: "textarea" },
    ],
  },

  // 8. Termination Options
  {
    section: "Termination Options",
    description: "Termination option details",
    fields: [
      { id: "termination_option_exists", label: "Termination Option Exists", type: "checkbox" },
      { id: "termination_option_date", label: "Termination Option Date", type: "date" },
      { id: "termination_option_reasonably_certain", label: "Termination Option Reasonably Certain", type: "checkbox" },
      { id: "termination_penalty_amount", label: "Termination Penalty Amount", type: "number" },
    ],
  },

  // 9. Purchase Options
  {
    section: "Purchase Options",
    description: "Purchase option details",
    fields: [
      { id: "purchase_option_available", label: "Purchase Option Available", type: "checkbox" },
      { id: "purchase_option_price", label: "Purchase Option Price", type: "number" },
      { id: "purchase_option_reasonably_certain", label: "Purchase Option Reasonably Certain", type: "checkbox" },
      { id: "purchase_option_assessment_memo", label: "Purchase Option Assessment Memo", type: "textarea" },
    ],
  },

  // 10. Payment Information
  {
    section: "Payment Information",
    description: "Payment terms and schedule",
    fields: [
      { id: "currency", label: "Currency", type: "select", options: [], required: true },
      { id: "functional_currency", label: "Functional Currency", type: "text" },
      { id: "payment_terms", label: "Payment Terms", type: "text" },
      { id: "payment_frequency", label: "Payment Frequency", type: "text" },
      { id: "payment_timing", label: "Payment Timing", type: "text" },
      { id: "base_rent_amount", label: "Base Rent Amount", type: "number" },
      { id: "fixed_payment_schedule_type", label: "Fixed Payment Schedule Type", type: "text" },
      { id: "step_rent_effective_date_1", label: "Step Rent Effective Date 1", type: "date" },
      { id: "step_rent_amount_1", label: "Step Rent Amount 1", type: "number" },
      { id: "step_rent_effective_date_2", label: "Step Rent Effective Date 2", type: "date" },
      { id: "step_rent_amount_2", label: "Step Rent Amount 2", type: "number" },
      { id: "step_rent_effective_date_3", label: "Step Rent Effective Date 3", type: "date" },
      { id: "step_rent_amount_3", label: "Step Rent Amount 3", type: "number" },
      { id: "payment_schedule_reference", label: "Payment Schedule Reference", type: "text" },
      { id: "prepayment_option_flag", label: "Prepayment Option Flag", type: "checkbox" },
      { id: "advance_fixed_payment_amount", label: "Advance Fixed Payment Amount", type: "number" },
      { id: "security_deposit_amount", label: "Security Deposit Amount", type: "number" },
      { id: "security_deposit_refundable", label: "Security Deposit Refundable", type: "checkbox" },
      { id: "security_deposit_applied_as_rent", label: "Security Deposit Applied as Rent", type: "checkbox" },
      { id: "rent_cap_floor_terms", label: "Rent Cap / Floor Terms", type: "text" },
    ],
  },

  // 11. Variable Payments
  {
    section: "Variable Payments",
    description: "Variable payment details",
    fields: [
      { id: "variable_payment_type", label: "Variable Payment Type", type: "text" },
      { id: "in_substance_fixed_payment", label: "In-Substance Fixed Payment", type: "checkbox" },
      { id: "reference_index_rate_name", label: "Reference Index / Rate Name", type: "text" },
      { id: "index_rate_at_commencement", label: "Index / Rate at Commencement", type: "number" },
      { id: "minimum_variable_rent_floor", label: "Minimum Variable Rent Floor", type: "number" },
      { id: "cam_amount", label: "CAM Amount", type: "number" },
    ],
  },

  // 12. Lease & Non-Lease Components
  {
    section: "Lease & Non-Lease Components",
    description: "Component separation and allocation",
    fields: [
      { id: "separate_lease_nonlease_components", label: "Separate Lease / Non-Lease Components", type: "checkbox" },
      { id: "lease_component_description", label: "Lease Component Description", type: "textarea" },
      { id: "nonlease_component_description", label: "Non-Lease Component Description", type: "textarea" },
      { id: "standalone_price_lease_component", label: "Standalone Price - Lease Component", type: "number" },
      { id: "standalone_price_nonlease_component", label: "Standalone Price - Non-Lease Component", type: "number" },
      { id: "allocation_method", label: "Allocation Method", type: "text" },
      { id: "lease_component_allocated_amount", label: "Lease Component Allocated Amount", type: "number" },
      { id: "nonlease_component_allocated_amount", label: "Non-Lease Component Allocated Amount", type: "number" },
      { id: "embedded_tax_cam_in_rent", label: "Embedded Tax / CAM in Rent", type: "checkbox" },
    ],
  },

  // 13. Lease Incentives
  {
    section: "Lease Incentives",
    description: "Incentives received from lessor",
    fields: [
      { id: "lease_incentives", label: "Lease Incentives", type: "number" },
      { id: "lease_incentive_type", label: "Lease Incentive Type", type: "text" },
      { id: "lease_incentive_receipt_date", label: "Lease Incentive Receipt Date", type: "date" },
      { id: "tenant_improvement_allowance", label: "Tenant Improvement Allowance", type: "number" },
      { id: "ti_allowance_draw_schedule_ref", label: "TI Allowance Draw Schedule Reference", type: "text" },
      { id: "lessor_paid_brokerage", label: "Lessor Paid Brokerage", type: "number" },
      { id: "other_lessor_reimbursement", label: "Other Lessor Reimbursement", type: "number" },
    ],
  },

  // 14. Initial Direct Costs
  {
    section: "Initial Direct Costs",
    description: "Costs incurred to obtain the lease",
    fields: [
      { id: "initial_direct_costs", label: "Initial Direct Costs", type: "number" },
      { id: "idc_type", label: "IDC Type", type: "text" },
      { id: "idc_incurred_date", label: "IDC Incurred Date", type: "date" },
      { id: "broker_commission_amount", label: "Broker Commission Amount", type: "number" },
      { id: "external_legal_fee_amount", label: "External Legal Fee Amount", type: "number" },
      { id: "existing_tenant_buyout_amount", label: "Existing Tenant Buyout Amount", type: "number" },
      { id: "internal_payroll_amount", label: "Internal Payroll Amount", type: "number" },
      { id: "internal_legal_admin_cost", label: "Internal Legal / Admin Cost", type: "number" },
      { id: "upfront_fees_to_lessor", label: "Upfront Fees to Lessor", type: "number" },
    ],
  },

  // 15. Prepaid Rent & Residual Value
  {
    section: "Prepaid Rent & Residual Value",
    description: "Prepayments and residual value guarantees",
    fields: [
      { id: "prepaid_rent", label: "Prepaid Rent", type: "number" },
      { id: "residual_value", label: "Residual Value", type: "number" },
      { id: "rvg_maximum", label: "RVG Maximum", type: "number" },
    ],
  },

  // 16. Discount Rate
  {
    section: "Discount Rate",
    description: "Rate used to calculate present value",
    fields: [
      { id: "discount_rate_type", label: "Discount Rate Type", type: "text" },
      { id: "rate_implicit_in_lease", label: "Rate Implicit in Lease", type: "number" },
      { id: "incremental_borrowing_rate", label: "Incremental Borrowing Rate", type: "number", required: true },
      { id: "discount_rate", label: "Discount Rate", type: "number" },
      { id: "discount_rate_determination_date", label: "Discount Rate Determination Date", type: "date" },
      { id: "discount_rate_source", label: "Discount Rate Source", type: "text" },
      { id: "fx_rate_at_commencement", label: "FX Rate at Commencement", type: "number" },
    ],
  },

  // 17. Accounting Classification
  {
    section: "Accounting Classification",
    description: "IFRS / ASC classification details",
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
        required: true,
        options: ["operating", "finance"],
      },
      { id: "classification_assessment_date", label: "Classification Assessment Date", type: "date" },
      { id: "transfer_of_ownership_date", label: "Transfer of Ownership Date", type: "date" },
      { id: "purchase_option_for_classification", label: "Purchase Option for Classification", type: "checkbox" },
      { id: "bargain_purchase_option", label: "Bargain Purchase Option", type: "checkbox" },
      { id: "underlying_asset_fair_value", label: "Underlying Asset Fair Value", type: "number" },
      { id: "pv_lease_payments_classification", label: "PV Lease Payments (Classification)", type: "number" },
      { id: "pv_rvg_included", label: "PV RVG Included", type: "checkbox" },
      { id: "pv_pct_of_fair_value", label: "PV % of Fair Value", type: "number" },
      { id: "economic_life_years", label: "Economic Life (Years)", type: "number" },
      { id: "remaining_economic_life", label: "Remaining Economic Life", type: "number" },
      { id: "lease_term_for_classification", label: "Lease Term for Classification", type: "number" },
      { id: "lease_term_pct_economic_life", label: "Lease Term % of Economic Life", type: "number" },
      { id: "major_part_economic_life", label: "Major Part of Economic Life", type: "checkbox" },
      { id: "substantially_all_fair_value", label: "Substantially All of Fair Value", type: "checkbox" },
      { id: "specialized_asset", label: "Specialized Asset", type: "checkbox" },
      { id: "no_alternative_use_to_lessor", label: "No Alternative Use to Lessor", type: "checkbox" },
      { id: "commencement_near_end_economic_life", label: "Commencement Near End of Economic Life", type: "checkbox" },
      { id: "classification_override", label: "Classification Override", type: "checkbox" },
      { id: "classification_override_reason", label: "Classification Override Reason", type: "text" },
      { id: "classification_memo", label: "Classification Memo", type: "textarea" },
    ],
  },

  // 18. Policy Elections
  {
    section: "Policy Elections",
    description: "Accounting policy elections",
    fields: [
      { id: "short_term_lease_election", label: "Short-Term Lease Election", type: "checkbox" },
      { id: "practical_expedient_package_election", label: "Practical Expedient Package Election", type: "checkbox" },
      { id: "hindsight_election", label: "Hindsight Election", type: "checkbox" },
      { id: "portfolio_election", label: "Portfolio Election", type: "checkbox" },
      { id: "materiality_flag", label: "Materiality Flag", type: "checkbox" },
      { id: "risk_free_rate_policy_by_asset_class", label: "Risk-Free Rate Policy by Asset Class", type: "checkbox" },
      { id: "component_combination_policy", label: "Component Combination Policy", type: "checkbox" },
      { id: "policy_memo_reference", label: "Policy Memo Reference", type: "text" },
    ],
  },

  // 19. Remeasurement
  {
    section: "Remeasurement",
    description: "Lease remeasurement details",
    fields: [
      { id: "remeasurement_trigger_type", label: "Remeasurement Trigger Type", type: "text" },
      { id: "remeasurement_date", label: "Remeasurement Date", type: "date" },
      { id: "remeasurement_reason_memo", label: "Remeasurement Reason Memo", type: "textarea" },
      { id: "revised_lease_term", label: "Revised Lease Term", type: "number" },
      { id: "revised_payment_schedule_ref", label: "Revised Payment Schedule Reference", type: "text" },
      { id: "revised_discount_rate_type", label: "Revised Discount Rate Type", type: "text" },
      { id: "revised_discount_rate", label: "Revised Discount Rate", type: "number" },
      { id: "revised_discount_rate_determination_date", label: "Revised Discount Rate Determination Date", type: "date" },
      { id: "lease_liability_before_remeasurement", label: "Lease Liability Before Remeasurement", type: "number" },
      { id: "lease_liability_after_remeasurement", label: "Lease Liability After Remeasurement", type: "number" },
      { id: "rou_asset_before_remeasurement", label: "ROU Asset Before Remeasurement", type: "number" },
      { id: "rou_asset_adjustment_amount", label: "ROU Asset Adjustment Amount", type: "number" },
      { id: "rou_asset_after_remeasurement", label: "ROU Asset After Remeasurement", type: "number" },
      { id: "reclassification_required", label: "Reclassification Required", type: "checkbox" },
      { id: "post_remeasurement_classification", label: "Post-Remeasurement Classification", type: "text" },
      { id: "modification_flag", label: "Modification Flag", type: "checkbox" },
    ],
  },

  // 20. Additional Notes
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
