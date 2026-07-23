import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Avatar, Chip, Divider, Grid } from '@mui/material';
import { Email, Phone, LocationOn, Badge, Security, VerifiedUser } from '@mui/icons-material';
import type { User } from '../types';

const ROLE_LABELS: Record<string, string> = {
  SUPERADMIN: 'Super Administrateur',
  ADMIN: 'Administrateur',
  RECUPERATEUR: 'Récupérateur',
  RESPONSABLE_COLLECTE: 'Responsable Collecte',
  AGENT_COLLECTE: 'Agent de Collecte',
  RESPONSABLE_DECHARGE: 'Responsable Décharge',
  OBSERVATEUR: 'Observateur',
};

interface UserViewDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

export default function UserViewDialog({ open, onClose, user }: UserViewDialogProps) {
  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Détails de l'utilisateur</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: '1.5rem' }}>
            {user.first_name?.[0] || user.username?.[0]?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {user.first_name} {user.last_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              @{user.username}
            </Typography>
            <Box sx={{ mt: 0.5, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              <Chip label={ROLE_LABELS[user.role] || user.role} color="primary" size="small" />
              {user.is_superuser && (
                <Chip label="Super Admin" color="secondary" size="small" />
              )}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Email color="primary" sx={{ fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">Email</Typography>
            </Box>
            <Typography variant="body1" fontWeight={500}>{user.email}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Phone color="primary" sx={{ fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">Téléphone</Typography>
            </Box>
            <Typography variant="body1" fontWeight={500}>{user.phone || '—'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <LocationOn color="primary" sx={{ fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">Wilaya</Typography>
            </Box>
            <Typography variant="body1" fontWeight={500}>{user.wilaya || '—'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Badge color="primary" sx={{ fontSize: 20 }} />
              <Typography variant="body2" color="text.secondary">Statut</Typography>
            </Box>
            <Chip
              label={user.is_superuser ? 'Actif' : 'Inactif'}
              color={user.is_superuser ? 'success' : 'default'}
              size="small"
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Security color="primary" />
          <Typography variant="subtitle2" fontWeight={600}>
            Permissions ({user.permissions?.length || 0})
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxHeight: 200, overflow: 'auto' }}>
          {user.permissions?.map((perm) => (
            <Chip key={perm} label={perm} size="small" variant="outlined" />
          ))}
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <VerifiedUser color="primary" />
          <Typography variant="subtitle2" fontWeight={600}>
            Groupes ({user.groups?.length || 0})
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {user.groups?.map((group) => (
            <Chip key={group} label={group} size="small" color="info" variant="outlined" />
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
}
