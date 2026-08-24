'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';

const inputClass =
  'w-full rounded-lg border border-gray-700 bg-black py-2 px-3 text-sm text-white placeholder-gray-500 outline-none focus:border-teal-400/60';
const sectionClass = 'rounded-xl border border-gray-700 bg-gray-900 p-4';

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
    <label htmlFor={inputId} className="btn cursor-pointer">
      + ADD
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
    <span className="text-xs text-gray-400">Attached:</span>
    {file ? (
      <>
        <span className="max-w-[120px] truncate text-xs text-gray-300">{file.name}</span>
        <span className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
        <button type="button" onClick={onDownload} title="Download" className="group relative text-base text-teal-400 hover:text-teal-300">
          📥
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-[10px] rounded px-1 py-0.5 whitespace-nowrap z-10">Download</span>
        </button>
        <button type="button" onClick={onEdit} title="Edit" className="group relative text-base text-teal-400 hover:text-teal-300">
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
    <form onSubmit={onSubmit} className="space-y-6">

      {/* ── MODEL DOCUMENTATION ── */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className={`lg:col-span-3 ${sectionClass}`}>
          <h2 className="mb-4 text-2xl font-bold text-white">MODEL DOCUMENTATION</h2>

          {/* Header row */}
          <div className="mb-1 grid grid-cols-[2fr_1fr_1fr_2fr_auto] gap-2 px-1 text-xs font-semibold text-gray-400">
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
                className="grid grid-cols-[2fr_1fr_1fr_2fr_auto] gap-2 items-center"
              >
                {/* Tech Pack Name */}
                <input
                  name="techPackName"
                  value={tp.techPackName}
                  onChange={handleTechPackText(idx)}
                  placeholder="Tech pack name"
                  className={inputClass}
                />

                {/* Received Date */}
                <input
                  type="date"
                  name="receivedDate"
                  value={tp.receivedDate}
                  onChange={handleTechPackText(idx)}
                  className={inputClass}
                />

                {/* Remarks */}
                <input
                  name="remarks"
                  value={tp.remarks}
                  onChange={handleTechPackText(idx)}
                  placeholder="Remarks"
                  className={inputClass}
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
                  className="delete-btn"
                >
                  🗑
                </button>
              </div>
            ))}
          </div>

          {/* ADD TECH PACK */}
          <div className="mt-4">
            <button
              type="button"
              onClick={addTechPackRow}
              className="btn mb-3"
            >
              + ADD TECH PACK
            </button>
          </div>
        </div>

        {/* Model preview card */}
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

      {/* ── MODEL COMMENTS ── */}
      <section className={`${sectionClass} space-y-3`}>
        <h2 className="mb-4 text-2xl font-bold text-white">MODEL COMMENTS</h2>

        <div>
          <label className="text-xs text-gray-400">Sample</label>
          <input name="sample" value={data.sample} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className="text-xs text-gray-400">Submission</label>
          <input name="submission" value={data.submission} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className="text-xs text-gray-400">Sent Date</label>
          <input type="date" name="sentDate" value={data.sentDate} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className="text-xs text-gray-400">Comments Date</label>
          <input type="date" name="commentsDate" value={data.commentsDate} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-gray-400">Comments File</label>
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
          <label className="block text-xs text-gray-400">Remarks</label>
          <textarea name="commentsRemarks" value={data.commentsRemarks} onChange={handleChange} rows={3} className={inputClass} />
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label className="text-xs text-gray-400">Designer</label>
            <select name="designer" value={data.designer} onChange={handleChange} className={inputClass}>
              <option value="">-</option>
              <option value="APPROVED">APPROVED</option>
              <option value="CONDITIONAL APPROVED">CONDITIONAL APPROVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="PENDING">PENDING</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400">Graphic</label>
            <select name="graphic" value={data.graphic} onChange={handleChange} className={inputClass}>
              <option value="">-</option>
              <option value="Graphic A">Graphic A</option>
              <option value="Graphic B">Graphic B</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400">Technologist</label>
            <select name="technologist" value={data.technologist} onChange={handleChange} className={inputClass}>
              <option value="">-</option>
              <option value="Tech A">Tech A</option>
              <option value="Tech B">Tech B</option>
            </select>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button type="submit" className="btn px-6 py-2 font-bold">
          SAVE
        </button>
      </div>
    </form>
  );
};

export default ModelDocumentationForm;