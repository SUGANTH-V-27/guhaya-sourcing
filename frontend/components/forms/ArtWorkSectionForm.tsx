'use client';
 
import React, { useState, ChangeEvent, FormEvent } from 'react';

const inputClass =
  'w-full rounded-lg border border-gray-700 bg-black py-2 px-3 text-sm text-white placeholder-gray-500 outline-none focus:border-teal-400/60';
const sectionClass = 'rounded-xl border border-gray-700 bg-gray-900 p-4';
 
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
 
/* ── tiny reusable file-action button group ── */
type FileActionsProps = {
  file: File | null;
  onDownload: () => void;
  onEdit: () => void;
  onDelete: () => void;
  label?: string;           // e.g. "filename.pdf  0.75 MB"
};
 
const FileActions = ({ file, onDownload, onEdit, onDelete, label }: FileActionsProps) => (
  <div className="flex flex-col gap-1">
    {file && (
      <div className="flex items-center gap-1 text-xs text-gray-400">
        <span className="truncate max-w-[120px]">{label ?? file.name}</span>
        <span className="text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
        {/* X above filename */}
        <button
          type="button"
          onClick={onDelete}
          title="Remove file"
          className="ml-1 text-red-500 hover:text-red-700 font-bold leading-none"
        >
          ✕
        </button>
      </div>
    )}
    <div className="flex items-center gap-2">
      {/* Download */}
      <button
        type="button"
        onClick={onDownload}
        title="Download"
        className="group relative flex items-center gap-1 text-teal-400 hover:text-teal-300 text-base"
      >
        📥
        <span className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-[10px] rounded px-1 py-0.5 whitespace-nowrap">
          Download
        </span>
      </button>
      {/* Edit */}
      <button
        type="button"
        onClick={onEdit}
        title="Edit"
        className="group relative flex items-center gap-1 text-teal-400 hover:text-teal-300 text-base"
      >
        ✏️
        <span className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-[10px] rounded px-1 py-0.5 whitespace-nowrap">
          Edit
        </span>
      </button>
      {/* Delete row */}
      <button
        type="button"
        onClick={onDelete}
        title="Delete"
        className="group relative flex items-center gap-1 text-red-500 hover:text-red-700 text-base"
      >
        🗑️
        <span className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-[10px] rounded px-1 py-0.5 whitespace-nowrap">
          Delete
        </span>
      </button>
    </div>


    {/* Delete label shown below filename like in the wireframe */}
    {file && (
      <button
        type="button"
        onClick={onDelete}
        className="text-[10px] text-red-500 hover:text-red-700 underline text-left w-fit"
      >
        Delete
      </button>
    )}

    
  </div>
);
 
/* ── file upload trigger button ── */
type AddFileButtonProps = {
  inputId: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
};
 
