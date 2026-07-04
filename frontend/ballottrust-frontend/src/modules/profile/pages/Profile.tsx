import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';

import DashboardLayout from '../../../components/layout/DashboardLayout';

import Button from '../../../components/ui/Button';

import AvatarCard from '../components/AvatarCard';
import PersonalInfo from '../components/PersonalInfo';
import AcademicInfo from '../components/AcademicInfo';
import AddressInfo from '../components/AddressInfo';
import AccountInfo from '../components/AccountInfo';

import { useProfile } from '../hooks/useProfile';
import avatarService from '../services/avatar.service';
import { useNavigate } from 'react-router-dom';

import {
  profileSchema,
  type ProfileFormData,
} from '../schemas/profile.schema';

export default function Profile() {
  const navigate = useNavigate();

  const {
    profile,
    loading,
    saving,
    updateProfile,
    reload,
  } = useProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: {
      errors,
      isDirty,
    },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {

    if (profile) {

      reset({

        ...profile,

        year: profile.year ?? undefined,

        semester: profile.semester ?? undefined,

      });

    }

  }, [profile, reset]);

  async function handleAvatarUpload(
    file: File,
  ) {

    try {

      await avatarService.uploadAvatar(file);

      toast.success(
        'Avatar updated successfully',
      );

      await reload();

    }

    catch (error) {

      console.error(error);

      toast.error(
        'Failed to upload avatar',
      );

    }

  }

  if (loading) {

    return (

      <DashboardLayout>

        <div className="flex items-center justify-center h-[70vh]">

          <div className="text-center">

            <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mx-auto" />

            <p className="mt-5 text-slate-600">

              Loading Profile...

            </p>

          </div>

        </div>

      </DashboardLayout>

    );

  }

  return (

    <DashboardLayout>

      <form
        onSubmit={handleSubmit(updateProfile)}
        className="max-w-7xl mx-auto"
      >

        {/* Header */}

        <div className="mb-10">

          <h1 className="text-4xl font-bold text-slate-900">

            My Profile

          </h1>

          <p className="text-slate-500 mt-2">

            Manage your personal information,
            academic details and account settings.

          </p>

        </div>

        {/* Content */}

        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left Sidebar */}

          <div className="space-y-8">

            <AvatarCard
              profile={profile}
              onAvatarSelect={handleAvatarUpload}
            />

          </div>

          {/* Right Content */}

          <div className="lg:col-span-2 space-y-8">

            <PersonalInfo
              register={register}
              errors={errors}
              profile={profile}
            />

            <AcademicInfo
              register={register}
              errors={errors}
            />

            <AddressInfo
              register={register}
              errors={errors}
            />

            <AccountInfo
              profile={profile}
            />

            {/* Save Button */}

            <div className="sticky bottom-6 bg-white rounded-2xl border border-slate-200 shadow-xl p-5">

              <div className="flex items-center justify-between">

                <div>

                  <h3 className="font-semibold">

                    Ready to save?

                  </h3>

                  <p className="text-sm text-slate-500">

                    Save your profile changes.

                  </p>

                </div>

                <div className="flex items-center gap-4">

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/change-password')}
                >
                  Change Password
                </Button>

                <Button
                  type="submit"
                  loading={saving}
                  disabled={!isDirty}
                >
                  Save Changes
                </Button>

              </div>

              </div>

            </div>

          </div>

        </div>

      </form>

    </DashboardLayout>

  );

}