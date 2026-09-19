import { useState } from 'react';
import { CheckCircle2, ShieldQuestion } from 'lucide-react';

import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

import { PublicService } from '../services';

import type { ReceiptVerification } from '../types';

/**
 * Vote receipt verification.
 *
 * Confirms only that a vote bearing this code was recorded, and in which
 * election. It deliberately never shows the candidate: a voter can be
 * made to show their receipt, so displaying their choice against a code
 * they can hand over would turn the receipt into proof of how they
 * voted.
 */
export default function VerifyReceiptPage() {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ReceiptVerification | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleVerify(event: React.FormEvent) {
    event.preventDefault();

    const trimmed = code.trim();

    if (!trimmed) return;

    try {
      setBusy(true);
      setError(null);
      setResult(null);

      setResult(await PublicService.verifyReceipt(trimmed));
    } catch {
      setError(
        'No vote was found for that code. Check it and try again.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <header className="text-center">
        <ShieldQuestion
          className="mx-auto h-10 w-10 text-blue-600"
          aria-hidden="true"
        />

        <h1 className="mt-4 text-3xl font-bold text-slate-900">
          Verify a vote receipt
        </h1>

        <p className="mt-2 text-slate-600">
          Enter the verification code from your receipt to confirm your vote
          was recorded.
        </p>
      </header>

      <Card className="mt-8">
        <form onSubmit={(event) => void handleVerify(event)}>
          <label htmlFor="receipt-code" className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">
              Verification code or receipt number
            </span>

            <input
              id="receipt-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="e.g. BT-4F2A91C7E033"
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 font-mono text-sm"
            />
          </label>

          <Button type="submit" className="mt-4 w-full" disabled={busy}>
            {busy ? 'Checking…' : 'Verify receipt'}
          </Button>
        </form>

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        {result && (
          <div className="mt-6 rounded-xl bg-green-50 p-6">
            <p className="flex items-center gap-2 font-semibold text-green-800">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              This vote was recorded.
            </p>

            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-slate-600">Election</dt>
                <dd className="font-medium text-slate-900">
                  {result.election.title}
                </dd>
              </div>

              <div className="flex justify-between gap-4">
                <dt className="text-slate-600">Receipt</dt>
                <dd className="font-mono text-slate-900">
                  {result.receiptNumber}
                </dd>
              </div>

              <div className="flex justify-between gap-4">
                <dt className="text-slate-600">Recorded</dt>
                <dd className="text-slate-900">
                  {new Date(result.recordedAt).toLocaleString()}
                </dd>
              </div>

              <div className="flex justify-between gap-4">
                <dt className="shrink-0 text-slate-600">Ledger hash</dt>
                <dd className="truncate font-mono text-xs text-slate-500">
                  {result.ledgerHash}
                </dd>
              </div>
            </dl>

            <p className="mt-4 border-t border-green-200 pt-4 text-xs text-green-800">
              Your choice is not shown here, and is not stored against your
              identity. Anyone holding this code can confirm the vote exists,
              but nobody can use it to discover how you voted.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
