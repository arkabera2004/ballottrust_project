import { useState } from 'react';
import toast from 'react-hot-toast';

import SearchInput from '../../../components/search/SearchInput';
import Pagination from '../../../components/pagination/Pagination';
import DataTable from '../../../components/table/DataTable';
import EmptyState from '../../../components/empty-state/EmptyState';
import TableSkeleton from '../../../components/skeleton/TableSkeleton';

import {
  useDeleteElection,
  useElections,
} from '../hooks';

import { electionColumns } from '../table';

import { confirmDelete } from '../../../shared/utils/confirm';

export default function ElectionsPage() {

  const [search, setSearch] =
    useState('');

  const [page, setPage] =
    useState(1);

  const {
    elections,
    loading,
    totalPages,
    refresh,
  } = useElections({
    page,
    limit: 10,
    search,
  });

  const {
    remove,
  } = useDeleteElection();

  async function handleDelete(
    id: string,
  ) {

    const confirmed =
      await confirmDelete();

    if (!confirmed) return;

    try {

      await remove(id);

      toast.success(
        'Election deleted successfully.',
      );

      refresh();

    } catch {

      toast.error(
        'Unable to delete election.',
      );

    }

  }

  if (loading) {
    return <TableSkeleton />;
  }

  if (
    !loading &&
    elections.length === 0
  ) {
    return (
      <EmptyState
        title="No Elections"
        description="Create your first election."
      />
    );
  }

  return (

    <div className="space-y-6">

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search Elections..."
      />

      <DataTable
        data={elections}
        columns={electionColumns}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

    </div>

  );

}