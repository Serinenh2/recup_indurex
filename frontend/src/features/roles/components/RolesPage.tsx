import { useState, useMemo } from 'react';
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
  type GridSortModel,
} from '@mui/x-data-grid';
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Chip,
  Avatar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ContentCopy as CloneIcon,
} from '@mui/icons-material';
import { useRolesList, useCreateRole, useUpdateRole, useDeleteRole, useCloneRole } from '../api';
import type { Role, RoleFilters, RoleFormData } from '../types';
import RoleDialog from './RoleDialog';
import RoleDetailDialog from './RoleDetailDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';

export default function RolesPage() {
  const [filters, setFilters] = useState<RoleFilters>({});
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'name', sort: 'asc' }]);
  const [searchText, setSearchText] = useState('');

  // Dialogs state
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Toast state
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data, isLoading, isError, error, refetch } = useRolesList(filters);
  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const deleteMutation = useDeleteRole();
  const cloneMutation = useCloneRole();

  const showToast = (message: string, severity: 'success' | 'error') => {
    setToast({ open: true, message, severity });
  };

  const handleCreate = () => {
    setSelectedRole(null);
    setRoleDialogOpen(true);
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setRoleDialogOpen(true);
  };

  const handleView = (role: Role) => {
    setSelectedRole(role);
    setDetailDialogOpen(true);
  };

  const handleDeleteClick = (role: Role) => {
    setSelectedRole(role);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRole) return;
    try {
      await deleteMutation.mutateAsync(selectedRole.id);
      showToast('Rôle supprimé avec succès', 'success');
      setDeleteDialogOpen(false);
      setSelectedRole(null);
    } catch {
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  const handleClone = async (role: Role) => {
    try {
      await cloneMutation.mutateAsync(role.id);
      showToast(`Rôle "${role.name}" cloné avec succès`, 'success');
    } catch {
      showToast('Erreur lors du clonage', 'error');
    }
  };

  const handleSaveRole = async (formData: RoleFormData) => {
    try {
      if (selectedRole) {
        await updateMutation.mutateAsync({ id: selectedRole.id, data: { name: formData.name } });
        showToast('Rôle modifié avec succès', 'success');
      } else {
        await createMutation.mutateAsync({ name: formData.name });
        showToast('Rôle créé avec succès', 'success');
      }
      setRoleDialogOpen(false);
      setSelectedRole(null);
    } catch {
      showToast('Erreur lors de l\'enregistrement', 'error');
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchText(value);
    setFilters((prev) => ({ ...prev, search: value || undefined }));
  };

  const rows = useMemo(() => data?.results || [], [data]);
  const rowCount = data?.count || 0;

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Nom du rôle',
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: '0.875rem' }}>
            {params.value?.[0]?.toUpperCase()}
          </Avatar>
          <Typography variant="body2" fontWeight={500}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'permissions_list',
      headerName: 'Permissions',
      width: 300,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {(params.value as string[])?.slice(0, 3).map((perm) => (
            <Chip key={perm} label={perm} size="small" variant="outlined" />
          ))}
          {(params.value as string[])?.length > 3 && (
            <Chip label={`+${(params.value as string[])?.length - 3}`} size="small" />
          )}
        </Box>
      ),
    },
    {
      field: 'user_count',
      headerName: 'Utilisateurs',
      width: 120,
      type: 'number',
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 220,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Voir détails">
            <IconButton size="small" onClick={() => handleView(params.row)}>
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Modifier">
            <IconButton size="small" onClick={() => handleEdit(params.row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Cloner">
            <IconButton size="small" onClick={() => handleClone(params.row)}>
              <CloneIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Supprimer">
            <IconButton
              size="small"
              onClick={() => handleDeleteClick(params.row)}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  if (isError) {
    return (
      <Box>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Gestion des Rôles
        </Typography>
        <Alert severity="error" sx={{ mb: 2 }}>
          {(error as Error)?.message || 'Impossible de charger les rôles'}
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
          Gestion des Rôles
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          Nouveau Rôle
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <TextField
          placeholder="Rechercher un rôle..."
          value={searchText}
          onChange={(e) => handleSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 250 }}
        />
      </Paper>

      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          rowCount={rowCount}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10, 25, 50]}
          sortingMode="server"
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          loading={isLoading}
          disableRowSelectionOnClick
          autoHeight
          sx={{
            '& .MuiDataGrid-cell': { py: 1 },
            '& .MuiDataGrid-row': { cursor: 'pointer' },
          }}
        />
      </Paper>

      {/* Dialogs */}
      <RoleDialog
        open={roleDialogOpen}
        onClose={() => { setRoleDialogOpen(false); setSelectedRole(null); }}
        onSave={handleSaveRole}
        role={selectedRole}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <RoleDetailDialog
        open={detailDialogOpen}
        onClose={() => { setDetailDialogOpen(false); setSelectedRole(null); }}
        roleId={selectedRole?.id || null}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setSelectedRole(null); }}
        onConfirm={handleDeleteConfirm}
        itemName={selectedRole?.name || ''}
        itemType="rôle"
        isLoading={deleteMutation.isPending}
      />

      {/* Toast */}
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
