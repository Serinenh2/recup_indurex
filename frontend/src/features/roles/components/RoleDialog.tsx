import { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
} from '@mui/material';
import type { Role, RoleFormData } from '../types';

interface RoleDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: RoleFormData) => void;
  role: Role | null;
  isLoading: boolean;
}

export default function RoleDialog({ open, onClose, onSave, role, isLoading }: RoleDialogProps) {
  const [form, setForm] = useState<RoleFormData>({ name: '', permissions: [] });

  useEffect(() => {
    if (role) {
      setForm({ name: role.name, permissions: [] });
    } else {
      setForm({ name: '', permissions: [] });
    }
  }, [role, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{role ? 'Modifier le rôle' : 'Nouveau rôle'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            label="Nom du rôle"
            fullWidth
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            disabled={!!role}
            helperText={role ? 'Le nom du rôle ne peut pas être modifié' : ''}
          />
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
