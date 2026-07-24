import type { FC, ReactNode } from 'react';
interface RequirePermissionProps {
  permissions: string | string[];
  requireAll?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}
declare const RequirePermission: FC<RequirePermissionProps>;
export default RequirePermission;
