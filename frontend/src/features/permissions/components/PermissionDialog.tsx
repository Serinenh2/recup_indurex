import { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import type { Permission, PermissionFormData } from '../types';

interface PermissionDialogProps {
  open: boolean;
  onClose: () => void;
  permission: Permission | null;
}

export default function PermissionDialog({ open, onClose, permission }: PermissionDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PermissionFormData>({
    defaultValues: {
      codename: '',
      name: '',
      app_label: '',
      model_name: '',
    },
  });

  useEffect(() => {
    if (permission) {
      reset({
        codename: permission.codename,
        name: permission.name,
        app_label: permission.app_label,
        model_name: permission.model_name,
      });
    } else {
      reset({
        codename: '',
        name: '',
        app_label: '',
        model_name: '',
      });
    }
  }, [permission, reset]);

  const onSubmit = async (data: PermissionFormData) => {
    // TODO: Implement create/update API call
    console.log('Permission data:', data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{permission ? 'Modifier la permission' : 'Nouvelle permission'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {permission ? 'Modifiez les informations de la permission.' : 'Remplissez les informations pour créer une nouvelle permission.'}
          </DialogContentText>
          {errors.root && <Alert severity="error">{errors.root.message}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="app_label"
                control={control}
                rules={{ required: 'Application requise' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Application"
                    fullWidth
                    error={!!errors.app_label}
                    helperText={errors.app_label?.message}
                    disabled={!!permission}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="model_name"
                control={control}
                rules={{ required: 'Modèle requis' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Modèle"
                    fullWidth
                    error={!!errors.model_name}
                    helperText={errors.model_name?.message}
                    disabled={!!permission}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="codename"
                control={control}
                rules={{ required: 'Code requis' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Code (codename)"
                    fullWidth
                    error={!!errors.codename}
                    helperText={errors.codename?.message}
                    disabled={!!permission}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Nom requis' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nom"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={16} /> : null}>
            {isSubmitting ? 'Enregistrement...' : permission ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
