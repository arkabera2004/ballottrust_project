import { useEffect, useState } from 'react';
import profileService from '../services/profile.service';

type Profile = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;

  avatarUrl?: string;

  bio?: string;

  phoneNumber?: string;

  department?: string;

  course?: string;

  year?: number;

  semester?: number;

  registrationNumber?: string;

  address?: string;

  city?: string;

  state?: string;

  country?: string;

  postalCode?: string;

  emailVerified: boolean;

  provider: string;

  profileCompleted: boolean;

  lastLogin?: string;
};

export default function Profile() {

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    loadProfile();

  }, []);

  async function loadProfile() {

    try {

      const data =
        await profileService.getMyProfile();

      setProfile(data);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  }

  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center">

        <h2 className="text-xl font-semibold">

          Loading Profile...

        </h2>

      </div>

    );

  }

  return (

    <div className="min-h-screen bg-slate-100 p-8">

      <div className="max-w-7xl mx-auto">

        <h1 className="text-4xl font-bold mb-8">

          My Profile

        </h1>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* LEFT CARD */}

          <div className="bg-white rounded-2xl shadow-lg p-8">

            <div className="flex flex-col items-center">

              <div className="w-36 h-36 rounded-full bg-blue-100 flex items-center justify-center text-5xl font-bold text-blue-700">

                {profile?.fullName
                  ?.charAt(0)
                  .toUpperCase()}

              </div>

              <h2 className="text-2xl font-bold mt-6">

                {profile?.fullName}

              </h2>

              <p className="text-gray-500">

                {profile?.email}

              </p>

              <span className="mt-4 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold">

                {profile?.role}

              </span>

            </div>

          </div>

          {/* RIGHT SIDE */}

          <div className="lg:col-span-2">

            <div className="bg-white rounded-2xl shadow-lg p-8">

              <h2 className="text-2xl font-bold mb-6">

                Personal Information

              </h2>

              {/* Form will come in Part 2 */}

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}