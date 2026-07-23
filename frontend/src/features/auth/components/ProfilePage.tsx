import { useState, useEffect } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Alert, Avatar, Grid, Divider, Chip, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Email, Phone, LocationOn, Badge, VerifiedUser } from '@mui/icons-material';
import { useCurrentUser, useUpdateProfile } from '../api';
import { ProfileSkeleton } from '../../components/ui/Skeleton';

export default function ProfilePage() {
  const { data: user, isLoading, isError, error, refetch } = useCurrentUser();
  const updateMutation = useUpdateProfile();

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    wilaya: '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        wilaya: user.wilaya,
      });
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(form, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  if (isLoading) return <ProfileSkeleton />;

  if (isError || !user) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {(error as Error)?.message || 'Impossible de charger le profil'}
          </Alert>
          <Button variant="outlined" sx={{ mt: 2 }} onClick={() => refetch()}>
            Réessayer
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Mon Profil
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Gérez vos informations personnelles
        </Typography>
      </Box>

      <Paper sx={{ p: 4, borderRadius: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem' }}>
            {user.first_name?.[0] || user.username?.[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight="600">
              {user.first_name} {user.last_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              @{user.username}
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              <Chip label={user.role_display} color="primary" size="small" />
              {user.is_superuser && (
                <Chip label="Super Admin" color="secondary" size="small" sx={{ ml: 0.5 }} />
              )}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Prénom"
                fullWidth
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                disabled={updateMutation.isPending}
                InputProps={{
                  startAdornment: <Badge sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Nom"
                fullWidth
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                disabled={updateMutation.isPending}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email"
                fullWidth
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={updateMutation.isPending}
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Téléphone"
                fullWidth
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                disabled={updateMutation.isPending}
                InputProps={{
                  startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Wilaya"
                fullWidth
                value={form.wilaya}
                onChange={(e) => setForm({ ...form, wilaya: e.target.value })}
                disabled={updateMutation.isPending}
                InputProps={{
                  startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Nom d'utilisateur"
                fullWidth
                value={user.username}
                disabled
                helperText="Le nom d'utilisateur ne peut pas être modifié"
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{ mt: 4, px: 4, py: 1.5, borderRadius: 1, textTransform: 'none', fontWeight: 600 }}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </Button>
        </Box>
      </Paper>

      {/* Permissions Card */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <VerifiedUser color="primary" />
          <Typography variant="h6" fontWeight="600">
            Permissions ({user.permissions?.length || 0})
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {user.permissions?.map((perm) => (
            <Chip key={perm} label={perm} size="small" variant="outlined" />
          ))}
        </Box>
      </Paper>
    </Container>
  );
}
