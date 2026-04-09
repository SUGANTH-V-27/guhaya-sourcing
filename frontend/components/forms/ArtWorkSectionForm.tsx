'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Trash2 } from 'lucide-react';

type ArtworkEntry = {
  description: string;
  receivedDate: string;
  illustratorFile: File | null;
  pdfFile: File | null;
};

type ArtworkDoc = {
  modelId: string;
  artworks: ArtworkEntry[];
};

const emptyArtwork = (): ArtworkEntry => ({
  description: '',
  receivedDate: '',
  illustratorFile: null,
  pdfFile: null,
});

/* ── DESIGN SYSTEM (from GuhayaUI) ── */
const baseInput =
  "w-full h-8 bg-[#1a1a1a] border border-[#00BFA5]/60 px-2 text-xs rounded focus:outline-none focus:ring-1 focus:ring-[#00BFA5]/60 text-white [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-70";

const primaryBtn =
  "bg-[#17b3a3] text-black px-4 py-2 rounded text-sm font-semibold hover:opacity-90";

const iconBtn =
  "text-gray-400 hover:text-[#00BFA5] text-sm";

const dangerIconBtn =
  "text-gray-400 hover:text-red-400 text-sm";

/* ── FILE BUTTON ── */
const AddFileButton = ({
  inputId,
  onChange,
  accept = '*',
}: {
  inputId: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
}) => (
  <>
    <label
      htmlFor={inputId}
      className="cursor-pointer inline-flex items-center gap-1 rounded bg-[#17b3a3] px-3 py-1.5 text-xs font-semibold text-black hover:opacity-90"
    >
      ADD FILE
    </label>
    <input
      id={inputId}
      type="file"
      accept={accept}
      onChange={onChange}
      className="hidden"
    />
  </>
);

/* ═══════════════════════════════════════ */

const ArtWorkSectionForm = () => {
  const [data, setData] = useState<ArtworkDoc>({
    modelId: '006GS',
    artworks: [
      {
        description: '01X - AOP Artwork',
        receivedDate: '2026-01-25',
        illustratorFile: null,
        pdfFile: null,
      },
    ],
  });

  const updateArtwork = (index: number, patch: Partial<ArtworkEntry>) =>
    setData((prev) => {
      const artworks = [...prev.artworks];
      artworks[index] = { ...artworks[index], ...patch };
      return { ...prev, artworks };
    });

  const handleTextChange =
    (index: number) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      updateArtwork(index, { [e.target.name]: e.target.value } as any);
    };

  const handleFileChange =
    (index: number, field: 'illustratorFile' | 'pdfFile') =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      updateArtwork(index, { [field]: file });
    };

  const downloadFile = (file: File | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const addArtworkRow = () =>
    setData((prev) => ({
      ...prev,
      artworks: [...prev.artworks, emptyArtwork()],
    }));

  const removeArtworkRow = (index: number) =>
    setData((prev) => ({
      ...prev,
      artworks: prev.artworks.filter((_, i) => i !== index),
    }));

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(data);
  };

  return (
    <form className="min-h-screen bg-[#0f0f0f] text-white p-8 space-y-6" onSubmit={onSubmit}>

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


      <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* LEFT */}
        <div className="lg:col-span-3 bg-[#1a1a1a] border border-[#00BFA5]/40 rounded-lg p-4">

          <h2 className="text-lg text-gray-300 mb-3">ARTWORK</h2>

          {/* HEADER */}
          <div className="grid grid-cols-[2fr_1fr_1.2fr_1.2fr_auto] gap-3 mb-2 text-xs text-gray-400">
            <span>Description</span>
            <span>Received Date</span>
            <span>Illustrator</span>
            <span>PDF</span>
            <span></span>
          </div>

          {/* ROWS */}
          <div className="space-y-3">
            {data.artworks.map((aw, idx) => (
              <div
                key={idx}
                className="grid grid-cols-[2fr_1fr_1.2fr_1.2fr_auto] gap-3 items-start"
              >
                <input
                  name="description"
                  value={aw.description}
                  onChange={handleTextChange(idx)}
                  className={baseInput}
                />

                <input
                  type="date"
                  name="receivedDate"
                  value={aw.receivedDate}
                  onChange={handleTextChange(idx)}
                  className={baseInput}
                />

                {/* Illustrator */}
                <div className="flex flex-col gap-1">
                  {aw.illustratorFile ? (
                    <>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="text-orange-400 font-bold text-[10px]">Ai</span>
                        <span className="truncate max-w-[80px]">{aw.illustratorFile.name}</span>
                        <button onClick={() => updateArtwork(idx, { illustratorFile: null })}>✕</button>
                      </div>

                      <div className="flex gap-2">
                        <button onClick={() => downloadFile(aw.illustratorFile)} className={iconBtn}>📥</button>
                        <button className={iconBtn}>✏️</button>
                        <button onClick={() => updateArtwork(idx, { illustratorFile: null })} className={dangerIconBtn}>🗑️</button>
                      </div>
                    </>
                  ) : (
                    <AddFileButton
                      inputId={`ai-${idx}`}
                      onChange={handleFileChange(idx, 'illustratorFile')}
                    />
                  )}
                </div>

                {/* PDF */}
                <div className="flex flex-col gap-1">
                  {aw.pdfFile ? (
                    <>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        📄
                        <span className="truncate max-w-[80px]">{aw.pdfFile.name}</span>
                      </div>

                      <div className="flex gap-2">
                        <button onClick={() => downloadFile(aw.pdfFile)} className={iconBtn}>📥</button>
                        <button className={iconBtn}>✏️</button>
                        <button onClick={() => updateArtwork(idx, { pdfFile: null })} className={dangerIconBtn}>🗑️</button>
                      </div>
                    </>
                  ) : (
                    <AddFileButton
                      inputId={`pdf-${idx}`}
                      onChange={handleFileChange(idx, 'pdfFile')}
                    />
                  )}
                </div>

                {/* DELETE ROW */}
                <button type="button" onClick={() => removeArtworkRow(idx)}>
                  <Trash2 size={14} className="text-gray-400 hover:text-red-400" />
                </button>
              </div>
            ))}
          </div>

          {/* ACTIONS */}
          <div className="flex justify-between mt-6">
            <button type="button" onClick={addArtworkRow} className={primaryBtn}>
              ADD ARTWORK
            </button>

            <button type="submit" className={primaryBtn}>
              SAVE
            </button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <aside className="bg-[#1a1a1a] border border-[#00BFA5]/40 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold">{data.modelId}</h3>
            <p className="text-sm text-gray-400">25 Days to handover</p>
          </div>

          <img
            src="https://via.placeholder.com/180x220"
            className="mt-4 rounded"
          />
        </aside>

      </section>
    </form>
  );
};

export default ArtWorkSectionForm;