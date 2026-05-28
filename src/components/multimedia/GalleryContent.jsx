import React from 'react';
import { Box, Typography, Chip, Checkbox, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { SortableContext, rectSortingStrategy, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { IconFolder, IconFolderPlus, IconGripVertical } from '@tabler/icons-react';
import { FILE_META, fileCat } from '../../utils/constants';
import { ItemWrap, AccentBtn } from '../../utils/styles';
import { itemKey } from '../../utils/utils';
import { FileIcon, ItemThumb, ItemActions, SortableItem } from './GalleryComponents';

// ── Shared grid card body ─────────────────────────────────────────────────────
function GridCardBody({ item }) {
  const theme = useTheme();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', p: '12px 8px 10px' }}>
      <ItemThumb item={item} />
      <Typography
        sx={{
          fontSize: 11,
          lineHeight: 1.35,
          textAlign: 'center',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          width: '100%',
          px: 0.5
        }}
      >
        {item.name}
      </Typography>
      {!item.isFolder && (
        <Chip
          label={FILE_META[fileCat(item.type)].label}
          color={FILE_META[fileCat(item.type)].chip}
          size="small"
          sx={{ height: 15, fontSize: 9, '& .MuiChip-label': { px: 0.75 } }}
        />
      )}
    </Box>
  );
}

// ── Grid view ─────────────────────────────────────────────────────────────────
function GridView({ listed, selectMode, selected, reorderMode, contentFolderIds, go, setViewItem, toggleSelect, openDlg }) {
  const theme = useTheme();
  return (
    <SortableContext items={contentFolderIds} strategy={rectSortingStrategy}>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '6px' }}>
        {listed.map((item) => {
          const key = itemKey(item);
          const isSel = selected.has(key);
          const isDraggable = reorderMode && item.isFolder;
          const handleClick = () => (selectMode ? toggleSelect(item) : item.isFolder ? go(item.id) : setViewItem(item));
          const baseSx = { position: 'relative', outline: isSel ? `2px solid ${theme.palette.primary.main}` : 'none' };
          const selectOverlay = (
            <Box
              sx={{ position: 'absolute', top: 4, left: 4, zIndex: 2 }}
              onClick={(e) => {
                e.stopPropagation();
                toggleSelect(item);
              }}
            >
              <Checkbox size="small" checked={isSel} sx={{ p: 0, bgcolor: 'background.paper', borderRadius: 0.5 }} />
            </Box>
          );

          if (isDraggable) {
            return (
              <SortableItem key={key} item={item}>
                {({ dragHandle, isDragging }) => (
                  <ItemWrap isactive={String(isSel)} onClick={handleClick} sx={{ ...baseSx, opacity: isDragging ? 0.4 : 1 }}>
                    {selectMode ? (
                      selectOverlay
                    ) : (
                      <ItemActions
                        item={item}
                        dragHandle={dragHandle}
                        reorderMode={reorderMode}
                        onRename={(i) => openDlg('rename', i)}
                        onMove={(i) => openDlg('move', i)}
                        onDelete={(i) => openDlg('delete', i)}
                      />
                    )}
                    <GridCardBody item={item} />
                  </ItemWrap>
                )}
              </SortableItem>
            );
          }

          return (
            <ItemWrap key={key} isactive={String(isSel)} onClick={handleClick} sx={baseSx}>
              {selectMode ? (
                selectOverlay
              ) : (
                <ItemActions
                  item={item}
                  reorderMode={reorderMode}
                  onRename={(i) => openDlg('rename', i)}
                  onMove={(i) => openDlg('move', i)}
                  onDelete={(i) => openDlg('delete', i)}
                />
              )}
              <GridCardBody item={item} />
            </ItemWrap>
          );
        })}
      </Box>
    </SortableContext>
  );
}

// ── List view ─────────────────────────────────────────────────────────────────
function ListHeader({ selectMode, allSelected, someSelected, toggleSelectAll, theme }) {
  const listCols = `${selectMode ? '32px ' : ''}1fr 90px 90px 80px`;
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: listCols,
        py: 0.75,
        px: 1.5,
        borderBottom: `1px solid ${theme.palette.divider}`,
        mb: 0.5
      }}
    >
      {selectMode && <Checkbox size="small" checked={allSelected} indeterminate={someSelected} onChange={toggleSelectAll} sx={{ p: 0 }} />}
      {['Name', 'Type', 'Size', 'Modified'].map((h) => (
        <Typography key={h} variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textAlign: h !== 'Name' ? 'right' : 'left' }}>
          {h}
        </Typography>
      ))}
    </Box>
  );
}

