import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Box, Typography, Chip, Divider } from '@mui/material';
import type { Permission } from '../types';

interface PermissionDetailDialogProps {
  open: boolean;
  onClose: () => void;
  permission: Permission | null;
  onEdit: (permission: Permission) => void;
}

export default function PermissionDetailDialog({ open, onClose, permission, onEdit }: PermissionDetailDialogProps) {
  if (!permission) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Détails de la permission</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              ID
            </Typography>
            <Typography variant="body1">{permission.id}</Typography>
          </Box>
          <Divider />
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Nom
            </Typography>
            <Typography variant="body1">{permission.name}</Typography>
          </Box>
          <Divider />
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Code (codename)
            </Typography>
            <Typography variant="body1" fontFamily="monospace">
              {permission.codename}
            </Typography>
          </Box>
          <Divider />
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Application
            </Typography>
            <Chip label={permission.app_label} size="small" color="primary" variant="outlined" />
          </Box>
          <Divider />
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Modèle
            </Typography>
            <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
              {permission.model_name}
            </Typography>
          </Box>
          <Divider />
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Permission complète
            </Typography>
            <Typography variant="body2" fontFamily="monospace" sx={{ wordBreak: 'break-all' }}>
              {permission.app_label}.{permission.codename}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Fermer</Button>
        <Button variant="contained" startIcon={<EditIcon />} onClick={() => { onEdit(permission); onClose(); }}>
          Modifier
        </Button>
      </DialogActions>
    </Dialog>
  );
}
