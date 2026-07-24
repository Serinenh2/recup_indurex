import { useState, useMemo } from 'react';
import {
  DataGrid,
  type GridColDef,
  type GridPaginationModel,
  type GridSortModel,
  type GridFilterModel,
  type GridRowParams,
  type GridRenderCellParams,
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
  Switch,
  FormControlLabel,
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
  LockReset as ResetPasswordIcon,
  Block as BlockIcon,
  CheckCircle as ActivateIcon,
  Assignment as AssignRoleIcon,
} from '@mui/icons-material';
import { useUsersList, useCreateUser, useUpdateUser, useDeleteUser, useToggleUserStatus, useResetPassword, useAssignRole } from '../api';
import type { User, UserFilters, UserFormData } from '../types';
import { useAuthStore } from '../../../store/authStore';
import UserDialog from './UserDialog';
import UserViewDialog from './UserViewDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import ResetPasswordDialog from './ResetPasswordDialog';
import AssignRoleDialog from './AssignRoleDialog';

const ROLE_LABELS: Record<string, string> = {
  SUPERADMIN: 'Super Admin',
  ADMIN: 'Admin',
  RECUPERATEUR: 'Récupérateur',
  RESPONSABLE_COLLECTE: 'Resp. Collecte',
  AGENT_COLLECTE: 'Agent Collecte',
  RESPONSABLE_DECHARGE: 'Resp. Décharge',
  OBSERVATEUR: 'Observateur',
};

