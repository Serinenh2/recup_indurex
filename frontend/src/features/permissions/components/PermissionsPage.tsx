import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Checkbox,
  ListItemText,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Alert,
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupIcon from '@mui/icons-material/Group';
import { usePermissionsList, useAssignPermissionsToRole, useBulkRemovePermissions } from '../api';
import type { Permission, PermissionFilters } from '../types';
import PermissionDialog from './PermissionDialog';
import PermissionDetailDialog from './PermissionDetailDialog';
import AssignPermissionsDialog from './AssignPermissionsDialog';
import DeleteConfirmDialog from './DeleteConfirmDialog';

const ITEMS_PER_PAGE = 20;

export default function PermissionsPage() {
  const [filters, setFilters] = useState<PermissionFilters>({ search: '', app: undefined, model: undefined });
  const [viewMode, setViewMode] = useState<'table' | 'grouped'>('table');
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [detailPermission, setDetailPermission] = useState<Permission | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState<Permission | null>(null);

  const { data: permissions = [], isLoading, error } = usePermissionsList(filters);
  const assignMutation = useAssignPermissionsToRole();
  const bulkRemoveMutation = useBulkRemovePermissions();

  const availableApps = useMemo(() => {
    const apps = new Set(permissions.map((p) => p.app_label));
    return Array.from(apps).sort();
  }, [permissions]);

  const availableModels = useMemo(() => {
    const models = new Set(permissions.map((p) => p.model_name));
    return Array.from(models).sort();
  }, [permissions]);

  const groupedPermissions = useMemo(() => {
    const groups: Record<string, Record<string, Permission[]>> = {};
    permissions.forEach((perm) => {
      if (!groups[perm.app_label]) groups[perm.app_label] = {};
      if (!groups[perm.app_label][perm.model_name]) groups[perm.app_label][perm.model_name] = [];
      groups[perm.app_label][perm.model_name].push(perm);
    });
    return groups;
  }, [permissions]);

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  };

  const handleAppFilter = (app: string) => {
    setFilters((prev) => ({ ...prev, app: app || undefined, model: undefined }));
  };

  const handleModelFilter = (model: string) => {
    setFilters((prev) => ({ ...prev, model: model || undefined }));
  };

  const handleCreate = () => {
    setEditingPermission(null);
    setDialogOpen(true);
  };

  const handleEdit = (permission: Permission) => {
    setEditingPermission(permission);
    setDialogOpen(true);
  };

  const handleView = (permission: Permission) => {
    setDetailPermission(permission);
  };

  const handleDelete = (permission: Permission) => {
    setPermissionToDelete(permission);
    setDeleteDialogOpen(true);
  };

  const handleAssign = () => {
    setAssignDialogOpen(true);
  };

  const handleBulkRemove = () => {
    if (selectedPermissionIds.length === 0) return;
    bulkRemoveMutation.mutate(
      { roleId: 0, permissionIds: selectedPermissionIds },
      {
        onSuccess: () => {
          setSelectedPermissionIds([]);
        },
      }
    );
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingPermission(null);
  };

  const handleDetailClose = () => {
    setDetailPermission(null);
  };

  const handleAssignClose = () => {
    setAssignDialogOpen(false);
  };

  const handleDeleteClose = () => {
    setDeleteDialogOpen(false);
    setPermissionToDelete(null);
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'codename', headerName: 'Code', width: 200, flex: 1 },
    { field: 'name', headerName: 'Nom', width: 250, flex: 1 },
    { field: 'app_label', headerName: 'Application', width: 150 },
    { field: 'model_name', headerName: 'Modèle', width: 150 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Permission>) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Button size="small" variant="text" color="primary" onClick={() => handleView(params.row)} title="Voir">
            <VisibilityIcon fontSize="small" />
          </Button>
          <Button size="small" variant="text" color="primary" onClick={() => handleEdit(params.row)} title="Modifier">
            <EditIcon fontSize="small" />
          </Button>
          <Button size="small" variant="text" color="error" onClick={() => handleDelete(params.row)} title="Supprimer">
            <DeleteIcon fontSize="small" />
          </Button>
        </Box>
      ),
    },
  ];

  if (error) {
    return (
      <Box>
        <Alert severity="error">Erreur lors du chargement des permissions.</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" fontWeight="bold">
          Gestion des Permissions
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button variant="outlined" startIcon={<AssignmentIcon />} onClick={handleAssign} disabled={selectedPermissionIds.length === 0}>
            Assigner ({selectedPermissionIds.length})
          </Button>
          <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleBulkRemove} disabled={selectedPermissionIds.length === 0}>
            Supprimer ({selectedPermissionIds.length})
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            Nouvelle Permission
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Rechercher une permission..."
            value={filters.search}
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
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Application</InputLabel>
            <Select value={filters.app || ''} label="Application" onChange={(e) => handleAppFilter(e.target.value)}>
              <MenuItem value="">Toutes</MenuItem>
              {availableApps.map((app) => (
                <MenuItem key={app} value={app}>
                  {app}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Modèle</InputLabel>
            <Select value={filters.model || ''} label="Modèle" onChange={(e) => handleModelFilter(e.target.value)}>
              <MenuItem value="">Tous</MenuItem>
              {availableModels.map((model) => (
                <MenuItem key={model} value={model}>
                  {model}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <ToggleButtonGroup value={viewMode} exclusive onChange={(_, value) => value && setViewMode(value)} size="small">
            <ToggleButton value="table" title="Vue tableau">
              <ViewListIcon />
            </ToggleButton>
            <ToggleButton value="grouped" title="Vue groupée">
              <ViewModuleIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Paper>

      {viewMode === 'table' ? (
        <Paper sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={permissions}
            columns={columns}
            loading={isLoading}
            pageSizeOptions={[ITEMS_PER_PAGE]}
            initialState={{ pagination: { paginationModel: { pageSize: ITEMS_PER_PAGE, page: 0 } } }}
            checkboxSelection
            onRowSelectionModelChange={(newSelection: any) => setSelectedPermissionIds(Array.from(newSelection) as number[])}
            rowSelectionModel={selectedPermissionIds as any}
            disableRowSelectionOnClick
            getRowId={(row) => row.id}
            localeText={{
              noRowsLabel: 'Aucune permission trouvée',
              footerRowSelected: (count) => `${count} permission(s) sélectionnée(s)`,
            }}
          />
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : Object.keys(groupedPermissions).length === 0 ? (
            <Alert severity="info">Aucune permission trouvée.</Alert>
          ) : (
            Object.entries(groupedPermissions).map(([app, models]) => (
              <Paper key={app} sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <GroupIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    {app}
                  </Typography>
                  <Chip label={`${Object.values(models).flat().length} permissions`} size="small" color="primary" variant="outlined" />
                </Box>
                {Object.entries(models).map(([model, perms]) => (
                  <Box key={model} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, textTransform: 'capitalize' }}>
                      {model}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {perms.map((perm) => (
                        <Chip
                          key={perm.id}
                          label={perm.name}
                          size="small"
                          variant="outlined"
                          onClick={() => handleView(perm)}
                          onDelete={() => handleDelete(perm)}
                          deleteIcon={<DeleteIcon />}
                          sx={{ cursor: 'pointer' }}
                        />
                      ))}
                    </Box>
                  </Box>
                ))}
              </Paper>
            ))
          )}
        </Box>
      )}

      <PermissionDialog open={dialogOpen} onClose={handleDialogClose} permission={editingPermission} />
      <PermissionDetailDialog open={!!detailPermission} onClose={handleDetailClose} permission={detailPermission} onEdit={handleEdit} />
      <AssignPermissionsDialog open={assignDialogOpen} onClose={handleAssignClose} selectedPermissionIds={selectedPermissionIds} />
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={handleDeleteClose}
        onConfirm={() => {
          if (permissionToDelete) {
            handleDelete(permissionToDelete);
            handleDeleteClose();
          }
        }}
        itemName={permissionToDelete?.name || ''}
        itemType="permission"
        isLoading={bulkRemoveMutation.isPending}
      />
    </Box>
  );
}
