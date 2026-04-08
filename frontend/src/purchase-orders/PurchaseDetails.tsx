"use client";

import { useState } from "react";

const PurchaseDetails = () => {
  const [rows, setRows] = useState([{ }]);

  const addRow = () => setRows([...rows, {}]);

  const deleteRow = (index: number) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  return (
    <div className="section">

      <h2>Purchase Order Details</h2>

      <button className="btn" onClick={addRow}>
        + ADD ORDER
      </button>

      {rows.map((_, index) => (
        <div key={index} className="row">

          <input placeholder="Received Date" />
          <input placeholder="Purchase Order" />
          <input placeholder="Comments" />

          <button className="delete-btn" onClick={() => deleteRow(index)}>
            🗑
          </button>

        </div>
      ))}

    </div>
  );
};

export default PurchaseDetails;