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
import { createLeaseFormFields } from "@/Utils/createLeaseFormFields";
import type { FieldConfig } from "@/Utils/createLeaseFormFields";

export interface LeaseFormData {
  [key: string]: string | boolean | number | null;
}
interface LeaseFormProps {
  existingLease?: LeaseFormData | null;
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

  useEffect(() => {
    if (existingLease) {
      setFormData((prev) => ({ ...prev, ...existingLease }));
    }
  }, [existingLease]);

  console.log("existing lease data in form", existingLease);
const isFormValid = React.useMemo(() => {
  return createLeaseFormFields.every((section) =>
    section.fields.every((field) => {
      if (!field.required) return true;
      return !!formData[field.id]?.toString().trim();
    })
  );
}, [formData]);

const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);    
  };

  const renderField = (field: FieldConfig) => {
    const commonProps = {
      value: formData[field.id] || "",
      onChange: (e: any) => handleChange(field.id, e.target.value),
    };

    switch (field.type) {
      case "textarea":
        return (
          <Textarea {...commonProps} />
        );

      case "select":
        return (
          <Select
            value={formData[field.id] || ""}
            onValueChange={(v) => handleChange(field.id, v)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {createLeaseFormFields.map((section) => (
        <Card key={section.section}>
          <CardHeader>
            <CardTitle>{section.section}</CardTitle>
            {section.description && (
              <CardDescription>{section.description}</CardDescription>
            )}
          </CardHeader>

          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.fields.map((field) => (
              <div
                key={field.id}
                className={`space-y-2 ${field.type === "textarea" ? "md:col-span-2" : ""
                  }`}
              >
                {field.type === "checkbox" ? (
                  <label className="flex items-center space-x-2">
                    <Checkbox
                      checked={!!formData[field.id]}
                      onCheckedChange={(v) => handleChange(field.id, v)}
                    />
                    <span>
                      {field.label}
                      {field.required && (
                         <span className="text-red-500 text-lg ml-0.5">*</span>
                      )}
                    </span>
                  </label>
                ) : (
                  <>
                    <Label>
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {renderField(field)}
                  </>
                )}
              </div>
            ))}
          </CardContent>

        </Card>
      ))}


      <div className="flex justify-end gap-4">
        <Button type="button"  variant="outline">Cancel</Button>
        <Button type="submit" disabled={!isFormValid}>Save Lease</Button>
      </div>
    </form>
  );
}
