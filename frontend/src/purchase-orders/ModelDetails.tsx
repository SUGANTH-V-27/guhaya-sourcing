"use client";

import { useState } from "react";
import CustomSelect from "./CustomSelect";

const ModelDetails = () => {
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
            <input placeholder="Model No" />

            <CustomSelect
              label="Factory"
              options={["Factory A", "Factory B"]}
            />

            <CustomSelect
              label="Season"
              options={["Summer", "Winter"]}
            />

            <CustomSelect
              label="Intake"
              options={["Bulk", "Sample"]}
            />
          </div>

          <div className="grid4">
            <CustomSelect
              label="Product Group"
              options={["Men", "Women"]}
            />

            <CustomSelect
              label="Sub-class"
              options={["Casual", "Formal"]}
            />

            <CustomSelect
              label="Buyer"
              options={["Nike", "Adidas"]}
            />

            <CustomSelect
              label="Buyer Assistant"
              options={["Assistant 1", "Assistant 2"]}
            />
          </div>

          <div className="grid4">
            <input placeholder="Price" />
            <input placeholder="Payment Terms" />
            <input placeholder="Inco Terms" />

            <CustomSelect
              label="Shipment Type"
              options={["Air", "Sea"]}
            />
          </div>

          <div className="grid4">
            <input placeholder="PO Date" />
            <input placeholder="Order Quantity" />
            <input placeholder="Order Value" />
            <input placeholder="No of Sizes" />
          </div>

        </div>

        {/* RIGHT IMAGE */}
        <div className="model-right">
          <div className="image-box">

            {image ? (
              <img src={image} className="preview-img" />
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