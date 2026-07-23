import { useState, useMemo } from 'react';
import {
  Typography,
  Paper,
  Box,
  TextField,
  InputAdornment,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useAuditLogList } from '../api';
import type { AuditLogEntry, AuditLogFilters } from '../types';

const ITEMS_PER_PAGE = 25;

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'success',
  UPDATE: 'info',
  DELETE: 'error',
  ASSIGN_ROLE: 'warning',
  LOGIN: 'primary',
  LOGOUT: 'default',
};

export default function AuditLogsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [searchText, setSearchText] = useState('');
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data: logs = [], isLoading, isError, error, refetch } = useAuditLogList(filters);

  const handleSearch = (value: string) => {
    setSearchText(value);
    setFilters((prev) => ({ ...prev, search: value || undefined }));
  };

  const handleFilterChange = (key: keyof AuditLogFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined }));
  };

  const exportToCSV = () => {
    try {
      const headers = ['ID', 'Utilisateur', 'Action', 'Code', 'Modèle', 'ID Objet', 'IP', 'Date'];
      const rows = logs.map((log) => [
        log.id,
        log.user || 'Système',
        log.action,
        log.action_code,
        log.model_name,
        log.object_id,
        log.ip_address || '—',
        new Date(log.timestamp).toLocaleString('fr-FR'),
      ]);

      const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      setToast({ open: true, message: 'Export CSV réussi', severity: 'success' });
    } catch {
      setToast({ open: true, message: 'Erreur lors de l\'export CSV', severity: 'error' });
    }
  };

  const exportToExcel = () => {
    try {
      const headers = ['ID', 'Utilisateur', 'Action', 'Code', 'Modèle', 'ID Objet', 'IP', 'Date'];
      const rows = logs.map((log) => [
        log.id,
        log.user || 'Système',
        log.action,
        log.action_code,
        log.model_name,
        log.object_id,
        log.ip_address || '—',
        new Date(log.timestamp).toLocaleString('fr-FR'),
      ]);

      // Simple HTML table for Excel export
      const html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
          <head><meta charset="utf-8"></head>
          <body>
            <table border="1">
              <thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
              <tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>
            </table>
          </body>
        </html>
      `;
      const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-log-${new Date().toISOString().split('T')[0]}.xls`;
      link.click();
      URL.revokeObjectURL(url);
      setToast({ open: true, message: 'Export Excel réussi', severity: 'success' });
    } catch {
      setToast({ open: true, message: 'Erreur lors de l\'export Excel', severity: 'error' });
    }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'user', headerName: 'Utilisateur', width: 150, flex: 1 },
    {
      field: 'action',
      headerName: 'Action',
      width: 140,
      renderCell: (params: GridRenderCellParams<AuditLogEntry>) => (
        <Chip label={params.value} size="small" color={ACTION_COLORS[params.row.action_code] as any || 'default'} variant="outlined" />
      ),
    },
    { field: 'action_code', headerName: 'Code', width: 100 },
    { field: 'model_name', headerName: 'Modèle', width: 140 },
    { field: 'object_id', headerName: 'ID Objet', width: 100 },
    { field: 'ip_address', headerName: 'IP', width: 140 },
    {
      field: 'timestamp',
      headerName: 'Date',
      width: 180,
      valueFormatter: (params) => new Date(params.value as string).toLocaleString('fr-FR'),
    },
  ];

  if (isError) {
    return (
      <Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Journal d'audit
        </Typography>
        <Alert severity="error" sx={{ mb: 2 }}>
          {(error as Error)?.message || 'Impossible de charger le journal d\'audit'}
        </Alert>
        <Button variant="outlined" onClick={() => refetch()}>
          Réessayer
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" fontWeight="bold">
          Journal d'audit
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={exportToCSV} disabled={logs.length === 0}>
            CSV
          </Button>
          <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={exportToExcel} disabled={logs.length === 0}>
            Excel
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Rechercher..."
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            size="small"
            sx={{ minWidth: 250, flex: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Action</InputLabel>
            <Select value={filters.action || ''} label="Action" onChange={(e) => handleFilterChange('action', e.target.value)}>
              <MenuItem value="">Toutes</MenuItem>
              <MenuItem value="CREATE">Création</MenuItem>
              <MenuItem value="UPDATE">Modification</MenuItem>
              <MenuItem value="DELETE">Suppression</MenuItem>
              <MenuItem value="ASSIGN_ROLE">Attribution de rôle</MenuItem>
              <MenuItem value="LOGIN">Connexion</MenuItem>
              <MenuItem value="LOGOUT">Déconnexion</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Utilisateur</InputLabel>
            <Select value={filters.user || ''} label="Utilisateur" onChange={(e) => handleFilterChange('user', e.target.value)}>
              <MenuItem value="">Tous</MenuItem>
              {Array.from(new Set(logs.map((l) => l.user).filter(Boolean))).map((user) => (
                <MenuItem key={user as string} value={user as string}>
                  {user as string}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Modèle</InputLabel>
            <Select value={filters.model_name || ''} label="Modèle" onChange={(e) => handleFilterChange('model_name', e.target.value)}>
              <MenuItem value="">Tous</MenuItem>
              {Array.from(new Set(logs.map((l) => l.model_name))).map((model) => (
                <MenuItem key={model} value={model}>
                  {model}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <DataGrid
          rows={logs}
          columns={columns}
          loading={isLoading}
          pageSizeOptions={[ITEMS_PER_PAGE]}
          initialState={{ pagination: { paginationModel: { pageSize: ITEMS_PER_PAGE, page: 0 } } }}
          getRowId={(row) => row.id}
          localeText={{
            noRowsLabel: 'Aucune entrée dans le journal d\'audit',
          }}
          sx={{
            '& .MuiDataGrid-cell': { py: 1 },
            ...(isMobile && { '& .MuiDataGrid-columnHeader': { fontSize: '0.75rem' } }),
          }}
        />
      </Paper>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={toast.severity} onClose={() => setToast((prev) => ({ ...prev, open: false }))}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
