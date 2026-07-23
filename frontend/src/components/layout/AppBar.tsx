import { useState } from 'react';
import { AppBar as MuiAppBar, Toolbar, Typography, IconButton, Box, Button, Menu, MenuItem, Avatar, Divider, ListItemIcon } from '@mui/material';
import { Menu as MenuIcon, Logout as LogoutIcon, Person as PersonIcon } from '@mui/icons-material';
import { useDrawerStore } from '../../store/drawerStore';
import { useLogout } from '../../features/auth/api';
import { useCurrentUser } from '../../features/auth/api';
import { useNavigate } from 'react-router-dom';

interface AppBarProps {
  drawerWidth: number;
}

export default function AppBar({ drawerWidth }: AppBarProps) {
  const toggleDrawer = useDrawerStore((s) => s.toggle);
  const logoutMutation = useLogout();
  const { data: user } = useCurrentUser();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleLogout = () => {
    setAnchorEl(null);
    logoutMutation.mutate();
  };

  const handleProfileClick = () => {
    setAnchorEl(null);
    navigate('/profile');
  };

  return (
    <MuiAppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        bgcolor: 'primary.main',
        transition: (theme) => theme.transitions.create(['margin', 'width'], { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.leavingScreen }),
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={toggleDrawer}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
          RecupIndurex
        </Typography>

        {/* User Menu */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={(e) => setAnchorEl(e.currentTarget)}
            size="small"
            sx={{ ml: 2 }}
            aria-controls="user-menu"
            aria-haspopup="true"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: '0.875rem' }}>
              {user?.first_name?.[0] || user?.username?.[0]?.toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu
            id="user-menu"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            onClick={() => setAnchorEl(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {user?.first_name} {user?.last_name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                @{user?.username}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleProfileClick}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              Mon Profil
            </MenuItem>
            <MenuItem onClick={handleLogout} disabled={logoutMutation.isPending}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              {logoutMutation.isPending ? 'Déconnexion...' : 'Déconnexion'}
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </MuiAppBar>
  );
}
