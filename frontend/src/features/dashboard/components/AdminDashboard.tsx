import { useMemo } from 'react';
import {
  Typography,
  Paper,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
  LinearProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  People as PeopleIcon,
  Security as SecurityIcon,
  VerifiedUser as VerifiedUserIcon,
  Wifi as WifiIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
} from '@mui/icons-material';
import { useDashboardStats } from '../api';
import { useNavigate } from 'react-router-dom';
import { useIsAdmin, useIsSuperAdmin } from '../../../hooks/usePermissions';

const StatCard = ({ title, value, icon, color, trend, loading }: { title: string; value: number | string; icon: React.ReactNode; color: string; trend?: { value: number; isUp: boolean }; loading?: boolean }) => (
  <Card sx={{ borderRadius: 2, height: '100%', position: 'relative', overflow: 'hidden' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Avatar sx={{ bgcolor: `${color}.main`, width: 48, height: 48 }}>{icon}</Avatar>
        {trend && (
          <Chip
            icon={trend.isUp ? <ArrowUpIcon /> : <ArrowDownIcon />}
            label={`${trend.value}%`}
            size="small"
            color={trend.isUp ? 'success' : 'error'}
            variant="outlined"
          />
        )}
      </Box>
      {loading ? (
        <Skeleton variant="text" width="60%" height={40} />
      ) : (
        <Typography variant="h3" fontWeight="bold" color={`${color}.main`}>
          {value}
        </Typography>
      )}
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {title}
      </Typography>
      <LinearProgress variant="determinate" value={typeof value === 'number' ? Math.min((value / 100) * 100, 100) : 0} sx={{ mt: 2, height: 4, borderRadius: 2, bgcolor: `${color}.light`, '& .MuiLinearProgress-bar': { bgcolor: `${color}.main` } }} />
    </CardContent>
  </Card>
);

const ActivityItem = ({ activity }: { activity: any }) => {
  const getActionColor = (actionCode: string) => {
    switch (actionCode) {
      case 'CREATE':
        return 'success';
      case 'UPDATE':
        return 'info';
      case 'DELETE':
        return 'error';
      case 'ASSIGN_ROLE':
        return 'warning';
      case 'LOGIN':
        return 'primary';
      default:
        return 'default';
    }
  };

  return (
    <TableRow hover>
      <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
        {activity.user || 'Système'}
      </TableCell>
      <TableCell>
        <Chip label={activity.action} size="small" color={getActionColor(activity.action_code) as any} variant="outlined" />
      </TableCell>
      <TableCell>{activity.model_name}</TableCell>
      <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{JSON.stringify(activity.details)}</TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{new Date(activity.timestamp).toLocaleString('fr-FR')}</TableCell>
    </TableRow>
  );
};

export default function AdminDashboard() {
  const { data: stats, isLoading, isError, error, refetch } = useDashboardStats();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isAdmin = useIsAdmin();
  const isSuperAdmin = useIsSuperAdmin();

  const quickActions = useMemo(() => {
    const actions = [
      { label: 'Nouvel utilisateur', path: '/users', icon: <PeopleIcon />, permission: 'accounts.add_user', roles: ['ADMIN', 'SUPERADMIN'] },
      { label: 'Gérer les rôles', path: '/roles', icon: <SecurityIcon />, permission: 'auth.change_group', roles: ['ADMIN', 'SUPERADMIN'] },
      { label: 'Permissions', path: '/permissions', icon: <VerifiedUserIcon />, permission: 'auth.view_permission', roles: ['SUPERADMIN'] },
    ];
    return actions.filter((action) => action.roles.some((role) => (role === 'ADMIN' ? isAdmin : role === 'SUPERADMIN' ? isSuperAdmin : false)));
  }, [isAdmin, isSuperAdmin]);

  if (isLoading) {
    return (
      <Box>
        <Skeleton variant="text" width="40%" height={48} sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton variant="rounded" height={140} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (isError || !stats) {
    return (
      <Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Tableau de bord
        </Typography>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography color="error" gutterBottom>
            {(error as Error)?.message || 'Impossible de charger les données'}
          </Typography>
          <Button variant="outlined" onClick={() => refetch()}>
            Réessayer
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Tableau de bord
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Vue d'ensemble de la plateforme
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {quickActions.map((action) => (
            <Button key={action.label} variant="outlined" startIcon={action.icon} onClick={() => navigate(action.path)}>
              {action.label}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Utilisateurs" value={stats.total_users} icon={<PeopleIcon />} color="primary" trend={{ value: 12, isUp: true }} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Rôles" value={stats.total_roles} icon={<SecurityIcon />} color="secondary" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Permissions" value={stats.total_permissions} icon={<VerifiedUserIcon />} color="success" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Utilisateurs actifs" value={stats.online_users} icon={<WifiIcon />} color="info" trend={{ value: 5, isUp: true }} />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard title="Activités récentes" value={stats.recent_activities.length} icon={<HistoryIcon />} color="warning" />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderRadius: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => navigate('/users')}>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                Voir plus
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Accéder aux détails
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Répartition des rôles
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              {[
                { label: 'Super Admin', value: 1, color: 'error' },
                { label: 'Admin', value: 2, color: 'primary' },
                { label: 'Récupérateur', value: 5, color: 'success' },
                { label: 'Agent', value: 10, color: 'info' },
                { label: 'Observateur', value: 3, color: 'warning' },
              ].map((item) => (
                <Box key={item.label}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{item.label}</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {item.value}
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={(item.value / 20) * 100} sx={{ height: 8, borderRadius: 4, bgcolor: `${item.color}.light`, '& .MuiLinearProgress-bar': { bgcolor: `${item.color}.main` } }} />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Activité par module
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              {[
                { label: 'Utilisateurs', value: 85, color: 'primary' },
                { label: 'Rôles', value: 60, color: 'secondary' },
                { label: 'Permissions', value: 45, color: 'success' },
                { label: 'Opérations', value: 70, color: 'info' },
                { label: 'Archive', value: 30, color: 'warning' },
              ].map((item) => (
                <Box key={item.label}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{item.label}</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {item.value}%
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={item.value} sx={{ height: 8, borderRadius: 4, bgcolor: `${item.color}.light`, '& .MuiLinearProgress-bar': { bgcolor: `${item.color}.main` } }} />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Latest Activity */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">
              Dernières activités
            </Typography>
          </Box>
          <Button variant="text" onClick={() => navigate('/audit-log')}>
            Voir tout
          </Button>
        </Box>
        <Divider />
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table stickyHeader size={isMobile ? 'small' : 'medium'}>
            <TableHead>
              <TableRow>
                <TableCell>Utilisateur</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Modèle</TableCell>
                <TableCell>Détails</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats.recent_activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
              {stats.recent_activities.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">Aucune activité récente</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