function ListView({
  listed,
  selectMode,
  selected,
  reorderMode,
  contentFolderIds,
  go,
  setViewItem,
  toggleSelect,
  toggleSelectAll,
  allSelected,
  someSelected,
  openDlg
}) {
  const theme = useTheme();
  const listCols = `${selectMode ? '32px ' : ''}1fr 90px 90px 80px`;

  const rowContent = (item, isSel, dragHandle) => (
    <>
      {selectMode ? (
        <Checkbox
          size="small"
          checked={isSel}
          onClick={(e) => {
            e.stopPropagation();
            toggleSelect(item);
          }}
          sx={{ p: 0 }}
        />
      ) : (
        <ItemActions
          item={item}
          dragHandle={dragHandle}
          reorderMode={reorderMode}
          onRename={(i) => openDlg('rename', i)}
          onMove={(i) => openDlg('move', i)}
          onDelete={(i) => openDlg('delete', i)}
        />
      )}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden' }}>
        <FileIcon mime={item.type} isFolder={item.isFolder} size={17} />
        <Typography variant="body2" noWrap>
          {item.name}
        </Typography>
      </Box>
      <Box sx={{ textAlign: 'right' }}>
        {!item.isFolder && (
          <Chip
            label={FILE_META[fileCat(item.type)].label}
            color={FILE_META[fileCat(item.type)].chip}
            size="small"
            sx={{ height: 15, fontSize: 9, '& .MuiChip-label': { px: 0.75 } }}
          />
        )}
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right' }}>
        {item.isFolder ? '—' : item.size}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right' }}>
        {item.updated_at ? new Date(item.updated_at).toLocaleDateString() : '—'}
      </Typography>
    </>
  );

  const rowSx = (isSel, isDragging = false) => ({
    display: 'grid',
    gridTemplateColumns: listCols,
    alignItems: 'center',
    px: 1.5,
    py: 0.75,
    mb: 0.25,
    borderRadius: 1.5,
    outline: isSel ? `2px solid ${theme.palette.primary.main}` : 'none',
    opacity: isDragging ? 0.4 : 1
  });

  return (
    <Box>
      <ListHeader
        selectMode={selectMode}
        allSelected={allSelected}
        someSelected={someSelected}
        toggleSelectAll={toggleSelectAll}
        theme={theme}
      />
      <SortableContext items={contentFolderIds} strategy={verticalListSortingStrategy}>
        {listed.map((item) => {
          const key = itemKey(item);
          const isSel = selected.has(key);
          const isDraggable = reorderMode && item.isFolder;
          const handleClick = () => (selectMode ? toggleSelect(item) : item.isFolder ? go(item.id) : setViewItem(item));

          if (isDraggable) {
            return (
              <SortableItem key={key} item={item}>
                {({ dragHandle, isDragging }) => (
                  <ItemWrap isactive={String(isSel)} onClick={handleClick} sx={rowSx(isSel, isDragging)}>
                    {rowContent(item, isSel, dragHandle)}
                  </ItemWrap>
                )}
              </SortableItem>
            );
          }

          return (
            <ItemWrap key={key} isactive={String(isSel)} onClick={handleClick} sx={rowSx(isSel)}>
              {rowContent(item, isSel, null)}
            </ItemWrap>
          );
        })}
      </SortableContext>
    </Box>
  );
}

// ── GalleryContent ────────────────────────────────────────────────────────────
export default function GalleryContent({
  loading,
  listed,
  view,
  query,
  reorderMode,
  selectMode,
  selected,
  allSelected,
  someSelected,
  contentFolderIds,
  go,
  setViewItem,
  toggleSelect,
  toggleSelectAll,
  openDlg
}) {
  const theme = useTheme();

  if (loading)
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100%" gap={1}>
        <CircularProgress size={26} />
        <Typography variant="caption" color="text.secondary">
          Loading…
        </Typography>
      </Box>
    );

  if (!listed.length)
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100%"
        gap={1.5}
        sx={{ color: 'text.disabled' }}
      >
        <IconFolder size={52} strokeWidth={1} />
        <Typography variant="body2">{query ? `No results for "${query}"` : 'This folder is empty'}</Typography>
        {!query && (
          <AccentBtn onClick={() => openDlg('new', null)} startIcon={<IconFolderPlus size={14} />}>
            New folder
          </AccentBtn>
        )}
      </Box>
    );

  const sharedProps = {
    listed,
    selectMode,
    selected,
    reorderMode,
    contentFolderIds,
    go,
    setViewItem,
    toggleSelect,
    toggleSelectAll,
    allSelected,
    someSelected,
    openDlg
  };

  return (
    <>
      {reorderMode && (
        <Box
          sx={{
            mb: 1.5,
            px: 1.5,
            py: 0.75,
            borderRadius: 1.5,
            bgcolor: theme.palette.primary.lighter ?? theme.palette.action.selected,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <IconGripVertical size={14} color={theme.palette.primary.main} />
          <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontWeight: 500 }}>
            Drag the <strong>grip handle</strong> on folders to reorder. Changes save automatically.
          </Typography>
        </Box>
      )}
      {view === 'grid' ? <GridView {...sharedProps} /> : <ListView {...sharedProps} />}
    </>
  );
}
