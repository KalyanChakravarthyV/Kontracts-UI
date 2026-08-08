import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/lease-dashboard/ui/card";
import { Input } from "@/components/lease-dashboard/ui/input";
import { Label } from "@/components/lease-dashboard/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/lease-dashboard/ui/select";
import { Textarea } from "@/components/lease-dashboard/ui/textarea";
import { Button } from "@/components/lease-dashboard/ui/button";
import { Checkbox } from "@/components/lease-dashboard/ui/checkbox";
import AppAlert from "@/components/common/AppAlert";
import { createLeaseFormFields } from "@/Utils/createLeaseFormFields";
import type { FieldConfig } from "@/Utils/createLeaseFormFields";
import type { LeaseFormData, LeaseData } from "@/types/lease";
import { useAuthToken } from "@/hooks/use-auth-token";
import { API_BASE_URL } from "@/config/api";

interface LeaseFormProps {
  existingLease?: LeaseFormData | LeaseData | null;
  onSubmit?: (data: LeaseFormData) => void;
}

const getInitialLeaseFormData = (): LeaseFormData => {
  const initialData: LeaseFormData = {};

  createLeaseFormFields.forEach((section) => {
    section.fields.forEach((field) => {
      switch (field.type) {
        case "checkbox":
          initialData[field.id] = false;
          break;

        case "number":
          initialData[field.id] = 0;
          break;

        case "date":
          initialData[field.id] = "";
          break;

        default:
          initialData[field.id] = "";
      }
    });
  });

  return initialData;
};

