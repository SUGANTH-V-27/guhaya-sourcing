'use client';
 
import React, { useState, ChangeEvent, FormEvent } from 'react';
 
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
      <div className="flex items-center gap-1 text-xs text-gray-600">
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
        className="group relative flex items-center gap-1 text-cyan-500 hover:text-cyan-700 text-base"
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
        className="group relative flex items-center gap-1 text-cyan-500 hover:text-cyan-700 text-base"
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
    <label
      htmlFor={inputId}
      className="cursor-pointer inline-flex items-center gap-1 rounded-lg border-2 border-cyan-400 bg-cyan-400 px-3 py-1.5 text-sm font-semibold text-black hover:bg-cyan-300 transition-colors"
    >
      ADD 📤
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
    <form onSubmit={onSubmit} className="space-y-6 p-6 bg-white rounded-xl shadow-lg border">
 
      {/* ── ARTWORK SECTION ── */}
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-4">
 
        {/* LEFT: artwork table */}
        <div className="lg:col-span-3 border rounded-lg p-4">
          
            <h2 className="text-2xl font-bold">ARTWORK</h2>


          {/* Header row */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 mb-1 text-xs font-semibold text-gray-500 px-1">
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
                className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 items-start"
              >
                {/* Description */}
                <input
                  name="description"
                  value={aw.description}
                  onChange={handleTextChange(idx)}
                  placeholder="Description"
                  className="w-full border-2 border-cyan-400 rounded-lg py-2 px-3 text-sm"
                />
 
                {/* Received Date */}
                <input
                  type="date"
                  name="receivedDate"
                  value={aw.receivedDate}
                  onChange={handleTextChange(idx)}
                  className="w-full border-2 border-cyan-400 rounded-lg py-2 px-3 text-sm"
                />
 
                {/* Illustrator File */}

                <div className="flex flex-col gap-1">
                  {aw.illustratorFile ? (
                    <>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
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
                        <button type="button" onClick={() => downloadFile(aw.illustratorFile)} className="text-cyan-500 hover:text-cyan-700 text-base" title="Download">📥</button>
                        <button type="button" onClick={() => editFile(aw.illustratorFile)} className="text-cyan-500 hover:text-cyan-700 text-base" title="Edit">✏️</button>
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
                      <div className="flex items-center gap-1 text-xs text-gray-600">
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
                        <button type="button" onClick={() => downloadFile(aw.pdfFile)} className="text-cyan-500 hover:text-cyan-700 text-base" title="Download">📥</button>
                        <button type="button" onClick={() => editFile(aw.pdfFile)} className="text-cyan-500 hover:text-cyan-700 text-base" title="Edit">✏️</button>
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
                className="cursor-pointer inline-flex items-center gap-1 rounded-lg border-2 border-cyan-400 bg-cyan-400 px-3 py-1.5 text-sm font-semibold text-black hover:bg-cyan-300 transition-colors"
                >
                DELETE ROW
                </button>
              </div>
            ))}
          </div>

              
 
            {/* ADD ARTWORK button */}
            <div className="mt-4">
                <button
                type="button"
                onClick={addArtworkRow}
                className="bg-cyan-400 text-black font-semibold px-4 py-2 rounded-md hover:bg-cyan-300 transition-colors text-sm"
                >
                ADD ARTWORK
                </button>
            </div>


            {/* ── SAVE ── */}
            <div className="flex flex-wrap items-center justify-end gap-3">
                <button
                type="submit"
                className="bg-cyan-400 text-black font-bold py-2 px-6 rounded hover:bg-cyan-300 transition-colors"
                >
                SAVE
                </button>
            </div>  
        </div>


        {/* RIGHT: Model card — identical to ModelDocumentationForm */}
        <aside className="border rounded-lg p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold">{data.modelId}</h3>
            <p className="text-sm text-black">25 Days to handover!</p>
          </div>
          <img
            src="https://via.placeholder.com/180x220"
            alt="Model"
            className="mt-4 w-full object-cover rounded"
          />
        </aside>


      </section>
 
      
    </form>
  );
};
 
export default ArtWorkSectionForm;

