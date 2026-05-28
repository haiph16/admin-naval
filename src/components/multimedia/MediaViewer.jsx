import React from 'react';
import {
  Dialog,
  Box,
  IconButton,
  Typography,
  useTheme,
  Fade
} from '@mui/material';
import {
  IconX,
  IconExternalLink
} from '@tabler/icons-react';

export default function MediaViewer({ item, onClose }) {
  const theme = useTheme();

  if (!item) return null;

  const isImage = item.type?.startsWith('image/');
  const isVideo = item.type?.startsWith('video/');
  const isAudio = item.type?.startsWith('audio/');

  const url =
    item.urls?.original ||
    item.url?.original ||
    item.urls?.medium ||
    (typeof item.url === 'string' ? item.url : null);

  return (
    <Dialog
      open={Boolean(item)}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      TransitionComponent={Fade}
      PaperProps={{
        sx: {
          bgcolor: '#ffffff',
          borderRadius: '28px',
          overflow: 'hidden',
          boxShadow: '0 20px 80px rgba(15,23,42,0.18)',
          position: 'relative',
          border: '1px solid rgba(15,23,42,0.06)',
          backdropFilter: 'blur(20px)',
        }
      }}
    >
      {/* Header */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          px: 3,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: `
            linear-gradient(
              180deg,
              rgba(255,255,255,0.92),
              rgba(255,255,255,0.65)
            )
          `,
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(15,23,42,0.06)',
        }}
      >
        <Typography
          variant="h6"
          noWrap
          sx={{
            flex: 1,
            pr: 2,
            fontWeight: 700,
            color: '#0f172a',
            fontFamily: '"Be Vietnam Pro", sans-serif',
            letterSpacing: '0.4px',
          }}
        >
          {item.name}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => window.open(url, '_blank')}
            sx={{
              bgcolor: 'rgba(15,23,42,0.05)',
              color: '#0f172a',
              transition: '0.25s',

              '&:hover': {
                bgcolor: theme.palette.primary.main,
                color: '#fff',
                transform: 'translateY(-1px)',
              }
            }}
          >
            <IconExternalLink size={18} />
          </IconButton>

          <IconButton
            size="small"
            onClick={onClose}
            sx={{
              bgcolor: 'rgba(15,23,42,0.05)',
              color: '#0f172a',
              transition: '0.25s',

              '&:hover': {
                bgcolor: '#ef4444',
                color: '#fff',
                transform: 'translateY(-1px)',
              }
            }}
          >
            <IconX size={18} />
          </IconButton>
        </Box>
      </Box>

      {/* Content */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '75vh',
          bgcolor: '#f8fafc',
          p: 3,
        }}
      >
        {!url ? (
          <Typography
            sx={{
              color: '#64748b',
              fontWeight: 500,
            }}
          >
            No URL available to preview.
          </Typography>
        ) : isImage ? (
          <Box
            component="img"
            src={url}
            alt={item.name}
            sx={{
              maxWidth: '100%',
              maxHeight: '80vh',
              marginTop: '30px',
              objectFit: 'contain',
              borderRadius: '20px',
              boxShadow: '0 10px 40px rgba(15,23,42,0.12)',
              background: '#fff',
            }}
          />
        ) : isVideo ? (
          <Box
            component="video"
            controls
            autoPlay
            src={url}
            sx={{
              width: '100%',
              maxHeight: '80vh',
              marginTop: '30px',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 10px 40px rgba(15,23,42,0.12)',
              background: '#000',
              outline: 'none',
            }}
          />
        ) : isAudio ? (
          <Box
            sx={{
              width: '100%',
              maxWidth: 500,
              p: 4,
              borderRadius: '24px',
              bgcolor: '#fff',
              boxShadow: '0 10px 40px rgba(15,23,42,0.08)',
              textAlign: 'center',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: 700,
                color: '#0f172a',
              }}
            >
              Audio Preview
            </Typography>

            <Box
              component="audio"
              controls
              autoPlay
              src={url}
              sx={{
                width: '100%',
              }}
            />
          </Box>
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              p: 6,
              borderRadius: '24px',
              bgcolor: '#fff',
              boxShadow: '0 10px 40px rgba(15,23,42,0.08)',
            }}
          >
            <Typography
              sx={{
                color: '#475569',
                mb: 3,
                fontWeight: 500,
              }}
            >
              Preview not supported for this file type.
            </Typography>

            <IconButton
              onClick={() => window.open(url, '_blank')}
              sx={{
                width: 56,
                height: 56,
                bgcolor: theme.palette.primary.main,
                color: '#fff',

                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
                  transform: 'scale(1.05)',
                }
              }}
            >
              <IconExternalLink size={22} />
            </IconButton>
          </Box>
        )}
      </Box>
    </Dialog>
  );
}