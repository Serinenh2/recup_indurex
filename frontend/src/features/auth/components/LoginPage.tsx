import { useState, useEffect } from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Alert, Checkbox, FormControlLabel, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useLogin } from '../api';
import { useAuthStore } from '../../store/authStore';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();
  const setRememberMeStore = useAuthStore((s) => s.setRememberMe);

  // Check for stored remember me preference
  useEffect(() => {
    const stored = localStorage.getItem('remember_me');
    if (stored === 'true') {
      setRememberMe(true);
      setRememberMeStore(true);
    }
  }, [setRememberMeStore]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRememberMeStore(rememberMe);
    if (rememberMe) {
      localStorage.setItem('remember_me', 'true');
    } else {
      localStorage.removeItem('remember_me');
    }
    loginMutation.mutate({ username, password, remember_me: rememberMe });
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'background.default',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
            bgcolor: 'background.paper',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography component="h1" variant="h4" fontWeight="bold" color="primary" gutterBottom>
              RecupIndurex
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Système de Gestion des Déchets
            </Typography>
          </Box>

          {loginMutation.isError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 1 }}>
              {(loginMutation.error as Error)?.message || 'Erreur de connexion. Vérifiez vos identifiants.'}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Nom d'utilisateur"
              autoFocus
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loginMutation.isPending}
              sx={{ mb: 1 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loginMutation.isPending}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  color="primary"
                />
              }
              label="Se souvenir de moi"
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 1, mb: 2, py: 1.5, borderRadius: 1, textTransform: 'none', fontWeight: 600 }}
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
          </Box>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              © 2024 RecupIndurex. Tous droits réservés.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
