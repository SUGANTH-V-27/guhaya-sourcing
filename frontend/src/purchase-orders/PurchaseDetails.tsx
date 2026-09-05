"use client";

import { PurchaseOrderDraft } from "./PurchaseOrderPage";

type PurchaseDetailsProps = {
  draft: PurchaseOrderDraft;
  updateDraft: (updates: Partial<PurchaseOrderDraft>) => void;
};

const PurchaseDetails = ({ draft, updateDraft }: PurchaseDetailsProps) => {

  return (
    <div className="section">

      <h2>Purchase Order Details</h2>

      <div className="row">
        <input type="date" value={draft.orderDate} onChange={(e) => updateDraft({ orderDate: e.target.value })} />
        <input placeholder="Purchase Order" value={draft.poNumber} onChange={(e) => updateDraft({ poNumber: e.target.value })} />
        <input placeholder="Comments" value={draft.specialInstructions} onChange={(e) => updateDraft({ specialInstructions: e.target.value })} />
      </div>

    </div>
  );
};

export default PurchaseDetails;