export type CreateLeaseField = {
  id: string;
  label: string;
  type: "text" | "number" | "select" | "date" | "datetime";
  placeholder?: string;
  options?: { label: string; value: string }[];
};

export const CREATE_LEASE_FORM_FIELDS: CreateLeaseField[] = [
  {
    id: "lease_name",
    label: "Lease Name",
    type: "text",
    placeholder: "Enter lease name",
  },
  {
    id: "lessor_name",
    label: "Lessor Name",
    type: "text",
    placeholder: "Enter lessor name",
  },
  {
    id: "lessee_name",
    label: "Lessee Name",
    type: "text",
    placeholder: "Enter lessee name",
  },
  {
    id: "contract_type",
    label: "Contract Type",
    type: "text",
    placeholder: "Enter contract type",
  },
  {
    id: "status",
    label: "Status",
    type: "select",
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
      { label: "Terminated", value: "terminated" },
    ],
  },
  {
    id: "document_id",
    label: "Document ID",
    type: "text",
    placeholder: "Enter document ID",
  },
  {
    id: "commencement_date",
    label: "Commencement Date",
    type: "date",
  },
  {
    id: "lease_term_months",
    label: "Lease Term (Months)",
    type: "number",
    placeholder: "e.g. 36",
  },
  {
    id: "next_payment",
    label: "Next Payment Date & Time",
    type: "datetime",
  },
  {
    id: "periodic_payment",
    label: "Periodic Payment Amount",
    type: "number",
    placeholder: "Enter amount",
  },
  {
    id: "payment_frequency",
    label: "Payment Frequency",
    type: "select",
    options: [
      { label: "Monthly", value: "monthly" },
      { label: "Quarterly", value: "quarterly" },
      { label: "Annually", value: "annually" },
    ],
  },
  {
    id: "payment_terms",
    label: "Payment Terms",
    type: "text",
    placeholder: "Enter payment terms",
  },
  {
    id: "initial_direct_costs",
    label: "Initial Direct Costs",
    type: "number",
  },
  {
    id: "prepaid_rent",
    label: "Prepaid Rent",
    type: "number",
  },
  {
    id: "lease_incentives",
    label: "Lease Incentives",
    type: "number",
  },
  {
    id: "residual_value",
    label: "Residual Value",
    type: "number",
  },
  {
    id: "incremental_borrowing_rate",
    label: "Incremental Borrowing Rate (%)",
    type: "number",
  },
  {
    id: "discount_rate",
    label: "Discount Rate (%)",
    type: "number",
  },
  {
    id: "classification",
    label: "Lease Classification",
    type: "select",
    options: [
      { label: "Operating", value: "operating" },
      { label: "Finance", value: "finance" },
    ],
  },
];

