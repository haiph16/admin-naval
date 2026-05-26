import { useTheme } from '@mui/material/styles';
import { Typography, Box, Stack } from '@mui/material';
import { IconAnchor } from '@tabler/icons-react';

export default function Logo() {
  const theme = useTheme();

  return (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ py: 0.5 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 44,
          height: 44,
          borderRadius: '12px',
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
          color: '#fff',
          flexShrink: 0,
        }}
      >
        <IconAnchor size={22} stroke={2} />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            letterSpacing: '0.5px',
            lineHeight: 1.4,          // ← tăng lineHeight để dấu tiếng Việt không bị cắt
            pb: '3px',                // ← padding dưới để chữ có chỗ thở
            background: `linear-gradient(90deg, ${theme.palette.grey[900]} 0%, ${theme.palette.primary.main} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          BẢO TÀNG HẢI QUÂN
        </Typography>

        <Typography
          variant="caption"
          sx={{
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: 'text.disabled',
            fontWeight: 500,
            fontSize: '10px',
          }}
        >
          Naval Museum
        </Typography>
      </Box>
    </Stack>
  );
}