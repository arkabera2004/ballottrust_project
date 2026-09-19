import { useState } from 'react';
import { FileUp, X } from 'lucide-react';

import Button from '../../../components/ui/Button';
import { VoterService } from '../services';
import ApiError from '../../../utils/api-error';
import Toast from '../../../utils/toast';

import type { VoterImportResult } from '../types';

interface Props {
  electionId: string;
  onClose: () => void;
  onImported: () => void;
}

const ROW_TONE: Record<string, string> = {
  IMPORTED: 'text-green-700',
  REVIVED: 'text-cyan-700',
  SKIPPED: 'text-amber-700',
  FAILED: 'text-red-700',
};

export default function VoterImportDialog({
  electionId,
  onClose,
  onImported,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<VoterImportResult | null>(null);

  async function run(dryRun: boolean) {
    if (!file) {
      Toast.error('Choose a CSV file first.');
      return;
    }

    try {
      setBusy(true);

      const outcome = await VoterService.import(file, electionId, dryRun);

      setResult(outcome);

      if (!dryRun) {
        Toast.success(
          `Imported ${outcome.imported + outcome.revived} voters.`,
        );

        onImported();
      }
    } catch (err) {
      ApiError.handle(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-title"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-8 shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <h2
              id="import-title"
              className="text-xl font-bold text-slate-900"
            >
              Import voter roll
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              CSV with an <code>email</code> column, and an optional{' '}
              <code>notes</code> column. Each address must already have a
              registered voter account.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center hover:border-blue-400">
          <FileUp className="h-8 w-8 text-slate-400" aria-hidden="true" />

          <span className="mt-2 text-sm font-medium text-slate-700">
            {file ? file.name : 'Choose a CSV file'}
          </span>

          <input
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              setResult(null);
            }}
          />
        </label>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={() => void run(true)}
            disabled={busy || !file}
          >
            {busy ? 'Working…' : 'Preview (dry run)'}
          </Button>

          <Button
            type="button"
            onClick={() => void run(false)}
            disabled={busy || !file}
          >
            Import
          </Button>
        </div>

        {result && (
          <div className="mt-6 rounded-2xl border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-900">
              {result.dryRun ? 'Preview' : 'Import complete'} &mdash;{' '}
              {result.total} rows
            </p>

            <p className="mt-1 text-sm text-slate-600">
              {result.imported} imported &middot; {result.revived} restored
              &middot; {result.skipped} skipped &middot; {result.failed} failed
            </p>

            {result.rows.length > 0 && (
              <div className="mt-4 max-h-64 overflow-y-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase text-slate-500">
                    <tr>
                      <th className="py-2">Row</th>
                      <th className="py-2">Email</th>
                      <th className="py-2">Outcome</th>
                      <th className="py-2">Reason</th>
                    </tr>
                  </thead>

                  <tbody>
                    {result.rows.map((row) => (
                      <tr
                        key={`${row.row}-${row.email}`}
                        className="border-t border-slate-100"
                      >
                        <td className="py-2 text-slate-500">{row.row}</td>

                        <td className="py-2 text-slate-800">
                          {row.email || '—'}
                        </td>

                        <td
                          className={`py-2 font-medium ${
                            ROW_TONE[row.status] ?? 'text-slate-700'
                          }`}
                        >
                          {row.status}
                        </td>

                        <td className="py-2 text-slate-500">
                          {row.reason ?? ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
