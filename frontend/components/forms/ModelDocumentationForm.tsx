"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";

/* ───────── TYPES ───────── */
type TechPackEntry = {
  techPackName: string;
  receivedDate: string;
  remarks: string;
  commentsFile: File | null;
};

type ModelDoc = {
  modelId: string;
  techPacks: TechPackEntry[];
  sample: string;
  submission: string;
  sentDate: string;
  commentsDate: string;
  commentsFile: File | null;
  commentsRemarks: string;
  designer: string;
  graphic: string;
  technologist: string;
  image: File | null; 
};

const emptyTechPack = (): TechPackEntry => ({
  techPackName: "",
  receivedDate: "",
  remarks: "",
  commentsFile: null,
});

/* ───────── DESIGN SYSTEM ───────── */
const baseInput =
  "w-full min-w-0 h-8 bg-[#1a1a1a] border border-[#00BFA5]/60 px-2 text-xs rounded focus:outline-none focus:ring-1 focus:ring-[#00BFA5]/60 text-white [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-70";
const baseTextarea =
  "w-full bg-[#1a1a1a] border border-[#00BFA5]/60 px-2 py-2 text-xs rounded focus:outline-none focus:ring-1 focus:ring-[#00BFA5]/60 text-white";

const primaryBtn =
  "bg-[#17b3a3] text-black px-4 py-2 rounded text-sm hover:bg-[#13a394] transition";

const outlineBtn =
  "border border-[#00BFA5]/60 text-white px-4 py-2 rounded text-sm hover:bg-[#00BFA5]/10 transition";

const dangerBtn = "text-gray-400 hover:text-red-400 text-xs";

const commentGrid =
  "grid grid-cols-[1fr_1fr_1fr_1fr_1.5fr_1fr_1fr_0.7fr] gap-4";

const techPackGrid =
  "grid grid-cols-[2fr_1fr_1fr_2fr_auto] gap-4 items-start justify-items-start";

