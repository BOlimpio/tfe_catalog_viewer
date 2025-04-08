import React from 'react';
import { X } from 'lucide-react';

interface MultiSelectProps {
  label: string;
  values: string[];
  options: { value: string; label: string }[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
}

export function MultiSelect({ label, values, options, onChange, disabled = false }: MultiSelectProps) {
  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (!values.includes(value)) {
      onChange([...values, value]);
    }
  };

  const removeValue = (valueToRemove: string) => {
    onChange(values.filter(v => v !== valueToRemove));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      <div className="flex flex-wrap gap-2 mb-2">
        {values.map(value => (
          <span
            key={value}
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
          >
            {value}
            <button
              type="button"
              onClick={() => removeValue(value)}
              className="ml-1 text-green-600 hover:text-green-800"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>

      <select
        value=""
        onChange={handleSelect}
        disabled={disabled}
        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md bg-white disabled:bg-gray-100"
      >
        <option value="">Add {label}</option>
        {options
          .filter(option => !values.includes(option.value))
          .map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
      </select>
    </div>
  );
}