import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { CREATE_LEASE_FORM_FIELDS } from "@/Utils/createLeaseFormFields";

type CreateLeaseValues = Record<string, string>;
const getInitialCreateLeaseValues = () =>
  CREATE_LEASE_FORM_FIELDS.reduce<Record<string, string>>(
    (acc, field) => {
      acc[field.id] = "";
      return acc;
    },
    {}
  );
interface CreateLeaseProps {
  handleSubmittedCreateLeaseFields: (data: CreateLeaseValues) => void

}

const CreateLease: React.FC<CreateLeaseProps> = ({
  handleSubmittedCreateLeaseFields
}) => {
const [createLeaseValues, setCreateLeaseValues] =
  React.useState<Record<string, string>>(
    getInitialCreateLeaseValues()
  );

  // Change handler
  const handleCreateLeaseInputs = (
    fieldId: string,
    value: string
  ) => {
    setCreateLeaseValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };
const validateRequiredFields = () => {
  const missingFields = CREATE_LEASE_FORM_FIELDS.filter(
    (field) =>
      field.required && !createLeaseValues[field.id]
  );

  return missingFields;
};

 const handleSubmit = () => {
  const missingFields = validateRequiredFields();

  if (missingFields.length > 0) {
    alert(
      `Please fill all mandatory fields: ${missingFields
        .map((f) => f.label)
        .join(", ")}`
    );
    return;
  }

  handleSubmittedCreateLeaseFields(createLeaseValues);
};

  const onCancel = () => {
    setCreateLeaseValues(getInitialCreateLeaseValues());
  }
const isFormValid = React.useMemo(() => {
  return CREATE_LEASE_FORM_FIELDS.every(
    (field) =>
      !field.required || createLeaseValues[field.id]?.trim()
  );
}, [createLeaseValues]);
  return (
  <>
  {CREATE_LEASE_FORM_FIELDS.map((field) => (
    <div key={field.id}>
      <label className="block text-sm font-medium mb-2">
        {field.label}
        {field.required && (
            <span className="text-red-500 ml-1 text-lg">*</span>
        )}
      </label>

      {/* TEXT */}
      {field.type === "text" && (
        <input
          type="text"
          placeholder={field.placeholder}
          value={createLeaseValues[field.id] || ""}
          onChange={(e) =>
            handleCreateLeaseInputs(field.id, e.target.value)
          }
          className="w-full px-3 py-2 border border-border rounded-md bg-background"
        />
      )}

      {/* NUMBER */}
      {field.type === "number" && (
        <input
          type="number"
          placeholder={field.placeholder}
          value={createLeaseValues[field.id] || ""}
          onChange={(e) =>
            handleCreateLeaseInputs(field.id, e.target.value)
          }
          className="w-full px-3 py-2 border border-border rounded-md bg-background"
        />
      )}

      {/* SELECT */}
      {field.type === "select" && (
        <select
          value={createLeaseValues[field.id] || ""}
          onChange={(e) =>
            handleCreateLeaseInputs(field.id, e.target.value)
          }
          className="w-full px-3 py-2 border border-border rounded-md bg-background"
        >
          <option value="">Select</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {/* DATE */}
      {field.type === "date" && (
        <Calendar
  mode="single"
  selected={
    createLeaseValues[field.id]
      ? new Date(createLeaseValues[field.id])
      : undefined
  }
  onSelect={(date) =>
    handleCreateLeaseInputs(
      field.id,
      date ? date.toLocaleDateString("en-CA") : ""
    )
  }
/>

      )}
    </div>
  ))}

  {/* ACTION BUTTONS */}
<div className="flex justify-start gap-3 pt-4 col-span-2">
  <button
    type="button"
    onClick={onCancel}
    className="px-4 py-2 border rounded-md w-32"
  >
    Cancel
  </button>

  <button
    type="button"
    onClick={handleSubmit}
     className={`px-6 py-3 rounded-lg w-64 text-lg font-medium transition-all
    ${
      isFormValid
        ? "bg-primary text-primary-foreground hover:opacity-90"
        : "bg-gradient-to-r from-blue-200 to-blue-300 text-white cursor-not-allowed opacity-70"
    }`}
  >
    Submit
  </button>
</div>

</>

  );
};

export default CreateLease;
