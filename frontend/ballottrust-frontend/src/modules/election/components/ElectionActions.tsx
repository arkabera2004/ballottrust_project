import { Link } from 'react-router-dom';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

import Button from '../../../components/buttons/Button';

import WorkflowActions from './workflow/WorkflowActions';

import { ElectionService } from '../services';
import { useElectionRefresh } from '../context/ElectionContext';

import type { Election } from '../types';

interface Props {
  election: Election;
}

export default function ElectionActions({
  election,
}: Props) {
  const { refresh } = useElectionRefresh();

  async function deleteElection() {
    const result = await Swal.fire({
      title: 'Delete Election?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await ElectionService.delete(election.id);

      toast.success('Election deleted.');

      refresh();

    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ??
          'Delete failed.',
      );
    }
  }

  return (
    <div className="flex items-center gap-2">

      <Link to={`/elections/${election.id}`}>
        <Button
          size="sm"
          variant="outline"
        >
          <Eye size={16} />
        </Button>
      </Link>

      <Link to={`/elections/${election.id}/edit`}>
        <Button
          size="sm"
          variant="secondary"
        >
          <Pencil size={16} />
        </Button>
      </Link>

      <WorkflowActions election={election} />

      <Button
        size="sm"
        variant="danger"
        onClick={deleteElection}
      >
        <Trash2 size={16} />
      </Button>

    </div>
  );
}