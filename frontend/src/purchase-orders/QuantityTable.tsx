"use client";

import { useState } from "react";

const QuantityTable = () => {
  const [rows, setRows] = useState([{}]);

  const addRow = () => setRows([...rows, {}]);

  const deleteRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  return (
    <div className="section">

      <h2>Quantity Details</h2>

      <button className="btn" onClick={addRow}>
        + ADD ORDER
      </button>

      <div className="table-container">

        {rows.map((_, index) => (
          <div key={index} className="table-row">

            <input placeholder="PO No" />
            <input placeholder="DC Type" />
            <input placeholder="DC Port" />
            <input placeholder="Size1" />
            <input placeholder="Size2" />
            <input placeholder="Total Qty" />
            <input placeholder="HOD" />
            <input placeholder="Sailing" />

            <button className="delete-btn" onClick={() => deleteRow(index)}>
              🗑
            </button>

          </div>
        ))}

      </div>

    </div>
  );
};

export default QuantityTable;