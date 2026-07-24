import { Box, Typography, Paper, Button, Grid, Chip } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useIsAdmin, useIsSuperAdmin, useCanManageUsers, useCanManageRoles, useCanManagePermissions } from '../hooks/usePermissions';
import { AuthGuard, RoleGuard, PermissionGuard } from '../components/guards';

export default function AuthorizationExamples() {
  const isAdmin = useIsAdmin();
  const isSuperAdmin = useIsSuperAdmin();
  const canManageUsers = useCanManageUsers();
  const canManageRoles = useCanManageRoles();
  const canManagePermissions = useCanManagePermissions();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Exemples d'Autorisation
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Cette page démontre l'utilisation des guards d'autorisation.
      </Typography>

      <Grid container spacing={3}>
        {/* AuthGuard Example */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              AuthGuard
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Protège les routes nécessitant une authentification.
            </Typography>
            <AuthGuard>
              <Chip label="Utilisateur authentifié" color="success" />
            </AuthGuard>
          </Paper>
        </Grid>

        {/* RoleGuard Example */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              RoleGuard
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Protège les routes par rôle.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <RoleGuard allowedRoles={['ADMIN', 'SUPERADMIN']} fallback={<Chip label="Accès refusé" color="error" />}>
                <Chip label="Admin ou Super Admin" color="success" />
              </RoleGuard>
              <RoleGuard allowedRoles="SUPERADMIN" fallback={<Chip label="Accès refusé" color="error" />}>
                <Chip label="Super Admin uniquement" color="success" />
              </RoleGuard>
            </Box>
          </Paper>
        </Grid>

        {/* PermissionGuard Example */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              PermissionGuard
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Protège les routes par permission.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <PermissionGuard requiredPermissions="accounts.add_user" fallback={<Chip label="Accès refusé" color="error" />}>
                <Chip label="Peut créer des utilisateurs" color="success" />
              </PermissionGuard>
              <PermissionGuard requiredPermissions={['auth.change_group', 'auth.delete_group']} requireAll fallback={<Chip label="Accès refusé" color="error" />}>
                <Chip label="Peut modifier et supprimer des rôles" color="success" />
              </PermissionGuard>
            </Box>
          </Paper>
        </Grid>

        {/* Hooks Example */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Hooks
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Utilisez les hooks dans vos composants pour un contrôle conditionnel.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {isAdmin && <Chip label="isAdmin" color="primary" />}
              {isSuperAdmin && <Chip label="isSuperAdmin" color="secondary" />}
              {canManageUsers && <Chip label="canManageUsers" color="success" />}
              {canManageRoles && <Chip label="canManageRoles" color="info" />}
              {canManagePermissions && <Chip label="canManagePermissions" color="warning" />}
            </Box>
          </Paper>
        </Grid>

        {/* Hide/Disable Examples */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Masquer / Désactiver des éléments
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Utilisez les hooks pour masquer des boutons ou désactiver des actions.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {canManageUsers && (
                <Button variant="contained" startIcon={<PeopleIcon />}>
                  Créer un utilisateur
                </Button>
              )}
              {!canManageUsers && (
                <Button variant="contained" disabled startIcon={<PeopleIcon />}>
                  Créer un utilisateur
                </Button>
              )}
              {canManageRoles && (
                <Button variant="outlined" startIcon={<SecurityIcon />}>
                  Gérer les rôles
                </Button>
              )}
              {isSuperAdmin && (
                <Button variant="outlined" color="secondary" startIcon={<AdminPanelSettingsIcon />}>
                  Paramètres avancés
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
