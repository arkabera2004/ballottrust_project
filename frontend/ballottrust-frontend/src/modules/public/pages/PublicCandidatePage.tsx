import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ExternalLink, FileText } from 'lucide-react';

import Card from '../../../components/ui/Card';
import Spinner from '../../../components/ui/Spinner';
import EmptyState from '../../../components/empty-state/EmptyState';

import { ENV } from '../../../config/env';
import { PublicService } from '../services';

import type { PublicCandidateDetail } from '../types';

export default function PublicCandidatePage() {
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [candidate, setCandidate] = useState<PublicCandidateDetail | null>(
    null,
  );

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);

        const detail = await PublicService.candidate(id!);

        if (!cancelled) setCandidate(detail);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24">
        <EmptyState
          title="Candidate not found"
          description="This candidate is not published, or the link is wrong."
        />
      </div>
    );
  }

  const photo = candidate.photoUrl ?? candidate.user.avatarUrl;
  const manifesto = candidate.publishedManifesto;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Card className="p-8">
        <div className="flex flex-wrap items-center gap-6">
          {photo ? (
            <img
              src={`${ENV.ASSET_URL}${photo}`}
              alt=""
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <div
              className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-3xl font-semibold text-slate-500"
              aria-hidden="true"
            >
              {candidate.user.fullName.charAt(0)}
            </div>
          )}

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {candidate.user.fullName}
            </h1>

            <p className="text-slate-600">
              {candidate.party?.name ?? 'Independent'}
              {candidate.position ? ` · ${candidate.position}` : ''}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {candidate.election.title}
              {candidate.candidateNumber
                ? ` · Ballot no. ${candidate.candidateNumber}`
                : ''}
            </p>
          </div>
        </div>

        {candidate.campaignSlogan && (
          <p className="mt-6 border-l-4 border-blue-500 pl-4 text-lg italic text-slate-700">
            &ldquo;{candidate.campaignSlogan}&rdquo;
          </p>
        )}

        {candidate.biography && (
          <section className="mt-8">
            <h2 className="text-lg font-semibold text-slate-900">About</h2>

            <p className="mt-2 whitespace-pre-line text-slate-700">
              {candidate.biography}
            </p>
          </section>
        )}
      </Card>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-slate-900">Manifesto</h2>

        {manifesto ? (
          <Card className="mt-4 p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-lg font-semibold text-slate-900">
                {manifesto.title}
              </h3>

              <span className="text-xs text-slate-500">
                Version {manifesto.version}
                {manifesto.approvedAt
                  ? ` · approved ${new Date(
                      manifesto.approvedAt,
                    ).toLocaleDateString()}`
                  : ''}
              </span>
            </div>

            {manifesto.summary && (
              <p className="mt-3 text-slate-600">{manifesto.summary}</p>
            )}

            {/*
              Manifesto HTML is sanitised by the backend on write (see the
              ManifestoContentSanitizer), so the stored value is already
              safe to render. Sanitising on write rather than on read is
              what makes this safe rather than a second guess.
            */}
            <div
              className="prose prose-slate mt-6 max-w-none"
              dangerouslySetInnerHTML={{ __html: manifesto.content }}
            />

            <div className="mt-6 flex flex-wrap gap-4">
              {manifesto.documentUrl && (
                <a
                  href={`${ENV.ASSET_URL}${manifesto.documentUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
                >
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  Download as PDF
                </a>
              )}

              {manifesto.videoUrl && (
                <a
                  href={manifesto.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
                >
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  Watch the campaign video
                </a>
              )}
            </div>
          </Card>
        ) : candidate.manifesto ? (
          <Card className="mt-4 p-8">
            <p className="whitespace-pre-line text-slate-700">
              {candidate.manifesto}
            </p>
          </Card>
        ) : (
          <p className="mt-4 text-slate-500">
            This candidate has not published a manifesto.
          </p>
        )}
      </section>
    </div>
  );
}
