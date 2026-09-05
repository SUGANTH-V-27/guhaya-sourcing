"use client";

type CustomSelectProps = {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
};

const CustomSelect = ({ label, options, value, onChange }: CustomSelectProps) => {
  const isCustomValue = value !== "" && !options.includes(value);

  return (
    <div>
      <select
        value={isCustomValue ? "other" : value}
        onChange={(e) => onChange(e.target.value === "other" ? "" : e.target.value)}
      >
        <option value="">{label}</option>

        {options.map((opt: string, i: number) => (
          <option key={i} value={opt}>
            {opt}
          </option>
        ))}

        <option value="other">Other</option>
      </select>

      {isCustomValue && (
        <input
          placeholder={`Enter ${label}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ marginTop: "6px" }}
        />
      )}
    </div>
  );
};

export default CustomSelect;