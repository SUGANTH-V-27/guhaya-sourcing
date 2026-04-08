"use client";

import PurchaseDetails from "./PurchaseDetails";
import ModelDetails from "./ModelDetails";
import QuantityTable from "./QuantityTable";
import "./purchase.css";

const PurchaseOrderPage = () => {
  return (
    <div className="po-container">

      <div className="po-header">
        <h1>Guhaya Sourcing</h1>
        <span>merch1@mrsgarments.com</span>
      </div>

      <PurchaseDetails />
      <ModelDetails />
      <QuantityTable />

    </div>
  );
};

export default PurchaseOrderPage;