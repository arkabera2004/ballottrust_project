import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import Card from '../components/cards/Card';

import CandidateNominationForm from '../modules/candidate/components/CandidateNominationForm';

import {
  useSubmitNomination,
} from '../modules/candidate/hooks';

import {
  useElections,
} from '../modules/election/hooks';

import type {
  CreateCandidateDto,
} from '../modules/candidate/types';

export default function CandidateNomination() {
  const navigate = useNavigate();

  const {
    submit,
    loading,
  } = useSubmitNomination();

  const {
    elections,
    loading: electionsLoading,
    error: electionsError,
  } = useElections({
    page: 1,
    limit: 100,
  });

  async function handleSubmit(
    data: CreateCandidateDto,
  ) {
    try {
      await submit(data);

      toast.success(
        'Nomination submitted successfully.',
      );

      navigate('/candidate');

    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          'Failed to submit nomination.',
      );
    }
  }

  if (electionsLoading) {
    return (
      <div className="mx-auto max-w-5xl">
        <Card>
          <p className="text-slate-500">
            Loading elections...
          </p>
        </Card>
      </div>
    );
  }

  if (electionsError) {
    return (
      <div className="mx-auto max-w-5xl">
        <Card>
          <h1 className="text-xl font-bold text-red-600">
            Unable to load elections
          </h1>

          <p className="mt-2 text-slate-500">
            {electionsError}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      <Card>
        <h1 className="text-3xl font-bold">
          Candidate Nomination
        </h1>

        <p className="mt-2 text-slate-500">
          Submit your nomination for an available election.
        </p>
      </Card>

      <Card>
        <CandidateNominationForm
          elections={elections}
          loading={loading}
          onSubmit={handleSubmit}
        />
      </Card>

    </div>
  );
}