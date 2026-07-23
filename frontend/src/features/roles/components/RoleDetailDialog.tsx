import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  Chip,
  Divider,
  Grid,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import { Security, People, VerifiedUser } from '@mui/icons-material';
import { useRoleDetail } from '../api';

interface RoleDetailDialogProps {
  open: boolean;
  onClose: () => void;
  roleId: number | null;
}

export default function RoleDetailDialog({ open, onClose, roleId }: RoleDetailDialogProps) {
  const { data: role, isLoading, isError } = useRoleDetail(roleId || 0);

  if (!roleId) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Détails du rôle</DialogTitle>
      <DialogContent>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}
        {isError && (
          <Typography color="error">Impossible de charger les détails du rôle</Typography>
        )}
        {role && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: 'secondary.main' }}>
                {role.name?.[0]?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {role.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {role.user_count} utilisateur(s) assigné(s)
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Tabs value={0} sx={{ mb: 2 }}>
              <Tab label="Permissions" />
              <Tab label="Utilisateurs" />
            </Tabs>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <VerifiedUser color="primary" />
              <Typography variant="subtitle2" fontWeight={600}>
                Permissions ({role.permissions_list?.length || 0})
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxHeight: 200, overflow: 'auto', mb: 3 }}>
              {role.permissions_list?.map((perm) => (
                <Chip key={perm} label={perm} size="small" variant="outlined" />
              ))}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <People color="primary" />
              <Typography variant="subtitle2" fontWeight={600}>
                Utilisateurs assignés
              </Typography>
            </Box>
            <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
              {role.users?.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Aucun utilisateur assigné à ce rôle
                </Typography>
              ) : (
                role.users?.map((user) => (
                  <Box
                    key={user.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      py: 1,
                      px: 2,
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
                      {user.first_name?.[0] || user.username?.[0]?.toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {user.first_name} {user.last_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        @{user.username}
                      </Typography>
                    </Box>
                  </Box>
                ))
              )}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
}
