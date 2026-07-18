import type { ColumnDef } from '@tanstack/react-table';

import type { Election } from '../types';

import StatusBadge from '../../../components/badges/StatusBadge';

import ElectionActions from '../components/ElectionActions';

export const electionColumns: ColumnDef<Election>[] = [
  {
    accessorKey: 'electionCode',
    header: 'Code',
  },

  {
    accessorKey: 'title',
    header: 'Title',
  },

  {
    accessorKey: 'electionType',
    header: 'Type',
  },

  {
    accessorKey: 'status',
    header: 'Status',

    cell: ({ row }) => (
      <StatusBadge
        status={row.original.status}
      />
    ),
  },

  {
    accessorKey: 'startDate',
    header: 'Start',

    cell: ({ row }) =>
      new Date(
        row.original.startDate,
      ).toLocaleDateString(),
  },

  {
    accessorKey: 'endDate',
    header: 'End',

    cell: ({ row }) =>
      new Date(
        row.original.endDate,
      ).toLocaleDateString(),
  },

  {
    id: 'actions',
    header: 'Actions',

    cell: ({ row }) => (
      <ElectionActions
        election={row.original}
      />
    ),
  },
];