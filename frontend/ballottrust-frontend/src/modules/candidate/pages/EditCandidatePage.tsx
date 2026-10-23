import { useEffect, useState } from 'react';
import {
  useNavigate,
  useParams,
} from 'react-router-dom';
import {
  useForm,
} from 'react-hook-form';
import {
  zodResolver,
} from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

import Card from '../../../components/cards/Card';

import { getErrorMessage } from '../../../utils/api-error';

import {
  createCandidateSchema,
  type CreateCandidateForm,
} from '../schemas';

import {
  CandidateService,
} from '../services';

import {
  useCandidateActions,
} from '../hooks';

export default function EditCandidatePage() {
  const navigate = useNavigate();

  const { id } = useParams<{
    id: string;
  }>();

  const {
    update,
    loading: updating,
  } = useCandidateActions();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: {
      errors,
    },
  } = useForm<CreateCandidateForm>({
    resolver: zodResolver(
      createCandidateSchema,
    ),

    defaultValues: {
      electionId: '',
      candidateType: 'INDEPENDENT',
      partyId: '',
      position: '',
      biography: '',
      campaignSlogan: '',
      campaignWebsite: '',
      manifesto: '',
      agenda: '',
      achievements: '',
      nominationStatement: '',
      photoUrl: '',
      documentUrl: '',
    },
  });

  const candidateType =
    watch('candidateType');

  const {
    data,
    isLoading,
    error,
  } = useCandidateForEdit(id);

  useEffect(() => {
    if (!data) {
      return;
    }

    reset({
      electionId:
        data.electionId ?? '',

      candidateType:
        data.candidateType,

      partyId:
        data.partyId ?? '',

      position:
        data.position ?? '',

      biography:
        data.biography ?? '',

      campaignSlogan:
        data.campaignSlogan ?? '',

      campaignWebsite:
        data.campaignWebsite ?? '',

      manifesto:
        data.manifesto ?? '',

      agenda:
        data.agenda ?? '',

      achievements:
        data.achievements ?? '',

      nominationStatement:
        data.nominationStatement ?? '',

      photoUrl:
        data.photoUrl ?? '',

      documentUrl:
        data.documentUrl ?? '',
    });
  }, [data, reset]);

  async function handleUpdate(
    formData: CreateCandidateForm,
  ) {
    if (!id) {
      toast.error(
        'Candidate ID is missing.',
      );

      return;
    }

    try {
      const payload = {
        candidateType:
          formData.candidateType,

        position:
          formData.position,

        biography:
          formData.biography || undefined,

        campaignSlogan:
          formData.campaignSlogan ||
          undefined,

        campaignWebsite:
          formData.campaignWebsite ||
          undefined,

        manifesto:
          formData.manifesto ||
          undefined,

        agenda:
          formData.agenda ||
          undefined,

        achievements:
          formData.achievements ||
          undefined,

        nominationStatement:
          formData.nominationStatement,

        photoUrl:
          formData.photoUrl ||
          undefined,

        documentUrl:
          formData.documentUrl ||
          undefined,
      };

      if (
        formData.candidateType ===
          'PARTY' &&
        formData.partyId
      ) {
        Object.assign(payload, {
          partyId:
            formData.partyId,
        });
      } else if (
        formData.candidateType ===
        'INDEPENDENT'
      ) {
        Object.assign(payload, {
          partyId: undefined,
        });
      }

      await update(
        id,
        payload,
      );

      toast.success(
        'Nomination updated successfully.',
      );

      navigate('/candidate');

    } catch (err: unknown) {
      toast.error(
        getErrorMessage(err, 'Unable to update nomination.'),
      );
    }
  }

  if (!id) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-5xl">
          <Card>
            <h1 className="text-2xl font-bold text-red-700">
              Invalid Candidate
            </h1>

            <p className="mt-2 text-slate-500">
              Candidate ID is missing.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-5xl space-y-6">

          <Card>
            <div className="h-8 w-72 animate-pulse rounded bg-slate-200" />

            <div className="mt-3 h-5 w-96 animate-pulse rounded bg-slate-200" />
          </Card>

          <Card>
            <div className="space-y-5">
              <div className="h-12 animate-pulse rounded bg-slate-200" />
              <div className="h-12 animate-pulse rounded bg-slate-200" />
              <div className="h-32 animate-pulse rounded bg-slate-200" />
              <div className="h-32 animate-pulse rounded bg-slate-200" />
            </div>
          </Card>

        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-5xl">

          <Card>
            <h1 className="text-2xl font-bold text-red-700">
              Unable to Load Nomination
            </h1>

            <p className="mt-2 text-slate-500">
              {error ??
                'Candidate nomination could not be found.'}
            </p>

            <button
              type="button"
              onClick={() =>
                navigate('/candidate')
              }
              className="mt-5 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
            >
              Back to Dashboard
            </button>
          </Card>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-5xl space-y-6">

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4">

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Edit Nomination
              </h1>

              <p className="mt-2 text-slate-500">
                Update your nomination details below.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                navigate('/candidate')
              }
              disabled={updating}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Back
            </button>

          </div>
        </Card>

        <Card>
          <form
            onSubmit={handleSubmit(
              handleUpdate,
            )}
            className="space-y-6"
          >

            {/* Candidate Type */}

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Candidate Type
              </label>

              <select
                {...register(
                  'candidateType',
                )}
                disabled={updating}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3"
              >
                <option value="INDEPENDENT">
                  Independent
                </option>

                <option value="PARTY">
                  Party
                </option>
              </select>

              {errors.candidateType && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.candidateType.message}
                </p>
              )}
            </div>

            {/* Party */}

            {candidateType ===
              'PARTY' && (
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Party ID
                </label>

                <input
                  {...register('partyId')}
                  disabled={updating}
                  placeholder="Enter valid Party UUID"
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3"
                />

                {errors.partyId && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.partyId.message}
                  </p>
                )}
              </div>
            )}

            {/* Position */}

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Position
              </label>

              <input
                {...register('position')}
                disabled={updating}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3"
              />

              {errors.position && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.position.message}
                </p>
              )}
            </div>

            {/* Biography */}

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Biography
              </label>

              <textarea
                {...register(
                  'biography',
                )}
                disabled={updating}
                rows={4}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3"
              />

              {errors.biography && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.biography.message}
                </p>
              )}
            </div>

            {/* Campaign Slogan */}

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Campaign Slogan
              </label>

              <input
                {...register(
                  'campaignSlogan',
                )}
                disabled={updating}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3"
              />

              {errors.campaignSlogan && (
                <p className="mt-1 text-sm text-red-600">
                  {
                    errors.campaignSlogan
                      .message
                  }
                </p>
              )}
            </div>

            {/* Campaign Website */}

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Campaign Website
              </label>

              <input
                {...register(
                  'campaignWebsite',
                )}
                disabled={updating}
                placeholder="https://example.com"
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3"
              />

              {errors.campaignWebsite && (
                <p className="mt-1 text-sm text-red-600">
                  {
                    errors
                      .campaignWebsite
                      .message
                  }
                </p>
              )}
            </div>

            {/* Manifesto */}

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Manifesto
              </label>

              <textarea
                {...register(
                  'manifesto',
                )}
                disabled={updating}
                rows={6}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3"
              />

              {errors.manifesto && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.manifesto.message}
                </p>
              )}
            </div>

            {/* Agenda */}

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Agenda
              </label>

              <textarea
                {...register('agenda')}
                disabled={updating}
                rows={5}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3"
              />

              {errors.agenda && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.agenda.message}
                </p>
              )}
            </div>

            {/* Achievements */}

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Achievements
              </label>

              <textarea
                {...register(
                  'achievements',
                )}
                disabled={updating}
                rows={5}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3"
              />

              {errors.achievements && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.achievements.message}
                </p>
              )}
            </div>

            {/* Nomination Statement */}

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Nomination Statement
              </label>

              <textarea
                {...register(
                  'nominationStatement',
                )}
                disabled={updating}
                rows={6}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3"
              />

              {errors.nominationStatement && (
                <p className="mt-1 text-sm text-red-600">
                  {
                    errors
                      .nominationStatement
                      .message
                  }
                </p>
              )}
            </div>

            {/* Photo URL */}

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Photo URL
              </label>

              <input
                {...register('photoUrl')}
                disabled={updating}
                placeholder="https://example.com/photo.jpg"
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3"
              />

              {errors.photoUrl && (
                <p className="mt-1 text-sm text-red-600">
                  {
                    errors.photoUrl
                      .message
                  }
                </p>
              )}
            </div>

            {/* Document URL */}

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Document URL
              </label>

              <input
                {...register(
                  'documentUrl',
                )}
                disabled={updating}
                placeholder="https://example.com/document.pdf"
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3"
              />

              {errors.documentUrl && (
                <p className="mt-1 text-sm text-red-600">
                  {
                    errors.documentUrl
                      .message
                  }
                </p>
              )}
            </div>

            {/* Actions */}

            <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-5">

              <button
                type="submit"
                disabled={updating}
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updating
                  ? 'Saving...'
                  : 'Save Changes'}
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate('/candidate')
                }
                disabled={updating}
                className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

            </div>

          </form>
        </Card>

      </div>
    </div>
  );
}

/* ============================================================
   Candidate Loader
============================================================ */

function useCandidateForEdit(
  id?: string,
) {
  const [state, setState] =
    useState<{
      data: Awaited<
        ReturnType<
          typeof CandidateService.getById
        >
      > | null;
      isLoading: boolean;
      error: string | null;
    }>({
      data: null,
      isLoading: Boolean(id),
      error: null,
    });

  useEffect(() => {
    const candidateId = id;

    if (!candidateId) {
      setState({
        data: null,
        isLoading: false,
        error: 'Candidate ID is missing.',
      });

      return;
    }

    let mounted = true;

    async function load() {
      try {
        setState({
          data: null,
          isLoading: true,
          error: null,
        });

        const candidate =
          await CandidateService.getById(
            candidateId as string,
          );

        if (!mounted) {
          return;
        }

        setState({
          data: candidate,
          isLoading: false,
          error: null,
        });
      } catch (err: unknown) {
        if (!mounted) {
          return;
        }

        setState({
          data: null,
          isLoading: false,
          error: getErrorMessage(err, 'Unable to load candidate nomination.'),
        });
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [id]);

  return state;
}