import { useTheme } from '@mui/material/styles';
import { Typography, Box, Stack } from '@mui/material';
import logoImage from '../assets/images/logo.png';

export default function Logo() {
  const theme = useTheme();

  return (
    <Stack direction="row" alignItems="center" width="100%" spacing={1.5} sx={{ py: 0.5 }}>
      <Box>
        <img
          src={logoImage}
          alt="Logo"
          style={{
            width: '50px',
            height: '50px',
            objectFit: 'contain'
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            letterSpacing: '0.5px',
            lineHeight: 1.4, // ← tăng lineHeight để dấu tiếng Việt không bị cắt
            pb: '3px', // ← padding dưới để chữ có chỗ thở
            background: `linear-gradient(90deg, ${theme.palette.grey[900]} 0%, ${theme.palette.primary.main} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          BẢO TÀNG HẢI QUÂN
        </Typography>

        <Typography
          variant="caption"
          sx={{
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: 'text.secondary',
            fontWeight: 500,
            fontSize: '14px'
          }}
        >
          Naval Museum
        </Typography>
      </Box>
    </Stack>
  );
}
