import toast from 'react-hot-toast';

import WorkflowButton from './WorkflowButton';

import {
  useArchiveElection,
  useCloseElection,
  usePublishResults,
  useStartElection,
} from '../../hooks';

import { useElectionRefresh } from '../../context/ElectionContext';

import {ElectionService} from '../../services';

import { ElectionStatus } from '../../types';
import type { Election } from '../../types';

import { getErrorMessage } from '../../../../utils/api-error';

interface Props {
  election: Election;
}

export default function WorkflowActions({
  election,
}: Props) {
  const { refresh } =
    useElectionRefresh();

  const { start } =
    useStartElection();

  const { close } =
    useCloseElection();

  const { publishResults } =
    usePublishResults();

  const { archive } =
    useArchiveElection();

  async function execute(
    action: () => Promise<unknown>,
    message: string,
  ) {
    try {
      await action();

      toast.success(message);

      refresh();

    } catch (err: unknown) {

      toast.error(
        getErrorMessage(err, 'Operation failed.'),
      );

    }
  }

  switch (election.status) {

    case ElectionStatus.DRAFT:

      return (
        <WorkflowButton
          label="Submit"
          color="secondary"
          onClick={() =>
            execute(
              () =>
                ElectionService.submit(
                  election.id,
                ),
              'Submitted for approval.',
            )
          }
        />
      );

    case ElectionStatus.PENDING_APPROVAL:

      return (
        <WorkflowButton
          label="Approve"
          color="success"
          onClick={() =>
            execute(
              () =>
                ElectionService.approve(
                  election.id,
                ),
              'Election approved.',
            )
          }
        />
      );

    case ElectionStatus.APPROVED:

      return (
        <WorkflowButton
          label="Publish"
          color="primary"
          onClick={() =>
            execute(
              () =>
                ElectionService.publish(
                  election.id,
                ),
              'Election published.',
            )
          }
        />
      );

    case ElectionStatus.PUBLISHED:

      return (
        <WorkflowButton
          label="Start"
          color="success"
          onClick={() =>
            execute(
              () =>
                start(
                  election.id,
                ),
              'Election started.',
            )
          }
        />
      );

    case ElectionStatus.ACTIVE:

      return (
        <WorkflowButton
          label="Close"
          color="secondary"
          onClick={() =>
            execute(
              () =>
                close(
                  election.id,
                ),
              'Voting closed.',
            )
          }
        />
      );

    case ElectionStatus.VOTING_CLOSED:

      return (
        <WorkflowButton
          label="Publish Results"
          color="primary"
          onClick={() =>
            execute(
              () =>
                publishResults(
                  election.id,
                ),
              'Results published.',
            )
          }
        />
      );

    case ElectionStatus.RESULT_PUBLISHED:

      return (
        <WorkflowButton
          label="Archive"
          color="secondary"
          onClick={() =>
            execute(
              () =>
                archive(
                  election.id,
                ),
              'Election archived.',
            )
          }
        />
      );

    default:

      return null;

  }
}