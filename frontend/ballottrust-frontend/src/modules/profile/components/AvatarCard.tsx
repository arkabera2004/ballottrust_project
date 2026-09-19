import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import Avatar from '../../../components/ui/Avatar';

import AvatarUpload from './AvatarUpload';

import type { Profile } from '../types/profile';
import { ENV } from '../../../config/env';

type Props = {
  profile: Profile | null;
  onAvatarSelect: (file: File) => void;
};

export default function AvatarCard({
  profile,
  onAvatarSelect,
}: Props) {

  const completion =
    profile?.profileCompleted
      ? 100
      : 65;

  return (

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >

      <Card>

        <div className="flex flex-col items-center">

          <div className="relative">

            <Avatar
              src={
                profile?.avatarUrl
                  ? `${ENV.API_URL}${profile.avatarUrl}`
                  : undefined
              }
              name={profile?.fullName}
              size={150}
            />

            <AvatarUpload
              onSelect={onAvatarSelect}
            />

          </div>

          <h2 className="mt-6 text-2xl font-bold">

            {profile?.fullName}

          </h2>

          <p className="text-slate-500 mt-2">

            {profile?.email}

          </p>

          <div className="mt-5">

            <Badge>

              {profile?.role}

            </Badge>

          </div>

          <div className="mt-5">

            {profile?.emailVerified ? (

              <span className="flex items-center gap-2 text-green-600 font-semibold">

                <CheckCircle2 size={18} />

                Email Verified

              </span>

            ) : (

              <span className="text-red-500">

                Email Not Verified

              </span>

            )}

          </div>

        </div>

        <div className="border-t border-slate-200 my-8" />

        <div>

          <div className="flex justify-between mb-3">

            <span className="font-semibold">

              Profile Completion

            </span>

            <span>

              {completion}%

            </span>

          </div>

          <div className="h-3 rounded-full bg-slate-200">

            <div
              className="h-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600"
              style={{
                width: `${completion}%`,
              }}
            />

          </div>

        </div>

      </Card>

    </motion.div>

  );

}