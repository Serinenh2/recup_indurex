import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
} from '@mui/material';
import type { User, UserFormData, UserRole } from '../types';

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: 'SUPERADMIN', label: 'Super Administrateur' },
  { value: 'ADMIN', label: 'Administrateur' },
  { value: 'RECUPERATEUR', label: 'Récupérateur' },
  { value: 'RESPONSABLE_COLLECTE', label: 'Responsable Collecte' },
  { value: 'AGENT_COLLECTE', label: 'Agent de Collecte' },
  { value: 'RESPONSABLE_DECHARGE', label: 'Responsable Décharge' },
  { value: 'OBSERVATEUR', label: 'Observateur' },
];

interface UserDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: UserFormData) => void;
  user: User | null;
  isLoading: boolean;
}

export default function UserDialog({ open, onClose, onSave, user, isLoading }: UserDialogProps) {
  const [form, setForm] = useState<UserFormData>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'OBSERVATEUR',
    phone: '',
    wilaya: '',
    password: '',
    is_active: true,
  });

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        phone: user.phone,
        wilaya: user.wilaya,
        password: '',
        is_active: !user.is_superuser,
      });
    } else {
      setForm({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        role: 'OBSERVATEUR',
        phone: '',
        wilaya: '',
        password: '',
        is_active: true,
      });
    }
  }, [user, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{user ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nom d'utilisateur"
                fullWidth
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                disabled={!!user}
                helperText={user ? 'Le nom d\'utilisateur ne peut pas être modifié' : ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Prénom"
                fullWidth
                required
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nom"
                fullWidth
                required
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Téléphone"
                fullWidth
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Wilaya"
                fullWidth
                value={form.wilaya}
                onChange={(e) => setForm({ ...form, wilaya: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Rôle</InputLabel>
                <Select
                  value={form.role}
                  label="Rôle"
                  onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                >
                  {ROLE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {!user && (
              <Grid item xs={12}>
                <TextField
                  label="Mot de passe"
                  type="password"
                  fullWidth
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  helperText="Le mot de passe doit contenir au moins 8 caractères"
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  />
                }
                label="Utilisateur actif"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
