import { styled, alpha } from '@mui/material/styles';
import { Box, TextField, Button, IconButton, Typography } from '@mui/material';

export const Shell = styled(Box)(({ theme }) => ({
  display: 'flex', flexDirection: 'column', height: '85vh',
  overflow: 'hidden', borderRadius: 16, background: theme.palette.background.paper,
}));

export const Topbar = styled(Box)(({ theme }) => ({
  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
  borderBottom: `1px solid ${theme.palette.divider}`,
  background: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.grey[50],
  flexShrink: 0,
}));

export const NBtn = styled(IconButton)(({ theme }) => ({
  width: 30, height: 30, borderRadius: 8, color: theme.palette.text.secondary,
  '&:hover': { background: theme.palette.background.paper },
}));

export const AddrBar = styled(Box)(({ theme }) => ({
  flex: 1, display: 'flex', alignItems: 'center',
  background: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 10, padding: '0 10px', height: 32, overflow: 'hidden',
}));

export const SBar = styled(TextField)(({ theme }) => ({
  width: 190,
  '& .MuiOutlinedInput-root': {
    height: 32, borderRadius: 10, fontSize: 12,
    background: theme.palette.background.paper,
    '& fieldset': { borderColor: theme.palette.divider },
    '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main, borderWidth: 1 },
  },
  '& .MuiInputBase-input': { padding: '0 8px', fontSize: 12 },
}));

export const SubBar = styled(Box)(({ theme }) => ({
  display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
  borderBottom: `1px solid ${theme.palette.divider}`, flexShrink: 0,
}));

export const SBtn = styled(Button)(({ theme }) => ({
  height: 28, borderRadius: 8, fontSize: 12, textTransform: 'none',
  padding: '0 11px', gap: 5, border: `1px solid ${theme.palette.divider}`,
  color: theme.palette.text.primary, background: theme.palette.background.paper,
  '&:hover': { background: alpha(theme.palette.primary.main, 0.06) },
  minWidth: 0,
}));

export const AccentBtn = styled(SBtn)(({ theme }) => ({
  background: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  borderColor: alpha(theme.palette.primary.main, 0.3),
  '&:hover': { background: alpha(theme.palette.primary.main, 0.18) },
}));

export const VToggle = styled(Box)(({ theme }) => ({
  display: 'flex', border: `1px solid ${theme.palette.divider}`,
  borderRadius: 8, overflow: 'hidden', marginLeft: 'auto',
}));

export const VBtn = styled(IconButton)(({ theme, isactive }) => ({
  width: 28, height: 28, borderRadius: 0,
  color: isactive === 'true' ? theme.palette.primary.main : theme.palette.text.secondary,
  background: isactive === 'true' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
  '&:hover': { background: isactive === 'true' ? alpha(theme.palette.primary.main, 0.16) : theme.palette.action.hover },
}));

export const SidebarContainer = styled(Box)(({ theme }) => ({
  width: 196, flexShrink: 0, borderRight: `1px solid ${theme.palette.divider}`,
  background: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.grey[50],
  overflowY: 'auto', padding: '10px 8px',
}));

export const SbLabel = styled(Typography)({
  fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
  padding: '10px 8px 4px', color: 'inherit', opacity: 0.45,
});

export const SbItem = styled(Box)(({ theme, isactive }) => ({
  display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px',
  borderRadius: 8, cursor: 'pointer', fontSize: 12, marginBottom: 1,
  color: isactive === 'true' ? theme.palette.primary.main : theme.palette.text.secondary,
  background: isactive === 'true' ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
  fontWeight: isactive === 'true' ? 600 : 400,
  '&:hover': { background: theme.palette.action.hover, color: isactive === 'true' ? theme.palette.primary.main : theme.palette.text.primary },
  whiteSpace: 'nowrap', overflow: 'hidden',
}));

export const ItemWrap = styled(Box)(({ theme, isactive }) => ({
  position: 'relative', borderRadius: 10, cursor: 'pointer',
  border: `1px solid ${isactive === 'true' ? theme.palette.primary.main : 'transparent'}`,
  background: isactive === 'true' ? alpha(theme.palette.primary.main, 0.07) : 'transparent',
  transition: 'background .1s, border-color .1s',
  '&:hover': {
    background: isactive === 'true' ? alpha(theme.palette.primary.main, 0.11) : theme.palette.action.hover,
    borderColor: isactive === 'true' ? theme.palette.primary.main : theme.palette.divider,
    '& .item-actions': { opacity: 1 },
  },
}));

export const ActionBar = styled(Box)(({ theme }) => ({
  position: 'absolute', top: 5, right: 5, opacity: 0, transition: 'opacity .15s',
  display: 'flex', gap: 2, background: theme.palette.background.paper,
  borderRadius: 7, border: `1px solid ${theme.palette.divider}`, padding: '2px 3px',
  zIndex: 2,
}));

export const ABtn = styled(IconButton)(({ theme, danger }) => ({
  width: 22, height: 22, borderRadius: 5, padding: 0,
  color: danger === 'true' ? theme.palette.error.main : theme.palette.text.secondary,
  '&:hover': {
    background: danger === 'true' ? alpha(theme.palette.error.main, 0.1) : theme.palette.action.hover,
    color: danger === 'true' ? theme.palette.error.main : theme.palette.text.primary,
  },
}));

export const IconBg = styled(Box)(({ bg }) => ({
  width: 52, height: 52, borderRadius: 10, background: bg,
  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
}));

export const StatusBar = styled(Box)(({ theme }) => ({
  display: 'flex', alignItems: 'center', gap: 10, padding: '5px 14px',
  borderTop: `1px solid ${theme.palette.divider}`,
  background: theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.grey[50],
  flexShrink: 0, fontSize: 11, color: theme.palette.text.secondary,
}));
