import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  AccountCircle as AccountIcon,
  AdminPanelSettings as AdminIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  Assessment as AssessmentIcon,
  Inventory as InventoryIcon,
  LocalShipping as ShippingIcon,
  Description as DescriptionIcon,
  FactCheck as FactCheckIcon,
  Search as SearchIcon,
  Star as StarIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';

export interface MenuItem {
  id: string;
  text: string;
  icon: React.ReactNode;
  path?: string;
  permission?: string | string[];
  roles?: string | string[];
  children?: MenuItem[];
  badge?: string | number;
  favorite?: boolean;
}

export const menuConfig: MenuItem[] = [
  {
    id: 'dashboard',
    text: 'Tableau de bord',
    icon: <DashboardIcon />,
    path: '/dashboard',
    permission: undefined,
    favorite: true,
  },
  {
    id: 'profile',
    text: 'Mon Profil',
    icon: <AccountIcon />,
    path: '/profile',
    permission: undefined,
    favorite: true,
  },
  {
    id: 'users',
    text: 'Utilisateurs',
    icon: <PeopleIcon />,
    path: '/users',
    permission: 'accounts.view_user',
    roles: ['ADMIN', 'SUPERADMIN'],
    favorite: true,
  },
  {
    id: 'roles',
    text: 'Rôles',
    icon: <SecurityIcon />,
    path: '/roles',
    permission: 'auth.view_group',
    roles: ['ADMIN', 'SUPERADMIN'],
    favorite: true,
  },
  {
    id: 'permissions',
    text: 'Permissions',
    icon: <AdminIcon />,
    path: '/permissions',
    permission: 'auth.view_permission',
    roles: 'SUPERADMIN',
  },
  {
    id: 'operations',
    text: 'Opérations',
    icon: <InventoryIcon />,
    permission: undefined,
    roles: ['ADMIN', 'SUPERADMIN', 'RECUPERATEUR'],
    children: [
      {
        id: 'bon-commande',
        text: 'Bons de Commande',
        icon: <DescriptionIcon />,
        path: '/bc',
        permission: 'bc.view_boncommande',
      },
      {
        id: 'bon-livraison',
        text: 'Bons de Livraison',
        icon: <ShippingIcon />,
        path: '/bl',
        permission: 'bl.view_bonlivraison',
      },
      {
        id: 'bsd',
        text: 'BSD',
        icon: <FactCheckIcon />,
        path: '/bsd',
        permission: 'bsd.view_bsd',
      },
      {
        id: 'declarations',
        text: 'Déclarations',
        icon: <AssessmentIcon />,
        path: '/declarations',
        permission: 'declarations.view_declaration',
      },
      {
        id: 'inspections',
        text: 'Procès-verbaux',
        icon: <FactCheckIcon />,
        path: '/inspections',
        permission: 'inspections.view_procesverbal',
      },
    ],
  },
  {
    id: 'nomenclature',
    text: 'Nomenclature',
    icon: <SettingsIcon />,
    path: '/nomenclature',
    permission: 'nomenclature.view_designationdechet',
  },
  {
    id: 'archive',
    text: 'Archive',
    icon: <HistoryIcon />,
    path: '/archive',
    permission: 'archive.view_document',
  },
  {
    id: 'audit-log',
    text: 'Journal d\'audit',
    icon: <HistoryIcon />,
    path: '/audit-log',
    permission: 'accounts.view_auditlog',
    roles: ['ADMIN', 'SUPERADMIN'],
  },
];

export const getMenuIcon = (iconName: string): React.ReactNode => {
  const icons: Record<string, React.ReactNode> = {
    Dashboard: <DashboardIcon />,
    People: <PeopleIcon />,
    Security: <SecurityIcon />,
    AccountCircle: <AccountIcon />,
    AdminPanelSettings: <AdminIcon />,
    Settings: <SettingsIcon />,
    History: <HistoryIcon />,
    Assessment: <AssessmentIcon />,
    Inventory: <InventoryIcon />,
    LocalShipping: <ShippingIcon />,
    Description: <DescriptionIcon />,
    FactCheck: <FactCheckIcon />,
    Search: <SearchIcon />,
    Star: <StarIcon />,
    ExpandLess: <ExpandLessIcon />,
    ExpandMore: <ExpandMoreIcon />,
    ChevronLeft: <ChevronLeftIcon />,
    ChevronRight: <ChevronRightIcon />,
  };
  return icons[iconName] || <SettingsIcon />;
};
