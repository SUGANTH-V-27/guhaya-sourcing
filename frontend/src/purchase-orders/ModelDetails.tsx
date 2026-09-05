"use client";

import { useState } from "react";
import Image from "next/image";
import CustomSelect from "./CustomSelect";
import { PurchaseOrderDraft } from "./PurchaseOrderPage";

type ModelDetailsProps = {
  draft: PurchaseOrderDraft;
  updateDraft: (updates: Partial<PurchaseOrderDraft>) => void;
};

const ModelDetails = ({ draft, updateDraft }: ModelDetailsProps) => {
  const [image, setImage] = useState<string | null>(null);

  const handleImage = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="section">

      <h2>Model Details</h2>

      <div className="model-container">

        {/* LEFT SIDE */}
        <div className="model-left">

          <div className="grid4">
            <input placeholder="Model No" value={draft.modelId} onChange={(e) => updateDraft({ modelId: e.target.value })} />

            <CustomSelect
              label="Factory"
              options={["Factory A", "Factory B"]}
              value={draft.factoryId}
              onChange={(value) => updateDraft({ factoryId: value })}
            />

            <CustomSelect
              label="Season"
              options={["Summer", "Winter"]}
              value={draft.season}
              onChange={(value) => updateDraft({ season: value })}
            />

            <CustomSelect
              label="Intake"
              options={["Bulk", "Sample"]}
              value={draft.intake}
              onChange={(value) => updateDraft({ intake: value })}
            />
          </div>

          <div className="grid4">
            <CustomSelect
              label="Product Group"
              options={["Men", "Women"]}
              value={draft.department}
              onChange={(value) => updateDraft({ department: value })}
            />

            <CustomSelect
              label="Sub-class"
              options={["Casual", "Formal"]}
              value={draft.subclass}
              onChange={(value) => updateDraft({ subclass: value })}
            />

            <CustomSelect
              label="Buyer"
              options={["Nike", "Adidas"]}
              value={draft.buyer}
              onChange={(value) => updateDraft({ buyer: value })}
            />

            <CustomSelect
              label="Buyer Assistant"
              options={["Assistant 1", "Assistant 2"]}
              value={draft.buyerAssistant}
              onChange={(value) => updateDraft({ buyerAssistant: value })}
            />
          </div>

          <div className="grid4">
            <input placeholder="Price" value={draft.unitPrice} onChange={(e) => updateDraft({ unitPrice: e.target.value })} />
            <input placeholder="Payment Terms" value={draft.paymentTerms} onChange={(e) => updateDraft({ paymentTerms: e.target.value })} />
            <input placeholder="Inco Terms" value={draft.incoTerms} onChange={(e) => updateDraft({ incoTerms: e.target.value })} />

            <CustomSelect
              label="Shipment Type"
              options={["Air", "Sea"]}
              value={draft.shipmentMode}
              onChange={(value) => updateDraft({ shipmentMode: value })}
            />
          </div>

          <div className="grid4">
            <input placeholder="PO Date" type="date" value={draft.orderDate} onChange={(e) => updateDraft({ orderDate: e.target.value })} />
            <input placeholder="Order Quantity" type="number" value={draft.totalQty} onChange={(e) => updateDraft({ totalQty: e.target.value })} />
            <input placeholder="Order Value" type="number" value={draft.totalAmount} onChange={(e) => updateDraft({ totalAmount: e.target.value })} />
            <input placeholder="No of Sizes" value={draft.noOfSizes} onChange={(e) => updateDraft({ noOfSizes: e.target.value })} />
          </div>

        </div>

        {/* RIGHT IMAGE */}
        <div className="model-right">
          <div className="image-box">

            {image ? (
              <Image
                src={image}
                alt="Uploaded model preview"
                fill
                unoptimized
                className="preview-img object-contain"
                sizes="(max-width: 768px) 100vw, 420px"
              />
            ) : (
              <p>Upload Image</p>
            )}

            <input type="file" onChange={handleImage} />

          </div>
        </div>

      </div>

    </div>
  );
};

export default ModelDetails;