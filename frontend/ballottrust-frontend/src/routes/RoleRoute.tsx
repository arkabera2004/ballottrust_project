import { Navigate } from 'react-router-dom';

export default function RoleRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {
  const token =
    localStorage.getItem('token');

  const role =
    localStorage.getItem('userRole');

  console.log('ROLE ROUTE ROLE:', role);

  if (!token) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  if (
    !role ||
    !allowedRoles.includes(role)
  ) {
    console.log(
      'ROLE NOT ALLOWED'
    );

    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return <>{children}</>;
}