/* ───────── FILE BUTTON ───────── */
const AddFileButton = ({
  inputId,
  onChange,
}: {
  inputId: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) => (
  <>
    <label
      htmlFor={inputId}
      className="cursor-pointer inline-flex items-center gap-1 rounded border border-[#00BFA5]/60 px-3 py-1 text-xs text-white hover:bg-[#00BFA5]/10 transition"
    >
      ADD
    </label>
    <input id={inputId} type="file" onChange={onChange} className="hidden" />
  </>
);

/* ───────── FILE OPS ───────── */
const FileOps = ({ file, onDownload, onEdit, onDelete }: any) => (
  <div className="flex items-center gap-2 flex-wrap text-xs">
    {file ? (
      <>
        <span className="text-gray-300 truncate max-w-[120px]">
          {file.name}
        </span>
        <button onClick={onDownload}>📥</button>
        <button onClick={onEdit}>✏️</button>
        <button onClick={onDelete} className={dangerBtn}>
          ✕
        </button>
      </>
    ) : (
      <span className="text-gray-500">No file</span>
    )}
  </div>
);

/* ═══════════════════════════════════════ */
/*               MAIN UI                  */
/* ═══════════════════════════════════════ */

export default function ModelDocumentationForm() {
  const [data, setData] = useState<ModelDoc>({
    modelId: "006GS",
    techPacks: [emptyTechPack()],
    sample: "",
    submission: "",
    sentDate: "",
    commentsDate: "",
    commentsFile: null,
    commentsRemarks: "",
    designer: "",
    graphic: "",
    technologist: "",
    image: null, 
  });

  /* ───────── HELPERS ───────── */
  const updateTechPack = (i: number, patch: Partial<TechPackEntry>) => {
    const updated = [...data.techPacks];
    updated[i] = { ...updated[i], ...patch };
    setData({ ...data, techPacks: updated });
  };

  const handleFile = (i: number) => (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    updateTechPack(i, { commentsFile: file });
    e.target.value = "";
  };

  const handleImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setData((prev) => ({ ...prev, image: file }));
  };

  const addRow = () =>
    setData({ ...data, techPacks: [...data.techPacks, emptyTechPack()] });

  const removeRow = (i: number) =>
    setData({
      ...data,
      techPacks: data.techPacks.filter((_, idx) => idx !== i),
    });

  const downloadFile = (file: File | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log(data);
    alert("Saved!");
  };

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">
      <form className="min-h-screen bg-[#0f0f0f] text-white max-w-7xl mx-auto p-8">
        
        <div className="bg-[#00BFA5] px-8 py-3 flex justify-between items-center shrink-0">
          <h1 className="text-white text-lg font-semibold">
            Guhaya Sourcing
          </h1>

          <div className="flex items-center gap-3 text-white text-sm">
            merch1@mrsgarments.com
            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
              <span className="text-[#00BFA5] text-xs font-bold">M</span>
            </div>
          </div>
        </div>

        {/* ───── MAIN GRID ───── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* ───── LEFT SECTION ───── */}
          <section className="lg:col-span-3 bg-[#121212] border border-[#00BFA5]/20 rounded-lg p-6">
            <h2 className="text-gray-300 mb-4">Model Documentation</h2>

            
                  <div className={`${techPackGrid} text-gray-400 text-xs text-left mb-2 `}>
                    <span>Tech Pack</span>
                    <span>Date</span>
                    <span>Remarks</span>
                    <span>File</span>
                    <span></span>
                  </div>

                  {data.techPacks.map((tp, i) => (
                    <div key={i} className={`${techPackGrid} text left items-start mb-3`}>
                      
                      <input
                        className={`${baseInput} text-left`}
                        value={tp.techPackName}
                        onChange={(e) => updateTechPack(i, { techPackName: e.target.value })}
                      />

                      <input
                        type="date"
                        className={`${baseInput} text-left`}
                        value={tp.receivedDate}
                        onChange={(e) => updateTechPack(i, { receivedDate: e.target.value })}
                      />

                      <input
                        className={`${baseInput} text-left`}
                        value={tp.remarks}
                        onChange={(e) => updateTechPack(i, { remarks: e.target.value })}
                      />

                      <div className="w-full min-w-0 overflow-hidden">
                        <div className="space-y-1 truncate">
                          <FileOps
                            file={tp.commentsFile}
                            onDownload={() => downloadFile(tp.commentsFile)}
                            onEdit={() => {}}
                            onDelete={() => updateTechPack(i, { commentsFile: null })}
                          />
                          <AddFileButton inputId={`f-${i}`} onChange={handleFile(i)} />
                        </div>
                      </div>

                      <button type="button" onClick={() => removeRow(i)} className={`${outlineBtn} whitespace-nowrap shrink-0`}>
                        Delete
                      </button>
                    </div>
                  ))}
                   

                  <button type="button" onClick={addRow} className={primaryBtn}>
                    + Add Tech Pack
                  </button>
            </section>


                {/* ───── RIGHT MODEL CARD ───── */}
                <aside className="bg-[#121212] border border-[#00BFA5]/20 rounded-lg p-5 flex flex-col gap-4">
                  
                  <div>
                    <h3 className="text-white text-sm font-semibold">{data.modelId}</h3>
                    <p className="text-xs text-gray-400 mt-1">25 Days to handover</p>
                  </div>

                  <label className="w-full h-48 bg-[#1a1a1a] border border-[#00BFA5]/60 rounded-lg flex items-center justify-center cursor-pointer hover:border-[#00BFA5] transition overflow-hidden">
                    
                    {data.image ? (
                      <img
                        src={URL.createObjectURL(data.image)}
                        alt="Model"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400 text-xs">Upload Image</span>
                    )}

                    <input type="file" className="hidden" onChange={handleImage} />
                  </label>

                </aside>
              </div>  
            


              {/* MODEL COMMENTS */}
        <section className="bg-[#121212] border border-[#00BFA5]/20 rounded-lg p-6 space-y-4">
          <h2 className="text-gray-300">Model Comments</h2>

          {/* HEADER */}
          <div className= {`${commentGrid} text-gray-400 text-xs text-left`}>
            <span>Sample</span>
            <span>Submission</span>
            <span>Sent Date</span>
            <span>Comments Date</span>
            <span>File</span>
            <span>Designer</span>
            <span>Graphic</span>
            <span>Technologist</span>
            <span></span>
          </div>

          {/* SINGLE ROW */}
          <div className={`${commentGrid} items-start`}>

            {/* Sample */}
            <input
              name="sample"
              value={data.sample}
              onChange={handleChange}
              className={`${baseInput} text-left`}
              placeholder="Sample"
            />

            {/* Submission */}
            <input
              name="submission"
              value={data.submission}
              onChange={handleChange}
              className={`${baseInput} text-left`}
              placeholder="Submission"
            />

            {/* Sent Date */}
            <input
              type="date"
              name="sentDate"
              value={data.sentDate}
              onChange={handleChange}
              className={`${baseInput} text-left`}
            />

            {/* Comments Date */}
            <input
              type="date"
              name="commentsDate"
              value={data.commentsDate}
              onChange={handleChange}
              className={`${baseInput} text-left`}
            />

            {/* FILE */}
            <div className="w-full max-w-full overflow-hidden">
              <div className="space-y-1">
              <FileOps
                file={data.commentsFile}
                onDownload={() => downloadFile(data.commentsFile)}
                onEdit={() => {}}
                onDelete={() =>
                  setData((prev) => ({ ...prev, commentsFile: null }))
                }
              />
              <AddFileButton
                inputId="comments-file"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setData((prev) => ({ ...prev, commentsFile: file }));
                }}
              />
              </div>
            </div>
            
            {/* DESIGNER */}
            <select
              name="designer"
              value={data.designer}
              onChange={handleChange}
              className={baseInput}
            >
              <option>APPROVED</option>
              <option>CONDITIONALLY APPROVED</option>
              <option>REJECTED</option>
              <option>PENDING</option>
            </select>

            {/* GRAPHIC */}
            <select
              name="graphic"
              value={data.graphic}
              onChange={handleChange}
              className={baseInput}
            >
              <option value="">Graphic</option>
              <option>Graphic A</option>
              <option>Graphic B</option>
            </select>

            {/* TECHNOLOGIST */}
            <select
              name="technologist"
              value={data.technologist}
              onChange={handleChange}
              className={baseInput}
            >
              <option value="">Technologist</option>
              <option>Tech A</option>
              <option>Tech B</option>
            </select>

            {/* DELETE BUTTON */}
            <button
              type="button"
              onClick={() =>
                setData((prev) => ({
                  ...prev,
                  sample: "",
                  submission: "",
                  sentDate: "",
                  commentsDate: "",
                  commentsFile: null,
                  designer: "REJECTED",
                  graphic: "",
                  technologist: "",
                  commentsRemarks: "",
                }))
              }
              className={outlineBtn}
            >
              Clear
            </button>
          </div>

          {/* REMARKS BELOW */}
          <textarea
            name="commentsRemarks"
            value={data.commentsRemarks}
            onChange={handleChange}
            placeholder="Remarks"
            className={baseTextarea}
          />
        </section>

        {/* ───── ACTIONS ───── */}
        <div className="flex justify-end gap-4">
          <button type="button" className={outlineBtn}>Cancel</button>
          <button type="submit" className={primaryBtn}>Save</button>
        </div>
      </form>
    </main>
  );
}