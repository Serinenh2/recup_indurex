import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Avatar,
  Chip,
  Divider,
  CircularProgress,
  Tabs,
  Tab,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Alert,
  Snackbar,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Security, People, VerifiedUser, Search as SearchIcon } from '@mui/icons-material';
import { useRoleDetail, useUpdateRolePermissions } from '../api';
import { usePermissionsList } from '../../permissions/api';
import type { Permission } from '../../../types';

interface RoleDetailDialogProps {
  open: boolean;
  onClose: () => void;
  roleId: number | null;
}

export default function RoleDetailDialog({ open, onClose, roleId }: RoleDetailDialogProps) {
  const [tabIndex, setTabIndex] = useState(0);
  const { data: role, isLoading, isError, refetch } = useRoleDetail(roleId || 0);
  const { data: allPermissions = [], isLoading: permsLoading } = usePermissionsList();
  const updatePermissions = useUpdateRolePermissions();
  
  // Selected permission IDs (initialized from role data)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [searchText, setSearchText] = useState('');
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Build a map of permission code → id from allPermissions
  const permCodeToIdMap = useMemo(() => {
    const map = new Map<string, number>();
    allPermissions.forEach((p) => {
      map.set(`${p.app_label}.${p.codename}`, p.id);
    });
    return map;
  }, [allPermissions]);

  // Initialize selectedIds when role data loads
  useEffect(() => {
    if (role?.permissions_list) {
      const ids = new Set<number>();
      role.permissions_list.forEach((code) => {
        const id = permCodeToIdMap.get(code);
        if (id) ids.add(id);
      });
      setSelectedIds(ids);
    }
  }, [role, permCodeToIdMap]);

  // Group permissions by app_label for display
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    const search = searchText.toLowerCase();
    
    allPermissions.forEach((perm) => {
      if (search && !perm.name.toLowerCase().includes(search) && !perm.codename.toLowerCase().includes(search) && !perm.app_label.toLowerCase().includes(search)) {
        return;
      }
      if (!groups[perm.app_label]) groups[perm.app_label] = [];
      groups[perm.app_label].push(perm);
    });
    
    return groups;
  }, [allPermissions, searchText]);

  const handleToggle = (permId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) next.delete(permId);
      else next.add(permId);
      return next;
    });
  };

  const handleSelectAllForApp = (appLabel: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const perms = groupedPermissions[appLabel] || [];
      perms.forEach((p) => {
        if (checked) next.add(p.id);
        else next.delete(p.id);
      });
      return next;
    });
  };

  const handleSave = async () => {
    if (!roleId) return;
    try {
      await updatePermissions.mutateAsync({
        id: roleId,
        permissions: Array.from(selectedIds),
      });
      setToast({ open: true, message: 'Permissions mises à jour avec succès', severity: 'success' });
      refetch();
    } catch {
      setToast({ open: true, message: 'Erreur lors de la mise à jour des permissions', severity: 'error' });
    }
  };

  if (!roleId) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Détails du rôle</DialogTitle>
      <DialogContent>
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}
        {isError && (
          <Typography color="error">Impossible de charger les détails du rôle</Typography>
        )}
        {role && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar sx={{ width: 56, height: 56, bgcolor: 'secondary.main' }}>
                {role.name?.[0]?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {role.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {role.user_count} utilisateur(s) assigné(s)
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 2 }}>
              <Tab label="Permissions" />
              <Tab label="Utilisateurs" />
            </Tabs>

            {/* ── Permissions Tab ───────────────────────────── */}
            {tabIndex === 0 && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <VerifiedUser color="primary" />
                  <Typography variant="subtitle2" fontWeight={600}>
                    Permissions ({selectedIds.size} sélectionnée(s))
                  </Typography>
                </Box>

                <TextField
                  placeholder="Rechercher une permission..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  size="small"
                  fullWidth
                  sx={{ mb: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />

                {permsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : Object.keys(groupedPermissions).length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    Aucune permission trouvée
                  </Typography>
                ) : (
                  <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {Object.entries(groupedPermissions).map(([appLabel, perms]) => {
                      const appAllSelected = perms.every((p) => selectedIds.has(p.id));
                      const appSomeSelected = perms.some((p) => selectedIds.has(p.id));
                      return (
                        <Box key={appLabel} sx={{ mb: 2, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <Checkbox
                              size="small"
                              checked={appAllSelected}
                              indeterminate={!appAllSelected && appSomeSelected}
                              onChange={(e) => handleSelectAllForApp(appLabel, e.target.checked)}
                            />
                            <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 'bold', fontSize: '0.8rem' }}>
                              {appLabel}
                            </Typography>
                            <Chip label={`${perms.length}`} size="small" sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} />
                          </Box>
                          <FormGroup sx={{ ml: 3 }}>
                            {perms.map((perm) => (
                              <FormControlLabel
                                key={perm.id}
                                control={
                                  <Checkbox
                                    size="small"
                                    checked={selectedIds.has(perm.id)}
                                    onChange={() => handleToggle(perm.id)}
                                  />
                                }
                                label={
                                  <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                                    {perm.name}
                                    <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1, fontFamily: 'monospace', fontSize: '0.7rem' }}>
                                      ({perm.codename})
                                    </Typography>
                                  </Typography>
                                }
                                sx={{ '& .MuiTypography-root': { width: '100%' } }}
                              />
                            ))}
                          </FormGroup>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>
            )}

            {/* ── Users Tab ─────────────────────────────────── */}
            {tabIndex === 1 && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <People color="primary" />
                  <Typography variant="subtitle2" fontWeight={600}>
                    Utilisateurs assignés ({role.users?.length || 0})
                  </Typography>
                </Box>
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {role.users?.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                      Aucun utilisateur assigné à ce rôle
                    </Typography>
                  ) : (
                    role.users?.map((user: any) => (
                      <Box
                        key={user.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          py: 1,
                          px: 2,
                          borderRadius: 1,
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                      >
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.875rem' }}>
                          {user.first_name?.[0] || user.username?.[0]?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {user.first_name} {user.last_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            @{user.username}
                          </Typography>
                        </Box>
                      </Box>
                    ))
                  )}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, justifyContent: 'space-between' }}>
        <Button onClick={onClose}>Fermer</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!roleId || updatePermissions.isPending}
          startIcon={updatePermissions.isPending ? <CircularProgress size={16} /> : null}
        >
          {updatePermissions.isPending ? 'Enregistrement...' : 'Enregistrer les permissions'}
        </Button>
      </DialogActions>

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
    </Dialog>
  );
}
