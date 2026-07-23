import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Dashboard as DashboardIcon, People as PeopleIcon, Security as SecurityIcon, AccountCircle as AccountIcon, AdminPanelSettings as AdminIcon } from '@mui/icons-material';
import { NavLink } from 'react-router-dom';
import { useDrawerStore } from '../../store/drawerStore';
import { useIsAdmin, useIsSuperAdmin, useCanManageUsers, useCanManageRoles, useCanManagePermissions } from '../../hooks/usePermissions';

const DRAWER_WIDTH = 240;

const menuItems = [
  { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/dashboard', requiredRole: undefined, requiredPermission: undefined },
  { text: 'Mon Profil', icon: <AccountIcon />, path: '/profile', requiredRole: undefined, requiredPermission: undefined },
  { text: 'Utilisateurs', icon: <PeopleIcon />, path: '/users', requiredRole: ['ADMIN', 'SUPERADMIN'], requiredPermission: 'accounts.view_user' },
  { text: 'Rôles', icon: <SecurityIcon />, path: '/roles', requiredRole: ['ADMIN', 'SUPERADMIN'], requiredPermission: 'auth.view_group' },
  { text: 'Permissions', icon: <AdminIcon />, path: '/permissions', requiredRole: 'SUPERADMIN', requiredPermission: 'auth.view_permission' },
];

export default function Sidebar({ drawerWidth }: { drawerWidth: number }) {
  const { open, toggle } = useDrawerStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isAdmin = useIsAdmin();
  const isSuperAdmin = useIsSuperAdmin();
  const canManageUsers = useCanManageUsers();
  const canManageRoles = useCanManageRoles();
  const canManagePermissions = useCanManagePermissions();

  const hasAccess = (item: typeof menuItems[0]): boolean => {
    if (item.requiredRole) {
      const roles = Array.isArray(item.requiredRole) ? item.requiredRole : [item.requiredRole];
      if (!roles.some((role) => (role === 'ADMIN' ? isAdmin : role === 'SUPERADMIN' ? isSuperAdmin : false))) {
        return false;
      }
    }
    if (item.requiredPermission) {
      const permissions = Array.isArray(item.requiredPermission) ? item.requiredPermission : [item.requiredPermission];
      const hasPerm = permissions.some((perm) => {
        if (perm === 'accounts.view_user') return canManageUsers;
        if (perm === 'auth.view_group') return canManageRoles;
        if (perm === 'auth.view_permission') return canManagePermissions;
        return false;
      });
      if (!hasPerm) return false;
    }
    return true;
  };

  const visibleItems = menuItems.filter(hasAccess);

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar />
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="overline" color="text.secondary" fontWeight="bold">
          Menu principal
        </Typography>
      </Box>
      <List sx={{ flexGrow: 1 }}>
        {visibleItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={NavLink}
              to={item.path}
              onClick={isMobile ? toggle : undefined}
              sx={{
                borderRadius: 1,
                mx: 1,
                '&.active': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.contrastText',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  if (isMobile) {
    return (
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={open}
          onClose={toggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>
    );
  }

  return (
    <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, borderRight: '1px solid', borderColor: 'divider' },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
