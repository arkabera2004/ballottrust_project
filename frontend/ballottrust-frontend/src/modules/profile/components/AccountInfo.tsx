import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';

import type { Profile } from '../types/profile';

type Props = {
  profile: Profile | null;
};

type InfoRowProps = {
  label: string;
  value: React.ReactNode;
};

function InfoRow({
  label,
  value,
}: InfoRowProps) {

  return (

    <div className="flex items-center justify-between py-4 border-b border-slate-100 last:border-none">

      <span className="text-slate-500 font-medium">

        {label}

      </span>

      <div className="font-semibold">

        {value}

      </div>

    </div>

  );

}

export default function AccountInfo({
  profile,
}: Props) {

  return (

    <Card>

      <h2 className="text-2xl font-bold mb-8">

        Account Information

      </h2>

      <InfoRow
        label="Role"
        value={
          <Badge color="blue">
            {profile?.role ?? '-'}
          </Badge>
        }
      />

      <InfoRow
        label="Account Status"
        value={
          <Badge
            color={
              profile?.status === 'APPROVED'
                ? 'green'
                : profile?.status === 'REJECTED'
                ? 'red'
                : 'yellow'
            }
          >
            {profile?.status ?? '-'}
          </Badge>
        }
      />

      <InfoRow
        label="Authentication Provider"
        value={profile?.provider ?? '-'}
      />

      <InfoRow
        label="Email Verification"
        value={
          profile?.emailVerified ? (
            <Badge color="green">
              Verified
            </Badge>
          ) : (
            <Badge color="red">
              Not Verified
            </Badge>
          )
        }
      />

      <InfoRow
        label="Profile Completion"
        value={
          <Badge
            color={
              profile?.profileCompleted
                ? 'green'
                : 'yellow'
            }
          >
            {profile?.profileCompleted
              ? '100%'
              : '65%'}
          </Badge>
        }
      />

      <InfoRow
        label="Last Login"
        value={
          profile?.lastLogin
            ? new Date(
                profile.lastLogin,
              ).toLocaleString()
            : 'Never'
        }
      />

    </Card>

  );

}