export function LeaseForm({ existingLease, onSubmit }: LeaseFormProps) {
  const [formData, setFormData] = useState<LeaseFormData>(
    getInitialLeaseFormData()
  );
  const [currencies, setCurrencies] = useState<Array<{ code: string; name: string }>>([]);
  const [currenciesLoaded, setCurrenciesLoaded] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [errorFieldIds, setErrorFieldIds] = useState<Set<string>>(new Set());
  const { getHeaders } = useAuthToken();

  // Fetch currencies from API first - runs only once on mount
  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/currencies/`, {
          headers: await getHeaders(),
        });
        const data = await response.json();
        // Filter only active currencies
        const activeCurrencies = data.filter((curr: any) => curr.is_active);
        setCurrencies(activeCurrencies);
        setCurrenciesLoaded(true);
      } catch (error) {
        console.error("Failed to fetch currencies:", error);
        // Set default currencies as fallback
        setCurrencies([
          { code: "USD", name: "US Dollar" },
          { code: "EUR", name: "Euro" },
          { code: "GBP", name: "British Pound" },
          { code: "JPY", name: "Japanese Yen" },
          { code: "AUD", name: "Australian Dollar" },
          { code: "CAD", name: "Canadian Dollar" },
        ]);
        setCurrenciesLoaded(true);
      }
    };

    fetchCurrencies();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Populate form data immediately when existingLease is available
  useEffect(() => {
    if (existingLease) {
      setFormData((prev) => ({ ...prev, ...existingLease }));
    }
  }, [existingLease]);

const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): { isValid: boolean; errors: string[]; errorIds: string[] } => {
    const errors: string[] = [];
    const errorIds: string[] = [];

    // Check all required fields
    createLeaseFormFields.forEach((section) => {
      section.fields.forEach((field) => {
        if (field.required) {
          const value = formData[field.id];
          if (!value || (typeof value === 'string' && !value.trim())) {
            errors.push(field.label);
            errorIds.push(field.id);
          }
        }
      });
    });

    // Date validation: end_date should be after commencement_date
    const commencementDate = formData.commencement_date;
    const endDate = formData.end_date;
    
    if (commencementDate && endDate && typeof commencementDate === 'string' && typeof endDate === 'string') {
      const commencementDateObj = new Date(commencementDate);
      const endDateObj = new Date(endDate);
      
      if (endDateObj <= commencementDateObj) {
        errors.push('Lease End Date must be after Commencement Date');
      }
    }

    return { isValid: errors.length === 0, errors, errorIds };
  };

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    const validation = validateForm();
    
    if (!validation.isValid) {
      // Show validation errors in alert component
      setValidationErrors(validation.errors);
      setErrorFieldIds(new Set(validation.errorIds));
      return;
    }
    
    // Clear any previous validation errors
    setValidationErrors([]);
    setErrorFieldIds(new Set());
    
    // Convert empty date strings to null for API compatibility
    const dateFieldIds = new Set<string>();
    createLeaseFormFields.forEach((section) => {
      section.fields.forEach((field) => {
        if (field.type === 'date') {
          dateFieldIds.add(field.id);
        }
      });
    });
    
    const processedFormData = { ...formData };
    Object.keys(processedFormData).forEach((key) => {
      if (dateFieldIds.has(key) && processedFormData[key] === '') {
        processedFormData[key] = null;
      }
    });
    
    onSubmit?.(processedFormData);    
  };

  const renderField = (field: FieldConfig) => {
    const fieldValue = formData[field.id];
    const hasError = errorFieldIds.has(field.id);
    
    // For text inputs, ensure we only pass string/number values
    const getInputValue = () => {
      if (typeof fieldValue === 'boolean') return '';
      return fieldValue?.toString() || '';
    };

    const errorClassName = hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '';

    const commonProps = {
      value: getInputValue(),
      onChange: (e: any) => handleChange(field.id, e.target.value),
      className: errorClassName,
    };

    switch (field.type) {
      case "textarea":
        return (
          <Textarea {...commonProps} className={errorClassName} />
        );

      case "select":
        // Handle currency field separately with code/name structure
        if (field.id === 'currency') {
          return (
            <Select
              value={formData[field.id]?.toString() || ""}
              onValueChange={(v) => handleChange(field.id, v)}
            >
              <SelectTrigger className={errorClassName}>
                <SelectValue placeholder={`Select ${field.label}`} />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] overflow-y-auto">
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }
        
        // For other select fields, use static options
        return (
          <Select
            value={formData[field.id]?.toString() || ""}
            onValueChange={(v) => handleChange(field.id, v)}
          >
            <SelectTrigger className={errorClassName}>
              <SelectValue placeholder={`Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent className="max-h-[700px] overflow-y-auto">
              {field.options?.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "checkbox":
        return (

          <Checkbox
            checked={!!formData[field.id]}
            onCheckedChange={(v) => handleChange(field.id, v)}
          />
        );

      default:
        // text, number, email, phone, date
        return (
          <Input
            type={field.type}
            {...commonProps}
          />
        );
    }
  };

  const getValidationMessage = () => {
    if (validationErrors.length === 0) return '';
    
    return (
      <div>
        <div className="font-semibold mb-2">Please fill the following mandatory fields:</div>
        <ol className="list-decimal list-inside space-y-1">
          {validationErrors.map((error, index) => (
            <li key={index}>{error}</li>
          ))}
        </ol>
      </div>
    );
  };

  return (
    <>
    <AppAlert 
      message={getValidationMessage()}
      severity='error'
      onClose={() => setValidationErrors([])}
    />
    <form onSubmit={handleSubmit} className="space-y-6">

      {createLeaseFormFields.map((section) => (
        <Card key={section.section}>
          <CardHeader>
            <CardTitle>{section.section}</CardTitle>
            {section.description && (
              <CardDescription>{section.description}</CardDescription>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Non-checkbox fields in grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {section.fields.filter(f => f.type !== "checkbox").map((field) => (
                <div
                  key={field.id}
                  className={`space-y-2 ${field.type === "textarea" ? "md:col-span-2" : ""}`}
                >
                  <Label className="text-sm font-medium text-gray-700">
                    {field.label}
                    {field.required && <span className="text-red-500 text-lg font-bold ml-1">*</span>}
                  </Label>
                  {renderField(field)}
                </div>
              ))}
            </div>
            
            {/* Checkbox fields grouped together */}
            {section.fields.filter(f => f.type === "checkbox").length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {section.fields.filter(f => f.type === "checkbox").map((field) => (
                  <label 
                    key={field.id}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <Checkbox
                      checked={!!formData[field.id]}
                      onCheckedChange={(v) => handleChange(field.id, v)}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {field.label}
                      {field.required && (
                        <span className="text-red-500 text-lg ml-0.5">*</span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </CardContent>

        </Card>
      ))}


      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline">Cancel</Button>
        <Button type="submit">Save Lease</Button>
      </div>
    </form>
    </>
  );
}
