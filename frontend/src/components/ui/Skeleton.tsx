import { Skeleton as MuiSkeleton, Box } from '@mui/material';

export function ProfileSkeleton() {
  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
        <MuiSkeleton variant="circular" width={80} height={80} />
        <Box sx={{ flex: 1 }}>
          <MuiSkeleton variant="text" width={200} height={32} />
          <MuiSkeleton variant="text" width={150} height={24} />
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {[...Array(5)].map((_, i) => (
          <Box key={i}>
            <MuiSkeleton variant="text" width="30%" height={20} />
            <MuiSkeleton variant="rectangular" width="100%" height={56} sx={{ mt: 0.5 }} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export function DashboardSkeleton() {
  return (
    <Box>
      <MuiSkeleton variant="text" width={300} height={40} sx={{ mb: 1 }} />
      <MuiSkeleton variant="text" width={200} height={24} sx={{ mb: 4 }} />
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        {[...Array(4)].map((_, i) => (
          <Box key={i} sx={{ flex: 1 }}>
            <MuiSkeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
          </Box>
        ))}
      </Box>
      <MuiSkeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
    </Box>
  );
}
