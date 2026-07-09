import type {
  ColumnDef,
} from '@tanstack/react-table';

import {
  Eye,
  Pencil,
  Trash2,
  Upload,
} from 'lucide-react';

import {
  Link,
} from 'react-router-dom';

import Button from '../../../components/buttons/Button';
import StatusBadge from '../../../components/badges/StatusBadge';

import type {
  Election,
} from '../types';

export const electionColumns = (
  onDelete: (
    id: string,
  ) => void,
): ColumnDef<Election>[] => [

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

    cell: ({ row }) => {

      const election =
        row.original;

      return (

        <div className="flex items-center gap-2">

          <Link
            to={`/elections/${election.id}`}
          >
            <Button
              size="sm"
              variant="outline"
            >
              <Eye size={16} />
            </Button>
          </Link>

          <Link
            to={`/elections/${election.id}/edit`}
          >
            <Button
              size="sm"
              variant="secondary"
            >
              <Pencil size={16} />
            </Button>
          </Link>

          <Button
            size="sm"
            variant="success"
          >
            <Upload size={16} />
          </Button>

          <Button
            size="sm"
            variant="danger"
            onClick={() =>
              onDelete(
                election.id,
              )
            }
          >
            <Trash2 size={16} />
          </Button>

        </div>

      );

    },

  },

];