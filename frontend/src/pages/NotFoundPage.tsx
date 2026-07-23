import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';

export default function NotFoundPage() {
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
        <SearchOffIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          404
        </Typography>
        <Typography variant="h5" gutterBottom>
          Page non trouvée
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          La page que vous recherchez n'existe pas ou a été déplacée.
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
