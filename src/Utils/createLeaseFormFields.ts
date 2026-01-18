export type CreateLeaseField = {
  id: string;
  label: string;
  type: "text" | "select" | "date" | "number";
  required: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
};

export const CREATE_LEASE_FORM_FIELDS: CreateLeaseField[] = [
  {
    id: "lease_name",
    label: "Lease Name",
    type: "text",
    required: true,
    placeholder: "Enter lease name",
  },
  {
    id: "lessor_name",
    label: "Lessor Name",
    type: "text",
    required: true,
    placeholder: "Enter lessor name",
  },
  {
    id: "lessee_name",
    label: "Lessee Name",
    type: "text",
    required: true,
    placeholder: "Enter lessee name",
  },
  {
    id: "contract_type",
    label: "Contract Type",
    type: "text",
     required: false,
    placeholder: "Enter contract type",
  },
  {
    id: "status",
    label: "Status",
    type: "select",
     required: false,
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
    ],
  },
  {
    id: "document_id",
    label: "Document ID",
    type: "text",
     required: false,
    placeholder: "Enter document reference",
  },
  {
    id: "commencement_date",
    label: "Commencement Date",
    type: "date",
     required: true,
  },
  {
    id: "end_date",
    label: "End Date",
    type: "date",
     required: true,
  },
  {
    id: "payment_terms",
    label: "Payment Terms",
    type: "text",
     required: false,
    placeholder: "Enter payment terms",
  },
  {
    id: "initial_direct_costs",
    label: "Initial Direct Costs",
    type: "number",
     required: false,
    placeholder: "0",
  },
  {
    id: "prepaid_rent",
    label: "Prepaid Rent",
    type: "number",
     required: false,
    placeholder: "0",
  },
  {
    id: "lease_incentives",
    label: "Lease Incentives",
    type: "number",
     required: false,
    placeholder: "0",
  },
  {
    id: "residual_value",
    label: "Residual Value",
    type: "number",
     required: false,
    placeholder: "0",
  },
  {
    id: "incremental_borrowing_rate",
    label: "Incremental Borrowing Rate",
    type: "number",
     required: true,
    placeholder: "0",
  },
  {
    id: "discount_rate",
    label: "Discount Rate",
    type: "number",
     required: false,
    placeholder: "0",
  },
  {
    id: "classification",
    label: "Classification",
    type: "select",
     required: false,
    options: [
      { label: "Operating", value: "operating" },
      { label: "Finance", value: "finance" },
    ],
  },
];
