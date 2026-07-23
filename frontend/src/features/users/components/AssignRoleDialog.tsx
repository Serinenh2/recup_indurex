import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Box,
  Typography,
  Chip,
  Divider,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useAssignRole, useRoleHistory } from '../api';
import type { User } from '../../types';

interface AssignRoleDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

interface FormData {
  role: string;
}

const ROLE_LABELS: Record<string, string> = {
  SUPERADMIN: 'Super Administrateur',
  ADMIN: 'Administrateur',
  RECUPERATEUR: 'Récupérateur',
  RESPONSABLE_COLLECTE: 'Responsable Collecte',
  AGENT_COLLECTE: 'Agent de Collecte',
  RESPONSABLE_DECHARGE: 'Responsable Décharge',
  OBSERVATEUR: 'Observateur',
};

export default function AssignRoleDialog({ open, onClose, user }: AssignRoleDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const { data: history = [], isLoading: historyLoading } = useRoleHistory(user?.id || 0);
  const assignMutation = useAssignRole();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: { role: '' },
  });

  useEffect(() => {
    if (open && user) {
      reset({ role: user.role || '' });
      setError(null);
    }
  }, [open, user, reset]);

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    setError(null);
    try {
      await assignMutation.mutateAsync({ userId: user.id, role: data.role as any });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Erreur lors de l\'assignation du rôle');
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Assigner un rôle</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Assignez un nouveau rôle à <strong>{user?.first_name} {user?.last_name}</strong>.
          </DialogContentText>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Controller
            name="role"
            control={control}
            rules={{ required: 'Rôle requis' }}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.role} sx={{ mb: 3 }}>
                <InputLabel>Rôle</InputLabel>
                <Select {...field} label="Rôle">
                  <MenuItem value="">Sélectionner un rôle</MenuItem>
                  {Object.entries(ROLE_LABELS).map(([key, label]) => (
                    <MenuItem key={key} value={key}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />

          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Historique des rôles
          </Typography>
          {historyLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : history.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Aucun historique disponible
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {history.map((log: any) => (
                <Box key={log.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Chip label={log.details?.new_role || 'N/A'} size="small" color="primary" variant="outlined" />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(log.timestamp).toLocaleString('fr-FR')}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={16} /> : null}>
            {isSubmitting ? 'Assignation...' : 'Assigner'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
