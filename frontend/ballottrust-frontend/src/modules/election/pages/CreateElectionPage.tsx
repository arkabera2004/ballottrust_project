import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import Card from '../../../components/cards/Card';

import ElectionForm from '../components/ElectionForm';
import { useCreateElection } from '../hooks';

import type { CreateElectionForm } from '../schemas';
import type { CreateElectionDto } from '../types/election.types';

import { getErrorMessage } from '../../../utils/api-error';

export default function CreateElectionPage() {
  const navigate = useNavigate();

  const {
    create,
    loading,
  } = useCreateElection();

  async function handleCreate(
    data: CreateElectionForm,
  ) {
    try {
      await create(data as CreateElectionDto);

      toast.success(
        'Election created successfully.',
      );

      navigate('/elections');

    } catch (error: unknown) {

      toast.error(
        getErrorMessage(error, 'Failed to create election.'),
      );

    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">

      <Card>
        <h1 className="text-3xl font-bold">
          Create Election
        </h1>

        <p className="mt-2 text-slate-500">
          Fill in the election details below.
        </p>
      </Card>

      <ElectionForm
        loading={loading}
        onSubmit={handleCreate}
      />

    </div>
  );
}