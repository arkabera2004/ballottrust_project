import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

import Card from '../../../components/cards/Card';
import TableSkeleton from '../../../components/skeleton/TableSkeleton';

import ElectionForm from '../components/ElectionForm';

import {
  useElection,
  useUpdateElection,
} from '../hooks';

import type {
  CreateElectionForm,
} from '../schemas';

import type {
  UpdateElectionDto,
} from '../types';

export default function EditElectionPage() {

  const { id } = useParams();

  const navigate = useNavigate();

  const {
    election,
    loading,
  } = useElection(id);

  const {
    update,
    loading: updating,
  } = useUpdateElection();

  if (loading) {
    return <TableSkeleton />;
  }

  if (!election) {
    return (
      <div className="text-center py-20">
        Election not found.
      </div>
    );
  }

  async function handleUpdate(
    data: CreateElectionForm,
  ) {

    try {

      await update(
        id!,
        data as UpdateElectionDto,
      );

      toast.success(
        'Election updated successfully.',
      );

      navigate('/elections');

    }

    catch (error: any) {

      toast.error(
        error?.response?.data?.message ??
          'Failed to update election.',
      );

    }

  }

  return (

    <div className="mx-auto max-w-5xl space-y-6">

      <Card>

        <h1 className="text-3xl font-bold">
          Edit Election
        </h1>

        <p className="mt-2 text-slate-500">
          Update election details.
        </p>

      </Card>

      <ElectionForm
        defaultValues={{
            title: election.title,
            description: election.description ?? '',
            electionType: election.electionType,
            startDate: election.startDate,
            endDate: election.endDate,
            candidateLimit: election.candidateLimit,
            maximumVotes: election.maximumVotes,
            resultVisibility: election.resultVisibility,
            }}
        loading={updating}
        onSubmit={handleUpdate}
      />

    </div>

  );

}