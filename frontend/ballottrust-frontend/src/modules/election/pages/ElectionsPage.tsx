import { useState } from 'react';

import SearchInput from '../../../components/search/SearchInput';
import Pagination from '../../../components/pagination/Pagination';
import DataTable from '../../../components/table/DataTable';
import EmptyState from '../../../components/empty-state/EmptyState';
import TableSkeleton from '../../../components/skeleton/TableSkeleton';

import {
  useElections,
} from '../hooks';

import { electionColumns } from '../table';

export default function ElectionsPage() {

  const [search, setSearch] =
    useState('');

  const [page, setPage] =
    useState(1);

  const {
    elections,
    loading,
    totalPages,
  } = useElections({
    page,
    limit: 10,
    search,
  });

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