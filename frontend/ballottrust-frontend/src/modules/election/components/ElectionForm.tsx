import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Button from '../../../components/buttons/Button';
import Input from '../../../components/inputs/Input';
import TextArea from '../../../components/inputs/TextArea';
import Select from '../../../components/inputs/Select';
import Card from '../../../components/cards/Card';

import {
  createElectionSchema,
  type CreateElectionForm,
} from '../schemas';

import {
  ElectionType,
  ResultVisibility,
} from '../types';

interface Props {
  defaultValues?: Partial<CreateElectionForm>;
  loading?: boolean;

  onSubmit: (
    data: CreateElectionForm,
  ) => void | Promise<void>;
}

export default function ElectionForm({
  defaultValues,
  loading = false,
  onSubmit,
}: Props) {

  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
    },
  } = useForm<CreateElectionForm>({
    resolver: zodResolver(
      createElectionSchema,
    ),

    defaultValues: {

      allowRevote: false,

      blockchainEnabled: true,

      auditEnabled: true,

      autoPublish: false,

      autoArchive: false,

      ...defaultValues,

    },
  });

  useEffect(() => {

    if (!defaultValues) return;

    reset({

      allowRevote: false,

      blockchainEnabled: true,

      auditEnabled: true,

      autoPublish: false,

      autoArchive: false,

      ...defaultValues,

    });

  }, [
    defaultValues,
    reset,
  ]);

  return (

    <form
      onSubmit={handleSubmit(onSubmit)}
    >

      <Card className="space-y-6">

        <div>

          <label className="mb-2 block font-medium">
            Title
          </label>

          <Input
            {...register('title')}
          />

          <p className="mt-1 text-sm text-red-600">
            {errors.title?.message}
          </p>

        </div>

        <div>

          <label className="mb-2 block font-medium">
            Description
          </label>

          <TextArea
            rows={4}
            {...register(
              'description',
            )}
          />

          <p className="mt-1 text-sm text-red-600">
            {errors.description?.message}
          </p>

        </div>

        <div>

          <label className="mb-2 block font-medium">
            Election Type
          </label>

          <Select
            {...register(
              'electionType',
            )}
          >

            {Object.values(
              ElectionType,
            ).map((type) => (

              <option
                key={type}
                value={type}
              >
                {type.replaceAll(
                  '_',
                  ' ',
                )}
              </option>

            ))}

          </Select>

        </div>

        <div className="grid grid-cols-2 gap-6">

          <div>

            <label className="mb-2 block">
              Start Date
            </label>

            <Input
              type="datetime-local"
              {...register(
                'startDate',
              )}
            />

          </div>

          <div>

            <label className="mb-2 block">
              End Date
            </label>

            <Input
              type="datetime-local"
              {...register(
                'endDate',
              )}
            />

          </div>

        </div>

        <div className="grid grid-cols-2 gap-6">

          <div>

            <label className="mb-2 block">
              Candidate Limit
            </label>

            <Input
              type="number"
              {...register(
                'candidateLimit',
                {
                  valueAsNumber: true,
                },
              )}
            />

          </div>

          <div>

            <label className="mb-2 block">
              Maximum Votes
            </label>

            <Input
              type="number"
              {...register(
                'maximumVotes',
                {
                  valueAsNumber: true,
                },
              )}
            />

          </div>

        </div>

        <div>

          <label className="mb-2 block">
            Result Visibility
          </label>

          <Select
            {...register(
              'resultVisibility',
            )}
          >

            {Object.values(
              ResultVisibility,
            ).map(
              (
                visibility,
              ) => (

                <option
                  key={
                    visibility
                  }
                  value={
                    visibility
                  }
                >
                  {visibility.replaceAll(
                    '_',
                    ' ',
                  )}
                </option>

              ),
            )}

          </Select>

        </div>

        <Button
          loading={loading}
          type="submit"
        >
          Save Election
        </Button>

      </Card>

    </form>

  );

}