const AddFileButton = ({ inputId, onChange, accept = '*' }: AddFileButtonProps) => (
  <>
    <label htmlFor={inputId} className="btn cursor-pointer">
      + ADD
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
 
/* ══════════════════════════════════════════════ */
/*               MAIN COMPONENT                  */
/* ══════════════════════════════════════════════ */
 
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
 
  /* ── helpers ── */
  const updateArtwork = (index: number, patch: Partial<ArtworkEntry>) =>
    setData((prev) => {
      const artworks = [...prev.artworks];
      artworks[index] = { ...artworks[index], ...patch };
      return { ...prev, artworks };
    });
 
  const handleTextChange =
    (index: number) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      updateArtwork(index, { [e.target.name]: e.target.value } as Partial<ArtworkEntry>);
    };
 
  const handleFileChange =
    (index: number, field: 'illustratorFile' | 'pdfFile') =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      updateArtwork(index, { [field]: file });
    };
 
  const downloadFile = (file: File | null) => {
    if (!file) return alert('No file attached');
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };
 
  const editFile = (file: File | null) => {
    if (!file) return alert('No file to edit');
    alert('Edit file: ' + file.name);
  };
 
  const addArtworkRow = () =>
    setData((prev) => ({ ...prev, artworks: [...prev.artworks, emptyArtwork()] }));

  const removeArtworkRow = (index: number) =>
    setData((prev) => ({
      ...prev,
      artworks: prev.artworks.filter((_, i) => i !== index),
    }));
 
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Saved artwork docs', data);
    alert('Form saved (UI only)');
  };
 
  return (
    <form onSubmit={onSubmit} className="space-y-6">
 
      {/* ── ARTWORK SECTION ── */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
 
        {/* LEFT: artwork table */}
        <div className={`lg:col-span-3 ${sectionClass}`}>
          
            <h2 className="text-2xl font-bold text-white">ARTWORK</h2>


          {/* Header row */}
          <div className="mb-1 grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 px-1 text-xs font-semibold text-gray-400">
            <span>Description</span>
            <span>Received Date</span>
            <span>Illustrator File</span>
            <span>PDF File</span>
            <span></span>
          </div>
 

          {/* Artwork rows */}
          <div className="space-y-3">
            {data.artworks.map((aw, idx) => (
              <div
                key={idx}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 items-center"
              >
                {/* Description */}
                <input
                  name="description"
                  value={aw.description}
                  onChange={handleTextChange(idx)}
                  placeholder="Description"
                  className={inputClass}
                />
 
                {/* Received Date */}
                <input
                  type="date"
                  name="receivedDate"
                  value={aw.receivedDate}
                  onChange={handleTextChange(idx)}
                  className={inputClass}
                />
 
                {/* Illustrator File */}

                <div className="flex flex-col gap-1">
                  {aw.illustratorFile ? (
                    <>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        {/* Ai icon for .ai files */}
                        <span className="flex items-center justify-center w-6 h-6 rounded border border-orange-500 bg-black text-orange-400 font-black text-[8px] shrink-0">
                          Ai
                        </span>
                        <span className="truncate max-w-[80px]">{aw.illustratorFile.name}</span>
                        <button
                          type="button"
                          onClick={() => updateArtwork(idx, { illustratorFile: null })}
                          className="text-red-500 hover:text-red-700 font-bold"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex gap-1">
                        <button type="button" onClick={() => downloadFile(aw.illustratorFile)} className="text-teal-400 hover:text-teal-300 text-base" title="Download">📥</button>
                        <button type="button" onClick={() => editFile(aw.illustratorFile)} className="text-teal-400 hover:text-teal-300 text-base" title="Edit">✏️</button>
                        <button type="button" onClick={() => updateArtwork(idx, { illustratorFile: null })} className="text-red-500 hover:text-red-700 text-base" title="Delete">🗑️</button>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateArtwork(idx, { illustratorFile: null })}
                        className="text-[10px] text-red-500 underline text-left"
                      >
                        Delete
                      </button>
                    </>
                  ) : (
                    <AddFileButton
                      inputId={`ai-file-${idx}`}
                      accept=".ai,.eps,.svg"
                      onChange={handleFileChange(idx, 'illustratorFile')}
                    />
                  )}
                </div>
 


                {/* PDF File */}

                <div className="flex flex-col gap-1">
                  {aw.pdfFile ? (
                    <>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        {/* PDF icon */}
                        <span className="text-red-500 text-lg">📄</span>
                        <span className="truncate max-w-[80px]">{aw.pdfFile.name}</span>
                        <span className="text-gray-400">{(aw.pdfFile.size / 1024 / 1024).toFixed(2)} MB</span>
                        <button
                          type="button"
                          onClick={() => updateArtwork(idx, { pdfFile: null })}
                          className="text-red-500 hover:text-red-700 font-bold"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex gap-1">
                        <button type="button" onClick={() => downloadFile(aw.pdfFile)} className="text-teal-400 hover:text-teal-300 text-base" title="Download">📥</button>
                        <button type="button" onClick={() => editFile(aw.pdfFile)} className="text-teal-400 hover:text-teal-300 text-base" title="Edit">✏️</button>
                        <button type="button" onClick={() => updateArtwork(idx, { pdfFile: null })} className="text-red-500 hover:text-red-700 text-base" title="Delete">🗑️</button>
                      </div>
                    </>
                  ) : (
                    <AddFileButton
                      inputId={`pdf-file-${idx}`}
                      accept=".pdf"
                      onChange={handleFileChange(idx, 'pdfFile')}
                    />
                  )}
                </div>


                {/* Row delete */}
                <button
                  type="button"
                  onClick={() => removeArtworkRow(idx)}
                  title="Remove row"
                  className="delete-btn"
                >
                  🗑
                </button>
              </div>
            ))}
          </div>

              
 
            {/* ADD ARTWORK button */}
            <div className="mt-4">
                <button
                type="button"
                onClick={addArtworkRow}
                className="btn mb-3"
                >
                + ADD ARTWORK
                </button>
            </div>


            {/* ── SAVE ── */}
            <div className="flex flex-wrap items-center justify-end gap-3">
                <button
                type="submit"
                className="btn px-6 py-2 font-bold"
                >
                SAVE
                </button>
            </div>  
        </div>


        {/* RIGHT: Model preview card */}
        <aside className={`${sectionClass} flex h-full flex-col items-center justify-between`}>
          <p className="w-full border-b border-gray-700 pb-3 text-center text-2xl font-bold tracking-widest text-white">
            {data.modelId}
          </p>
          <div className="my-4 flex flex-1 items-center justify-center">
            <div className="flex items-end gap-3 opacity-30">
              <div className="h-40 w-14 rounded-b-sm rounded-t-full bg-amber-800" />
              <div
                className="h-40 w-14 rounded-b-sm rounded-t-full"
                style={{
                  background:
                    'repeating-linear-gradient(45deg, #bbb 0px, #bbb 4px, #ddd 4px, #ddd 10px)',
                }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-200">
            <span>⚠️</span>
            25 Days to handover!
          </div>
        </aside>


      </section>
 
      
    </form>
  );
};
 
export default ArtWorkSectionForm;

