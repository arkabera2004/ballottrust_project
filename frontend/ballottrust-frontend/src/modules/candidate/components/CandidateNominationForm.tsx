import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  createCandidateSchema,
  type CreateCandidateForm,
} from '../schemas';

import type {
  CreateCandidateDto,
} from '../types';

interface CandidateNominationFormProps {
  elections: {
    id: string;
    title: string;
    electionCode: string;
  }[];

  loading: boolean;

  onSubmit: (
    data: CreateCandidateDto,
  ) => Promise<void>;
}

export default function CandidateNominationForm({
  elections,
  loading,
  onSubmit,
}: CandidateNominationFormProps) {

  const {
    register,
    handleSubmit,
    watch,
    formState: {
      errors,
    },
  } = useForm<CreateCandidateForm>({
    resolver: zodResolver(
      createCandidateSchema,
    ),

    defaultValues: {
      electionId: '',
      candidateType: 'INDEPENDENT',
      partyId: '',
      position: '',
      biography: '',
      campaignSlogan: '',
      campaignWebsite: '',
      manifesto: '',
      agenda: '',
      achievements: '',
      nominationStatement: '',
      photoUrl: '',
      documentUrl: '',
    },
  });

  const candidateType =
    watch('candidateType');

  async function submit(
    data: CreateCandidateForm,
  ) {
    const dto: CreateCandidateDto = {
      electionId: data.electionId,
      candidateType: data.candidateType,
      position: data.position,

      biography:
        data.biography || undefined,

      campaignSlogan:
        data.campaignSlogan || undefined,

      campaignWebsite:
        data.campaignWebsite || undefined,

      manifesto:
        data.manifesto || undefined,

      agenda:
        data.agenda || undefined,

      achievements:
        data.achievements || undefined,

      nominationStatement:
        data.nominationStatement,

      photoUrl:
        data.photoUrl || undefined,

      documentUrl:
        data.documentUrl || undefined,
    };

    if (
      data.candidateType === 'PARTY' &&
      data.partyId
    ) {
      dto.partyId = data.partyId;
    }

    await onSubmit(dto);
  }

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="space-y-6"
    >

      <div>
        <label className="block text-sm font-medium">
          Election
        </label>

        <select
          {...register('electionId')}
          className="mt-2 w-full rounded-lg border border-slate-300 p-3"
        >
          <option value="">
            Select Election
          </option>

          {elections.map((election) => (
            <option
              key={election.id}
              value={election.id}
            >
              {election.title} (
              {election.electionCode})
            </option>
          ))}
        </select>

        {errors.electionId && (
          <p className="mt-1 text-sm text-red-600">
            {errors.electionId.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">
          Candidate Type
        </label>

        <select
          {...register('candidateType')}
          className="mt-2 w-full rounded-lg border border-slate-300 p-3"
        >
          <option value="INDEPENDENT">
            Independent
          </option>

          <option value="PARTY">
            Party
          </option>
        </select>

        {candidateType === 'PARTY' && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            Party selection is not currently available because
            the BallotTrust backend does not expose a Party listing
            API. A valid Party ID is required by the backend.
          </div>
        )}
      </div>

      {candidateType === 'PARTY' && (
        <div>
          <label className="block text-sm font-medium">
            Party ID
          </label>

          <input
            {...register('partyId')}
            placeholder="Enter valid Party UUID"
            className="mt-2 w-full rounded-lg border border-slate-300 p-3"
          />

          {errors.partyId && (
            <p className="mt-1 text-sm text-red-600">
              {errors.partyId.message}
            </p>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium">
          Position
        </label>

        <input
          {...register('position')}
          placeholder="Position contested"
          className="mt-2 w-full rounded-lg border border-slate-300 p-3"
        />

        {errors.position && (
          <p className="mt-1 text-sm text-red-600">
            {errors.position.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">
          Biography
        </label>

        <textarea
          {...register('biography')}
          rows={4}
          className="mt-2 w-full rounded-lg border border-slate-300 p-3"
        />

        {errors.biography && (
          <p className="mt-1 text-sm text-red-600">
            {errors.biography.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">
          Campaign Slogan
        </label>

        <input
          {...register('campaignSlogan')}
          className="mt-2 w-full rounded-lg border border-slate-300 p-3"
        />

        {errors.campaignSlogan && (
          <p className="mt-1 text-sm text-red-600">
            {errors.campaignSlogan.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">
          Campaign Website
        </label>

        <input
          {...register('campaignWebsite')}
          placeholder="https://example.com"
          className="mt-2 w-full rounded-lg border border-slate-300 p-3"
        />

        {errors.campaignWebsite && (
          <p className="mt-1 text-sm text-red-600">
            {errors.campaignWebsite.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">
          Manifesto
        </label>

        <textarea
          {...register('manifesto')}
          rows={6}
          className="mt-2 w-full rounded-lg border border-slate-300 p-3"
        />

        {errors.manifesto && (
          <p className="mt-1 text-sm text-red-600">
            {errors.manifesto.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">
          Agenda
        </label>

        <textarea
          {...register('agenda')}
          rows={5}
          className="mt-2 w-full rounded-lg border border-slate-300 p-3"
        />

        {errors.agenda && (
          <p className="mt-1 text-sm text-red-600">
            {errors.agenda.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">
          Achievements
        </label>

        <textarea
          {...register('achievements')}
          rows={5}
          className="mt-2 w-full rounded-lg border border-slate-300 p-3"
        />

        {errors.achievements && (
          <p className="mt-1 text-sm text-red-600">
            {errors.achievements.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">
          Nomination Statement
        </label>

        <textarea
          {...register('nominationStatement')}
          rows={6}
          className="mt-2 w-full rounded-lg border border-slate-300 p-3"
        />

        {errors.nominationStatement && (
          <p className="mt-1 text-sm text-red-600">
            {errors.nominationStatement.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">
          Photo URL
        </label>

        <input
          {...register('photoUrl')}
          placeholder="https://example.com/photo.jpg"
          className="mt-2 w-full rounded-lg border border-slate-300 p-3"
        />

        {errors.photoUrl && (
          <p className="mt-1 text-sm text-red-600">
            {errors.photoUrl.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium">
          Document URL
        </label>

        <input
          {...register('documentUrl')}
          placeholder="https://example.com/document.pdf"
          className="mt-2 w-full rounded-lg border border-slate-300 p-3"
        />

        {errors.documentUrl && (
          <p className="mt-1 text-sm text-red-600">
            {errors.documentUrl.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? 'Submitting...'
          : 'Submit Nomination'}
      </button>

    </form>
  );
}