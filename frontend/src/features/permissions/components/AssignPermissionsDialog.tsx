import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  CircularProgress,
  Alert,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { usePermissionsList, useAssignPermissionsToRole, useBulkRemovePermissions } from '../api';
import type { Permission } from '../types';

interface AssignPermissionsDialogProps {
  open: boolean;
  onClose: () => void;
  selectedPermissionIds: number[];
}

interface FormData {
  roleId: string;
}

export default function AssignPermissionsDialog({ open, onClose, selectedPermissionIds }: AssignPermissionsDialogProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [mode, setMode] = useState<'assign' | 'remove'>('assign');
  const { data: permissions = [], isLoading: permissionsLoading } = usePermissionsList();
  const assignMutation = useAssignPermissionsToRole();
  const bulkRemoveMutation = useBulkRemovePermissions();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: { roleId: '' },
  });

  useEffect(() => {
    if (open) {
      setSelectedPermissions(selectedPermissionIds);
      reset({ roleId: '' });
      setMode('assign');
    }
  }, [open, selectedPermissionIds, reset]);

  const handlePermissionToggle = (permId: number) => {
    setSelectedPermissions((prev) => (prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]));
  };

  const onSubmit = async (data: FormData) => {
    const roleId = parseInt(data.roleId, 10);
    if (!roleId) return;

    if (mode === 'assign') {
      await assignMutation.mutateAsync({ roleId, permissions: selectedPermissions });
    } else {
      await bulkRemoveMutation.mutateAsync({ roleId, permissionIds: selectedPermissions });
    }
    onClose();
  };

  const groupedPermissions = permissions.reduce<Record<string, Record<string, Permission[]>>>>>((acc, perm) => {
    if (!acc[perm.app_label]) acc[perm.app_label] = {};
    if (!acc[perm.app_label][perm.model_name]) acc[perm.app_label][perm.model_name] = [];
    acc[perm.app_label][perm.model_name].push(perm);
    return acc;
  }, {});

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {mode === 'assign' ? 'Assigner des permissions à un rôle' : 'Supprimer des permissions d\'un rôle'}
      </DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {mode === 'assign'
              ? 'Sélectionnez un rôle et les permissions à lui assigner.'
              : 'Sélectionnez un rôle et les permissions à lui supprimer.'}
          </DialogContentText>

          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Button
              variant={mode === 'assign' ? 'contained' : 'outlined'}
              onClick={() => setMode('assign')}
              size="small"
            >
              Assigner
            </Button>
            <Button
              variant={mode === 'remove' ? 'contained' : 'outlined'}
              color="error"
              onClick={() => setMode('remove')}
              size="small"
            >
              Supprimer
            </Button>
          </Box>

          <Controller
            name="roleId"
            control={control}
            rules={{ required: 'Rôle requis' }}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.roleId} sx={{ mb: 3 }}>
                <InputLabel>Rôle</InputLabel>
                <Select {...field} label="Rôle" input={<OutlinedInput label="Rôle" />}>
                  <MenuItem value="">Sélectionner un rôle</MenuItem>
                  <MenuItem value="1">Super Administrateur</MenuItem>
                  <MenuItem value="2">Administrateur</MenuItem>
                  <MenuItem value="3">Récupérateur</MenuItem>
                  <MenuItem value="4">Responsable Collecte</MenuItem>
                  <MenuItem value="5">Agent de Collecte</MenuItem>
                  <MenuItem value="6">Responsable Décharge</MenuItem>
                  <MenuItem value="7">Observateur</MenuItem>
                </Select>
                {errors.roleId && <Alert severity="error">{errors.roleId.message}</Alert>}
              </FormControl>
            )}
          />

          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Permissions sélectionnées ({selectedPermissions.length})
          </Typography>

          {permissionsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Box sx={{ maxHeight: 400, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1 }}>
              {Object.entries(groupedPermissions).map(([app, models]) => (
                <Box key={app} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 'bold' }}>
                    {app}
                  </Typography>
                  {Object.entries(models).map(([model, perms]) => (
                    <Box key={model} sx={{ mb: 1, ml: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                        {model}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {perms.map((perm) => (
                          <Chip
                            key={perm.id}
                            label={perm.name}
                            size="small"
                            variant={selectedPermissions.includes(perm.id) ? 'filled' : 'outlined'}
                            color={selectedPermissions.includes(perm.id) ? 'primary' : 'default'}
                            onClick={() => handlePermissionToggle(perm.id)}
                            sx={{ cursor: 'pointer' }}
                          />
                        ))}
                      </Box>
                    </Box>
                  ))}
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Annuler</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={selectedPermissions.length === 0 || assignMutation.isPending || bulkRemoveMutation.isPending}
            startIcon={assignMutation.isPending || bulkRemoveMutation.isPending ? <CircularProgress size={16} /> : null}
          >
            {assignMutation.isPending || bulkRemoveMutation.isPending ? 'En cours...' : mode === 'assign' ? 'Assigner' : 'Supprimer'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
