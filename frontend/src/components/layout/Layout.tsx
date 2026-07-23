import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import AppBar from './AppBar';
import DynamicSidebar from './DynamicSidebar';

const DRAWER_WIDTH = 280;
const DRAWER_WIDTH_COLLAPSED = 72;

export default function Layout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const currentDrawerWidth = sidebarCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar drawerWidth={currentDrawerWidth} />
      <DynamicSidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { sm: `calc(100% - ${currentDrawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
          transition: theme.transitions.create('margin', { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.leavingScreen }),
        }}
      >
        <Toolbar />
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
