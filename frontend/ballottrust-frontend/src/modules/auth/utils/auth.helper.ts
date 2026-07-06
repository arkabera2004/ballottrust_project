export function isAdmin(
  role: string,
) {

  return (

    role === 'SUPER_ADMIN' ||

    role === 'ELECTION_COMMISSIONER'

  );

}

export function isCandidate(
  role: string,
) {

  return role === 'CANDIDATE';

}

export function isAuditor(
  role: string,
) {

  return role === 'AUDITOR';

}