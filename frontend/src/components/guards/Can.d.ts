import type { FC, ReactNode } from 'react';
interface CanProps {
  permissions: string | string[];
  requireAll?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}
declare const Can: FC<CanProps>;
export default Can;
