import { useState, useEffect, useMemo } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Collapse,
  useMediaQuery,
  useTheme,
  Tooltip,
  Chip,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { NavLink, useLocation } from 'react-router-dom';
import { useDrawerStore } from '../../store/drawerStore';
import { useAuthStore } from '../../store/authStore';
import { useHasPermission, useHasRole } from '../../hooks/usePermissions';
import { menuConfig, type MenuItem } from '../../config/menuConfig';

const DRAWER_WIDTH = 280;
const DRAWER_WIDTH_COLLAPSED = 72;

interface DynamicSidebarProps {
  onCollapseChange?: (collapsed: boolean) => void;
}

export default function DynamicSidebar({ onCollapseChange }: DynamicSidebarProps) {
  const { open, close } = useDrawerStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  const handleCollapse = (value: boolean) => {
    setCollapsed(value);
    onCollapseChange?.(value);
  };

  // Load favorites from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('sidebar-favorites');
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (itemId: string) => {
    setFavorites((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]));
  };

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]));
  };

  const hasAccess = (item: MenuItem): boolean => {
    if (item.roles) {
      const roles = Array.isArray(item.roles) ? item.roles : [item.roles];
      const hasRoleAccess = roles.some((role) => useHasRole(role));
      if (!hasRoleAccess) return false;
    }
    if (item.permission) {
      const permissions = Array.isArray(item.permission) ? item.permission : [item.permission];
      const hasPermAccess = permissions.some((perm) => useHasPermission(perm));
      if (!hasPermAccess) return false;
    }
    return true;
  };

  const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
    const query = searchQuery.toLowerCase();
    return items.filter((item) => {
      if (!hasAccess(item)) return false;
      if (!query) return true;
      const matchesSearch = item.text.toLowerCase().includes(query);
      const matchesChildren = item.children?.some((child) => child.text.toLowerCase().includes(query));
      return matchesSearch || matchesChildren;
    });
  };

  const visibleMenuItems = useMemo(() => filterMenuItems(menuConfig), [searchQuery, user]);

  const favoriteItems = useMemo(() => {
    return visibleMenuItems.filter((item) => favorites.includes(item.id));
  }, [visibleMenuItems, favorites]);

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const isExpanded = expandedItems.includes(item.id);
    const isFavorite = favorites.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const isActive = item.path && location.pathname === item.path;

    if (!hasAccess(item)) return null;

    const filteredChildren = item.children?.filter(hasAccess) || [];

    return (
      <ListItem key={item.id} disablePadding sx={{ display: 'block', mb: 0.5 }}>
        <ListItemButton
          component={hasChildren ? 'div' : NavLink}
          to={item.path}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            }
            if (isMobile) close();
          }}
          sx={{
            minHeight: 48,
            justifyContent: collapsed ? 'center' : 'initial',
            px: collapsed ? 2.5 : 2,
            pl: collapsed ? 2.5 : depth === 0 ? 2 : 4,
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
          <Tooltip title={collapsed ? item.text : ''} placement="right">
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: collapsed ? 0 : 2,
                justifyContent: 'center',
                color: isActive ? 'primary.main' : 'inherit',
              }}
            >
              {item.icon}
            </ListItemIcon>
          </Tooltip>
          {!collapsed && (
            <>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: depth === 0 ? '0.95rem' : '0.85rem',
                  fontWeight: isActive ? 600 : 400,
                }}
                sx={{ ml: 0 }}
              />
              {item.badge && (
                <Chip label={item.badge} size="small" color="primary" variant="filled" sx={{ height: 20, fontSize: '0.75rem' }} />
              )}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item.id);
                  }}
                  sx={{ p: 0.5 }}
                >
                  {isFavorite ? <StarIcon fontSize="small" color="warning" /> : <StarBorderIcon fontSize="small" />}
                </IconButton>
                {hasChildren && (
                  <IconButton size="small" onClick={() => toggleExpanded(item.id)} sx={{ p: 0.5 }}>
                    {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                  </IconButton>
                )}
              </Box>
            </>
          )}
        </ListItemButton>
        {hasChildren && !collapsed && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {filteredChildren.map((child) => renderMenuItem(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </ListItem>
    );
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar />
      <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {!collapsed && (
          <Typography variant="overline" color="text.secondary" fontWeight="bold">
            Menu principal
          </Typography>
        )}
        <IconButton size="small" onClick={() => setCollapsed(!collapsed)} sx={{ ml: 'auto' }}>
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Box>

      {!collapsed && (
        <Box sx={{ px: 2, pb: 1 }}>
          <TextField
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
        </Box>
      )}

      {!collapsed && favoriteItems.length > 0 && (
        <>
          <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <StarIcon fontSize="small" color="warning" />
            <Typography variant="caption" color="text.secondary" fontWeight="bold">
              Favoris
            </Typography>
          </Box>
          <List sx={{ flexGrow: 0, py: 0 }}>
            {favoriteItems.map((item) => renderMenuItem(item))}
          </List>
          <Divider sx={{ my: 1 }} />
        </>
      )}

      <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
        {visibleMenuItems.map((item) => renderMenuItem(item))}
      </List>

      {!collapsed && (
        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            {user?.first_name} {user?.last_name}
          </Typography>
          <Typography variant="caption" display="block" color="text.secondary">
            {user?.role_display || user?.role}
          </Typography>
        </Box>
      )}
    </Box>
  );

  if (isMobile) {
    return (
      <Box component="nav" sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={open}
          onClose={close}
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
    <Box component="nav" sx={{ width: { sm: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH }, flexShrink: { sm: 0 }, transition: theme.transitions.create('width', { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.enteringScreen }) }}>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
            borderRight: '1px solid',
            borderColor: 'divider',
            transition: theme.transitions.create('width', { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.enteringScreen }),
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
