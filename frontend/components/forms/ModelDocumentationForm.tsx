'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';

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
};

const emptyTechPack = (): TechPackEntry => ({
  techPackName: '',
  receivedDate: '',
  remarks: '',
  commentsFile: null,
});

/* ── ADD file button ── */
type AddFileButtonProps = {
  inputId: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

const AddFileButton = ({ inputId, onChange }: AddFileButtonProps) => (
  <>
    <label
      htmlFor={inputId}
      className="cursor-pointer inline-flex items-center gap-1 rounded-lg border-2 border-cyan-400 bg-cyan-400 px-3 py-1.5 text-sm font-semibold text-black hover:bg-cyan-300 transition-colors"
    >
      ADD 📤
    </label>
    <input id={inputId} type="file" onChange={onChange} className="hidden" />
  </>
);

/* ── File operations row ── */
type FileOpsProps = {
  file: File | null;
  onDownload: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

const FileOps = ({ file, onDownload, onEdit, onDelete }: FileOpsProps) => (
  <div className="flex items-center gap-2 flex-wrap">
    <span className="text-xs text-gray-500">Attached:</span>
    {file ? (
      <>
        <span className="text-xs text-gray-700 truncate max-w-[120px]">{file.name}</span>
        <span className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
        <button type="button" onClick={onDownload} title="Download" className="group relative text-cyan-500 hover:text-cyan-700 text-base">
          📥
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-[10px] rounded px-1 py-0.5 whitespace-nowrap z-10">Download</span>
        </button>
        <button type="button" onClick={onEdit} title="Edit" className="group relative text-cyan-500 hover:text-cyan-700 text-base">
          ✏️
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-[10px] rounded px-1 py-0.5 whitespace-nowrap z-10">Edit</span>
        </button>
        <button type="button" onClick={onDelete} title="Remove file" className="text-red-500 hover:text-red-700 font-bold text-xs">✕</button>
      </>
    ) : (
      <span className="text-xs text-gray-400">No file</span>
    )}
  </div>
);

/* ══════════════════════════════════════════════ */
/*               MAIN COMPONENT                  */
/* ══════════════════════════════════════════════ */

const ModelDocumentationForm = () => {
  const [data, setData] = useState<ModelDoc>({
    modelId: '006GS',
    techPacks: [
      {
        techPackName: '1st Tech Pack',
        receivedDate: '2026-01-25',
        remarks: '',
        commentsFile: null,
      },
    ],
    sample: '',
    submission: '',
    sentDate: '',
    commentsDate: '',
    commentsFile: null,
    commentsRemarks: '',
    designer: '',
    graphic: '',
    technologist: '',
  });

  /* ── Tech pack row helpers ── */
  const updateTechPack = (index: number, patch: Partial<TechPackEntry>) =>
    setData((prev) => {
      const techPacks = [...prev.techPacks];
      techPacks[index] = { ...techPacks[index], ...patch };
      return { ...prev, techPacks };
    });

  const handleTechPackText =
    (index: number) => (e: ChangeEvent<HTMLInputElement>) =>
      updateTechPack(index, { [e.target.name]: e.target.value } as Partial<TechPackEntry>);

  const handleTechPackFile =
    (index: number) => (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      updateTechPack(index, { commentsFile: file });
      e.target.value = '';
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

  const addTechPackRow = () =>
    setData((prev) => ({ ...prev, techPacks: [...prev.techPacks, emptyTechPack()] }));

  const removeTechPackRow = (index: number) =>
    setData((prev) => ({
      ...prev,
      techPacks: prev.techPacks.filter((_, i) => i !== index),
    }));

  /* ── Model comments helpers ── */
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCommentsFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setData((prev) => ({ ...prev, commentsFile: file }));
    e.target.value = '';
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Saved model docs', data);
    alert('Form saved (UI only)');
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 p-6 bg-white rounded-xl shadow-lg border">

      {/* ── MODEL DOCUMENTATION ── */}
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 border rounded-lg p-4">
          <h2 className="text-2xl font-bold mb-4">MODEL DOCUMENTATION</h2>

          {/* Header row */}
          <div className="grid grid-cols-[2fr_1fr_1fr_2fr_auto] gap-2 mb-1 text-xs font-semibold text-gray-500 px-1">
            <span>Tech Pack Name</span>
            <span>Received Date</span>
            <span>Remarks</span>
            <span>Attached File</span>
            <span></span>
          </div>

          {/* Tech pack rows */}
          <div className="space-y-3">
            {data.techPacks.map((tp, idx) => (
              <div
                key={idx}
                className="grid grid-cols-[2fr_1fr_1fr_2fr_auto] gap-2 items-start"
              >
                {/* Tech Pack Name */}
                <input
                  name="techPackName"
                  value={tp.techPackName}
                  onChange={handleTechPackText(idx)}
                  placeholder="Tech pack name"
                  className="w-full border-2 border-cyan-400 rounded-lg py-2 px-3 text-sm"
                />

                {/* Received Date */}
                <input
                  type="date"
                  name="receivedDate"
                  value={tp.receivedDate}
                  onChange={handleTechPackText(idx)}
                  className="w-full border-2 border-cyan-400 rounded-lg py-2 px-3 text-sm"
                />

                {/* Remarks */}
                <input
                  name="remarks"
                  value={tp.remarks}
                  onChange={handleTechPackText(idx)}
                  placeholder="Remarks"
                  className="w-full border-2 border-cyan-400 rounded-lg py-2 px-3 text-sm"
                />

                {/* Attached file */}
                <div className="flex flex-col gap-1">
                  {tp.commentsFile ? (
                    <FileOps
                      file={tp.commentsFile}
                      onDownload={() => downloadFile(tp.commentsFile)}
                      onEdit={() => alert('Edit: ' + tp.commentsFile!.name)}
                      onDelete={() => updateTechPack(idx, { commentsFile: null })}
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Attached: No file</span>
                      <AddFileButton
                        inputId={`tp-file-${idx}`}
                        onChange={handleTechPackFile(idx)}
                      />
                    </div>
                  )}
                  {/* show ADD button alongside file ops when file exists */}
                  {tp.commentsFile && (
                    <AddFileButton
                      inputId={`tp-file-replace-${idx}`}
                      onChange={handleTechPackFile(idx)}
                    />
                  )}
                </div>

                {/* Delete row */}
                <button
                  type="button"
                  onClick={() => removeTechPackRow(idx)}
                  title="Remove row"
                  className="cursor-pointer inline-flex items-center gap-1 rounded-lg border-2 border-cyan-400 bg-cyan-400 px-3 py-1.5 text-sm font-semibold text-black hover:bg-cyan-300 transition-colors"
                >
                  DELETE 🗑️
                </button>
              </div>
            ))}
          </div>

          {/* ADD TECH PACK */}
          <div className="mt-4">
            <button
              type="button"
              onClick={addTechPackRow}
              className="bg-cyan-400 text-black font-semibold px-4 py-2 rounded-md hover:bg-cyan-300 transition-colors text-sm"
            >
              ADD TECH PACK
            </button>
          </div>
        </div>

        {/* Model card */}
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

      {/* ── MODEL COMMENTS ── */}
      <section className="border rounded-lg p-4 space-y-3">
        <h2 className="text-2xl font-bold mb-4">MODEL COMMENTS</h2>

        <div>
          <label className="text-xs text-black">Sample</label>
          <input name="sample" value={data.sample} onChange={handleChange} className="w-full border-2 border-cyan-400 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="text-xs text-black">Submission</label>
          <input name="submission" value={data.submission} onChange={handleChange} className="w-full border-2 border-cyan-400 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="text-xs text-black">Sent Date</label>
          <input type="date" name="sentDate" value={data.sentDate} onChange={handleChange} className="w-full border-2 border-cyan-400 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="text-xs text-black">Comments Date</label>
          <input type="date" name="commentsDate" value={data.commentsDate} onChange={handleChange} className="w-full border-2 border-cyan-400 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="text-xs text-black block mb-1">Comments File</label>
          <div className="flex items-center gap-2 flex-wrap">
            <AddFileButton inputId="comments-file-main" onChange={handleCommentsFile} />
            {data.commentsFile && (
              <FileOps
                file={data.commentsFile}
                onDownload={() => downloadFile(data.commentsFile)}
                onEdit={() => alert('Edit: ' + data.commentsFile!.name)}
                onDelete={() => setData((prev) => ({ ...prev, commentsFile: null }))}
              />
            )}
          </div>
        </div>

        <div>
          <label className="text-xs text-black block">Remarks</label>
          <textarea name="commentsRemarks" value={data.commentsRemarks} onChange={handleChange} rows={3} className="w-full border-2 border-cyan-400 rounded-lg p-3" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-black">Designer</label>
            <select name="designer" value={data.designer} onChange={handleChange} className="w-full border-2 border-cyan-400 rounded-lg p-2">
              <option value="">-</option>
              <option value="APPROVED">APPROVED</option>
              <option value="CONDITIONAL APPROVED">CONDITIONAL APPROVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="PENDING">PENDING</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-black">Graphic</label>
            <select name="graphic" value={data.graphic} onChange={handleChange} className="w-full border-2 border-cyan-400 rounded-lg p-2">
              <option value="">-</option>
              <option value="Graphic A">Graphic A</option>
              <option value="Graphic B">Graphic B</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-black">Technologist</label>
            <select name="technologist" value={data.technologist} onChange={handleChange} className="w-full border-2 border-cyan-400 rounded-lg p-2">
              <option value="">-</option>
              <option value="Tech A">Tech A</option>
              <option value="Tech B">Tech B</option>
            </select>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button type="submit" className="bg-cyan-400 text-black font-bold py-2 px-6 rounded hover:bg-cyan-300 transition-colors">
          SAVE
        </button>
      </div>
    </form>
  );
};

export default ModelDocumentationForm;