export default function UsersPage() {
  const [filters, setFilters] = useState<UserFilters>({});
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: 'username', sort: 'asc' }]);
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
  const [searchText, setSearchText] = useState('');

  // Dialogs state
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [assignRoleDialogOpen, setAssignRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Toast state
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data, isLoading, isError, error, refetch } = useUsersList(filters);
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();
  const toggleStatusMutation = useToggleUserStatus();
  const resetPasswordMutation = useResetPassword();
  const assignRoleMutation = useAssignRole();
  const currentUser = useAuthStore((s) => s.user);

  const showToast = (message: string, severity: 'success' | 'error') => {
    setToast({ open: true, message, severity });
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setUserDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setUserDialogOpen(true);
  };

  const handleView = (user: User) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    try {
      await deleteMutation.mutateAsync(selectedUser.id);
      showToast('Utilisateur supprimé avec succès', 'success');
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch {
      showToast('Erreur lors de la suppression', 'error');
    }
  };

  const handleResetPasswordClick = (user: User) => {
    setSelectedUser(user);
    setResetPasswordDialogOpen(true);
  };

  const handleResetPasswordConfirm = async (newPassword: string) => {
    if (!selectedUser) return;
    try {
      await resetPasswordMutation.mutateAsync({ id: selectedUser.id, new_password: newPassword });
      showToast('Mot de passe réinitialisé avec succès', 'success');
      setResetPasswordDialogOpen(false);
      setSelectedUser(null);
    } catch {
      showToast('Erreur lors de la réinitialisation', 'error');
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await toggleStatusMutation.mutateAsync({ id: user.id, is_active: !user.is_superuser });
      showToast(user.is_superuser ? 'Utilisateur désactivé' : 'Utilisateur activé', 'success');
    } catch {
      showToast('Erreur lors de la modification du statut', 'error');
    }
  };

  const handleSaveUser = async (formData: any) => {
    try {
      if (selectedUser) {
        await updateMutation.mutateAsync({ id: selectedUser.id, data: formData });
        showToast('Utilisateur modifié avec succès', 'success');
      } else {
        await createMutation.mutateAsync(formData);
        showToast('Utilisateur créé avec succès', 'success');
      }
      setUserDialogOpen(false);
      setSelectedUser(null);
    } catch {
      showToast('Erreur lors de l\'enregistrement', 'error');
    }
  };

  const handleAssignRoleClick = (user: User) => {
    setSelectedUser(user);
    setAssignRoleDialogOpen(true);
  };

  const handleAssignRoleConfirm = async (role: string) => {
    if (!selectedUser) return;
    try {
      await assignRoleMutation.mutateAsync({ userId: selectedUser.id, role: role as any });
      showToast('Rôle assigné avec succès', 'success');
      setAssignRoleDialogOpen(false);
      setSelectedUser(null);
    } catch {
      showToast('Erreur lors de l\'assignation du rôle', 'error');
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchText(value);
    setFilters((prev) => ({ ...prev, search: value || undefined }) as UserFilters);
  };

  const handleRoleFilterChange = (role: string) => {
    setFilters((prev) => ({ ...prev, role: role || undefined }) as UserFilters);
  };

  const rows = useMemo(() => data?.results || [], [data]);
  const rowCount = data?.count || 0;

  const columns: GridColDef[] = [
    {
      field: 'username',
      headerName: 'Utilisateur',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
            {params.row.first_name?.[0] || params.row.username?.[0]?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {params.row.first_name} {params.row.last_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              @{params.row.username}
            </Typography>
          </Box>
        </Box>
      ),
    },
    { field: 'email', headerName: 'Email', width: 220 },
    {
      field: 'role',
      headerName: 'Rôle',
      width: 160,
      renderCell: (params) => <Chip label={ROLE_LABELS[params.value] || params.value} size="small" variant="outlined" />,
    },
    {
      field: 'wilaya',
      headerName: 'Wilaya',
      width: 100,
    },
    {
      field: 'is_active',
      headerName: 'Statut',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Actif' : 'Inactif'}
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 340,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams<User>) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Voir">
            <IconButton size="small" onClick={() => handleView(params.row)}>
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Modifier">
            <IconButton size="small" onClick={() => handleEdit(params.row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Assigner un rôle">
            <IconButton size="small" onClick={() => handleAssignRoleClick(params.row)} disabled={params.row.id === currentUser?.id}>
              <AssignRoleIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={params.row.is_active ? 'Désactiver' : 'Activer'}>
            <IconButton
              size="small"
              onClick={() => handleToggleStatus(params.row)}
              disabled={params.row.id === currentUser?.id}
            >
              {params.row.is_active ? <BlockIcon fontSize="small" /> : <ActivateIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Réinitialiser mot de passe">
            <IconButton size="small" onClick={() => handleResetPasswordClick(params.row)}>
              <ResetPasswordIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Supprimer">
            <IconButton
              size="small"
              onClick={() => handleDeleteClick(params.row)}
              disabled={params.row.id === currentUser?.id}
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
          Gestion des Utilisateurs
        </Typography>
        <Alert severity="error" sx={{ mb: 2 }}>
          {(error as Error)?.message || 'Impossible de charger les utilisateurs'}
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
          Gestion des Utilisateurs
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          Nouvel Utilisateur
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Rechercher..."
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
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Rôle</InputLabel>
            <Select
              value={filters.role || ''}
              label="Rôle"
              onChange={(e) => handleRoleFilterChange(e.target.value)}
            >
              <MenuItem value="">Tous</MenuItem>
              {Object.entries(ROLE_LABELS).map(([key, label]) => (
                <MenuItem key={key} value={key}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
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
          filterMode="server"
          filterModel={filterModel}
          onFilterModelChange={setFilterModel}
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
      <UserDialog
        open={userDialogOpen}
        onClose={() => { setUserDialogOpen(false); setSelectedUser(null); }}
        onSave={handleSaveUser}
        user={selectedUser}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <UserViewDialog
        open={viewDialogOpen}
        onClose={() => { setViewDialogOpen(false); setSelectedUser(null); }}
        user={selectedUser}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setSelectedUser(null); }}
        onConfirm={handleDeleteConfirm}
        userName={selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : ''}
        isLoading={deleteMutation.isPending}
      />

      <ResetPasswordDialog
        open={resetPasswordDialogOpen}
        onClose={() => { setResetPasswordDialogOpen(false); setSelectedUser(null); }}
        onConfirm={handleResetPasswordConfirm}
        userName={selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : ''}
        isLoading={resetPasswordMutation.isPending}
      />

      <AssignRoleDialog
        open={assignRoleDialogOpen}
        onClose={() => { setAssignRoleDialogOpen(false); setSelectedUser(null); }}
        user={selectedUser}
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
