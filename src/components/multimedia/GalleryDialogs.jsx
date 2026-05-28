import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { IconFolderPlus, IconCheck, IconEdit, IconAlertTriangle, IconTrash, IconFolderShare } from '@tabler/icons-react';

function SimpleDialog({ open, onClose, title, icon, children, actions }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 0.5 }}>{icon}{title}</DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>{actions}</DialogActions>
    </Dialog>
  );
}

export default function GalleryDialogs({
  dlg, closeDlg, target,
  folderNames, setFolderNames, doCreate,
  renameVal, setRenameVal, doRename,
  doDelete,
  moveDestId, setMoveDestId, doMove, folders
}) {
  const theme = useTheme();

  return (
    <>
      {/* New folder */}
      <SimpleDialog open={dlg === 'new'} onClose={closeDlg} title="New folder" icon={<IconFolderPlus size={20} color={theme.palette.primary.main} />}
        actions={<>
          <Button onClick={closeDlg} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={doCreate} disabled={!folderNames.vi || !folderNames.en} startIcon={<IconCheck size={14} />} sx={{ borderRadius: 2 }}>Create</Button>
        </>}>
        <Stack spacing={2} sx={{ mt: 1.5 }}>
          <TextField fullWidth label="Vietnamese name" autoFocus value={folderNames.vi} onChange={e => setFolderNames(p => ({ ...p, vi: e.target.value }))} placeholder="e.g. Hình ảnh sản phẩm" />
          <TextField fullWidth label="English name" value={folderNames.en} onChange={e => setFolderNames(p => ({ ...p, en: e.target.value }))} placeholder="e.g. Product Images" />
        </Stack>
      </SimpleDialog>

      {/* Rename */}
      <SimpleDialog open={dlg === 'rename'} onClose={closeDlg} title={`Rename ${target?.isFolder ? 'folder' : 'file'}`} icon={<IconEdit size={20} />}
        actions={<>
          <Button onClick={closeDlg} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={doRename} disabled={!renameVal} startIcon={<IconCheck size={14} />} sx={{ borderRadius: 2 }}>Rename</Button>
        </>}>
        <TextField fullWidth label="New name" autoFocus sx={{ mt: 1.5 }} value={renameVal} onChange={e => setRenameVal(e.target.value)} onKeyDown={e => e.key === 'Enter' && doRename()} />
      </SimpleDialog>

      {/* Delete */}
      <SimpleDialog open={dlg === 'delete'} onClose={closeDlg} title={`Delete "${target?.name}"`} icon={<IconAlertTriangle size={20} color={theme.palette.error.main} />}
        actions={<>
          <Button onClick={closeDlg} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={doDelete} startIcon={<IconTrash size={14} />} sx={{ borderRadius: 2 }}>Delete</Button>
        </>}>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>This cannot be undone.</Typography>
      </SimpleDialog>

      {/* Move */}
      <SimpleDialog open={dlg === 'move'} onClose={closeDlg} title={`Move "${target?.name}"`} icon={<IconFolderShare size={20} color={theme.palette.primary.main} />}
        actions={<>
          <Button onClick={closeDlg} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={doMove} disabled={moveDestId === ''} startIcon={<IconCheck size={14} />} sx={{ borderRadius: 2 }}>Move</Button>
        </>}>
        <FormControl fullWidth sx={{ mt: 1.5 }}>
          <InputLabel>Destination folder</InputLabel>
          <Select label="Destination folder" value={moveDestId} onChange={e => setMoveDestId(e.target.value)}>
            <MenuItem value={0}>— Home (root) —</MenuItem>
            {folders.filter(f => f.id !== target?.id).map(f => (
              <MenuItem key={f.id} value={f.id}>{f.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </SimpleDialog>
    </>
  );
}
