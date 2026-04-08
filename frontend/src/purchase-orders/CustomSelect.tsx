"use client";

import { useState } from "react";

const CustomSelect = ({ label, options }: any) => {
  const [value, setValue] = useState("");
  const [customValue, setCustomValue] = useState("");

  return (
    <div>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
      >
        <option value="">{label}</option>

        {options.map((opt: string, i: number) => (
          <option key={i} value={opt}>
            {opt}
          </option>
        ))}

        <option value="other">Other</option>
      </select>

      {value === "other" && (
        <input
          placeholder={`Enter ${label}`}
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          style={{ marginTop: "6px" }}
        />
      )}
    </div>
  );
};

export default CustomSelect;