import { RoleGuard, PermissionGuard } from '../../../components/guards';
import AdminDashboard from '../dashboard/components/AdminDashboard';

export default function DashboardPage() {
  return (
    <RoleGuard allowedRoles={['ADMIN', 'SUPERADMIN']} fallback={<SimpleDashboard />}>
      <AdminDashboard />
    </RoleGuard>
  );
}

function SimpleDashboard() {
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Tableau de bord
      </Typography>
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography color="text.secondary">
          Bienvenue ! Utilisez le menu pour naviguer dans l'application.
        </Typography>
      </Paper>
    </Box>
  );
}
