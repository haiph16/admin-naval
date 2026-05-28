import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, FormControl, Select, MenuItem, CircularProgress } from '@mui/material';
import { IconTrash, IconFolderShare } from '@tabler/icons-react';

export default function BulkDialogs({ bulkDlg, setBulkDlg, bulkLoading, selected, selectedItems, folders, bulkMoveDest, setBulkMoveDest, doBulkDelete, doBulkMove }) {
  const count = selected.size;
  const label = `${count} item${count !== 1 ? 's' : ''}`;

  return (
    <>
      {/* Delete */}
      <Dialog open={bulkDlg === 'delete'} onClose={() => !bulkLoading && setBulkDlg(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete {label}?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Permanently delete {label}. Folders and their contents will be removed. This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDlg(null)} disabled={bulkLoading}>Cancel</Button>
          <Button onClick={doBulkDelete} color="error" variant="contained" disabled={bulkLoading}
            startIcon={bulkLoading ? <CircularProgress size={14} color="inherit" /> : <IconTrash size={14} />}>
            {bulkLoading ? 'Deleting…' : `Delete ${count}`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Move */}
      <Dialog open={bulkDlg === 'move'} onClose={() => !bulkLoading && setBulkDlg(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Move {label}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Choose a destination folder.</Typography>
          <FormControl fullWidth size="small">
            <Select value={bulkMoveDest} displayEmpty onChange={(e) => setBulkMoveDest(e.target.value)}>
              <MenuItem value="">— Home (root) —</MenuItem>
              {folders
                .filter((f) => !selectedItems.some((s) => s.isFolder && s.id === f.id))
                .map((f) => <MenuItem key={f.id} value={String(f.id)}>{f.name}</MenuItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDlg(null)} disabled={bulkLoading}>Cancel</Button>
          <Button onClick={doBulkMove} variant="contained" disabled={bulkLoading || bulkMoveDest === ''}
            startIcon={bulkLoading ? <CircularProgress size={14} color="inherit" /> : <IconFolderShare size={14} />}>
            {bulkLoading ? 'Moving…' : 'Move'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
