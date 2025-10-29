import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ACCOUNT_TYPES } from '../constants/Rol';
import { PAGES_ROUTE } from "../constants/Pages";


interface RoleBasedRouteProps {
  allowedRoles: Array<typeof ACCOUNT_TYPES[keyof typeof ACCOUNT_TYPES]>;
  redirectTo?: string;
  children?: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (props: { user: any }) => React.ReactNode;
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  allowedRoles,
  redirectTo = PAGES_ROUTE.root,
  children,
  render,
}) => {
  const { user } = useAuth();

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to={PAGES_ROUTE.root} replace />;
  }

  // Check if user has any of the allowed roles
  const hasRequiredRole = user.role && allowedRoles.includes(user.role);

  if (!hasRequiredRole) {
    // Redirect to a default route or show unauthorized
    return <Navigate to={redirectTo} replace />;
  }

  // If user has required role, render the children, render prop, or outlet
  if (render) {
    return <>{render({ user })}</>;
  }
  return children ? <>{children}</> : <Outlet />;
};

export default RoleBasedRoute;
