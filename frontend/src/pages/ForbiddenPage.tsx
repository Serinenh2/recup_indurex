import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';

export default function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Paper sx={{ p: 4, maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <LockIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          403
        </Typography>
        <Typography variant="h5" gutterBottom>
          Accès interdit
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Retour
          </Button>
          <Button variant="contained" onClick={() => navigate('/dashboard')}>
            Tableau de bord
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
