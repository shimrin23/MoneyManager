import React from 'react';
import { DatePicker } from './DatePicker';

// Drop-in replacement for <input type="date">: same value/min/max/required props, and onChange still gets an event-like object with target.value
interface DateInputProps {
  value: string;
  onChange: (e: { target: { value: string } }) => void;
  min?: string;
  max?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
}

// className goes on the real input so the field's own styling replaces the picker's default box
export const DateInput: React.FC<DateInputProps> = ({ value, onChange, min, max, required, disabled, className, id }) => (
  <DatePicker
    id={id}
    value={value}
    onChange={(date) => onChange({ target: { value: date } })}
    minDate={min}
    maxDate={max}
    required={required}
    disabled={disabled}
    inputClassName={className}
  />
);
