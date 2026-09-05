"use client";

import { PurchaseOrderDraft } from "./PurchaseOrderPage";

type QuantityTableProps = {
  draft: PurchaseOrderDraft;
  updateDraft: (updates: Partial<PurchaseOrderDraft>) => void;
};

const QuantityTable = ({ draft, updateDraft }: QuantityTableProps) => {

  return (
    <div className="section">

      <h2>Quantity Details</h2>

      <div className="table-container">
        <div className="table-row">
          <input placeholder="PO No" value={draft.poNumber} onChange={(e) => updateDraft({ poNumber: e.target.value })} />
          <input placeholder="DC Type" value={draft.dcType} onChange={(e) => updateDraft({ dcType: e.target.value })} />
          <input placeholder="DC Port" value={draft.dcPort} onChange={(e) => updateDraft({ dcPort: e.target.value })} />
          <input placeholder="Size1" value={draft.size1} onChange={(e) => updateDraft({ size1: e.target.value })} />
          <input placeholder="Size2" value={draft.size2} onChange={(e) => updateDraft({ size2: e.target.value })} />
          <input placeholder="Total Qty" type="number" value={draft.totalQty} onChange={(e) => updateDraft({ totalQty: e.target.value })} />
          <input placeholder="HOD" value={draft.hod} onChange={(e) => updateDraft({ hod: e.target.value })} />
          <input placeholder="Sailing" value={draft.sailing} onChange={(e) => updateDraft({ sailing: e.target.value })} />
        </div>

      </div>

    </div>
  );
};

export default QuantityTable;