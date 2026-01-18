import * as React from "react";
import dayjs, { Dayjs } from "dayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

interface MuiDatePickerProps {
  value?: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: boolean;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
}

const MuiDatePicker: React.FC<MuiDatePickerProps> = ({
  value,
  onChange,
  label,
  placeholder,
  required = false,
  error = false,
  disabled = false,
  minDate,
  maxDate,
}) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label}
        value={value ? dayjs(value) : null}
        onChange={(newValue: Dayjs | null) =>
          onChange(newValue ? newValue.format("YYYY-MM-DD") : "")
        }
        minDate={minDate ? dayjs(minDate) : undefined}
        maxDate={maxDate ? dayjs(maxDate) : undefined}
        disabled={disabled}
        slotProps={{
          textField: {
            fullWidth: true,
            required,
            error,
            placeholder,
            size: "small",
          },
        }}
      />
    </LocalizationProvider>
  );
};

export default MuiDatePicker;
