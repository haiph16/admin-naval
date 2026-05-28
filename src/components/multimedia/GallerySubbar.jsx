import React from 'react';
import { Box, Typography, Chip, FormControl, Select, MenuItem, Checkbox, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  IconFolderPlus,
  IconUpload,
  IconSquareCheck,
  IconGripVertical,
  IconFolderShare,
  IconTrash,
  IconLayoutGrid,
  IconListDetails
} from '@tabler/icons-react';
import { SubBar, SBtn, AccentBtn, VToggle, VBtn } from '../../utils/styles';

function ToggleBtn({ active, onClick, children, theme }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        cursor: 'pointer',
        px: 1.25,
        height: 28,
        borderRadius: 1.5,
        fontSize: 12,
        fontWeight: 500,
        border: `1px solid ${active ? theme.palette.primary.main : theme.palette.divider}`,
        color: active ? theme.palette.primary.main : theme.palette.text.secondary,
        bgcolor: active ? (theme.palette.primary.lighter ?? theme.palette.action.selected) : 'transparent',
        userSelect: 'none',
        '&:hover': { borderColor: theme.palette.primary.main, color: theme.palette.primary.main },
        transition: 'all .15s'
      }}
    >
      {children}
    </Box>
  );
}

export default function GallerySubbar({
  selectMode,
  reorderMode,
  setReorderMode,
  uploadTask,
  openDlg,
  handleUpload,
  toggleSelectMode,
  toggleSelectAll,
  allSelected,
  someSelected,
  selected,
  setBulkMoveDest,
  setBulkDlg,
  mediaFilter,
  setMediaFilter,
  setPage,
  view,
  setView,
  theme: themeProp
}) {
  const theme = themeProp || useTheme();

  return (
    <SubBar>
      {!selectMode ? (
        <>
          <AccentBtn onClick={() => openDlg('new', null)} startIcon={<IconFolderPlus size={14} />}>
            New folder
          </AccentBtn>

          {!uploadTask ? (
            <SBtn component="label" startIcon={<IconUpload size={14} />}>
              Upload
              <input
                type="file"
                hidden
                multiple
                onClick={(e) => e.stopPropagation()} // ← chặn event bubble lên label
                onChange={handleUpload}
              />
            </SBtn>
          ) : (
            <Chip
              size="small"
              color="primary"
              label={`Uploading ${uploadTask.current}/${uploadTask.total}`}
              sx={{ height: 28, borderRadius: 2 }}
            />
          )}

          <ToggleBtn active={false} onClick={toggleSelectMode} theme={theme}>
            <IconSquareCheck size={14} /> Select
          </ToggleBtn>
          <ToggleBtn active={reorderMode} onClick={() => setReorderMode((p) => !p)} theme={theme}>
            <IconGripVertical size={14} /> Reorder
          </ToggleBtn>
        </>
      ) : (
        <>
          <Box
            onClick={toggleSelectAll}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              cursor: 'pointer',
              px: 0.75,
              height: 28,
              borderRadius: 1.5,
              bgcolor: theme.palette.primary.lighter ?? theme.palette.action.selected,
              '&:hover': { bgcolor: theme.palette.action.focus }
            }}
          >
            <Checkbox
              size="small"
              checked={allSelected}
              indeterminate={someSelected}
              onChange={toggleSelectAll}
              onClick={(e) => e.stopPropagation()}
              sx={{ p: 0 }}
            />
            <Typography sx={{ fontSize: 12, fontWeight: 500, userSelect: 'none', whiteSpace: 'nowrap' }}>
              {selected.size > 0 ? `${selected.size} selected` : 'Select all'}
            </Typography>
          </Box>

          {selected.size > 0 && (
            <>
              <SBtn
                startIcon={<IconFolderShare size={14} />}
                onClick={() => {
                  setBulkMoveDest('');
                  setBulkDlg('move');
                }}
              >
                Move
              </SBtn>
              <SBtn
                startIcon={<IconTrash size={14} />}
                onClick={() => setBulkDlg('delete')}
                sx={{
                  color: theme.palette.error.main,
                  borderColor: theme.palette.error.light,
                  '&:hover': { bgcolor: '#fff0f0', borderColor: theme.palette.error.main }
                }}
              >
                Delete&nbsp;({selected.size})
              </SBtn>
            </>
          )}

          <Button
            size="small"
            onClick={toggleSelectMode}
            sx={{ ml: 0.5, fontSize: 12, color: 'text.secondary', textTransform: 'none', minWidth: 0, px: 1 }}
          >
            Cancel
          </Button>
        </>
      )}

      <FormControl size="small" sx={{ minWidth: 100, ml: 'auto' }}>
        <Select
          value={mediaFilter}
          displayEmpty
          onChange={(e) => {
            setMediaFilter(e.target.value);
            setPage(1);
          }}
          sx={{
            height: 28,
            fontSize: 12,
            '& .MuiSelect-select': { py: 0, display: 'flex', alignItems: 'center' },
            '.MuiOutlinedInput-notchedOutline': { borderColor: theme.palette.divider }
          }}
        >
          <MenuItem value="">All Data</MenuItem>
          <MenuItem value="image">Images</MenuItem>
          <MenuItem value="video">Videos</MenuItem>
          <MenuItem value="audio">Audio</MenuItem>
          <MenuItem value="other">Other</MenuItem>
        </Select>
      </FormControl>

      <VToggle sx={{ ml: 1 }}>
        <VBtn size="small" isactive={String(view === 'grid')} onClick={() => setView('grid')} aria-label="Grid">
          <IconLayoutGrid size={15} />
        </VBtn>
        <VBtn size="small" isactive={String(view === 'list')} onClick={() => setView('list')} aria-label="List">
          <IconListDetails size={15} />
        </VBtn>
      </VToggle>
    </SubBar>
  );
}
