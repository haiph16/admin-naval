import React from 'react';
import { Box, Typography, Collapse } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  IconFolder,
  IconFile,
  IconPhoto,
  IconVideo,
  IconFileMusic,
  IconFileText,
  IconChevronRight,
  IconChevronDown,
  IconGripVertical,
  IconEdit,
  IconFolderShare,
  IconTrash
} from '@tabler/icons-react';
import { FILE_META, fileCat } from '../../utils/constants';
import { SbItem, ItemWrap, ActionBar, ABtn, IconBg } from '../../utils/styles';

// ── FileIcon ──────────────────────────────────────────────────────────────────
export function FileIcon({ mime, isFolder, size = 26 }) {
  const { palette } = useTheme();
  if (isFolder) return <IconFolder size={size} color="#FFCA28" />;
  const cat = fileCat(mime);
  const { color } = FILE_META[cat];
  const MAP = { image: IconPhoto, video: IconVideo, audio: IconFileMusic, pdf: IconFileText, text: IconFileText };
  const Icon = MAP[cat];
  return Icon ? <Icon size={size} color={color} /> : <IconFile size={size} color={palette.text.disabled} />;
}

// ── ItemThumb ─────────────────────────────────────────────────────────────────
export function ItemThumb({ item }) {
  const getIconBg = (i) => (i.isFolder ? '#FAEEDA' : FILE_META[fileCat(i.type)].bg);
  if (!item.isFolder && item.url)
    return (
      <Box sx={{ width: 52, height: 52, borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
        <Box
          component="img"
          src={item.url}
          alt={item.name}
          sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </Box>
    );
  return (
    <IconBg bg={getIconBg(item)}>
      <FileIcon mime={item.type} isFolder={item.isFolder} size={26} />
    </IconBg>
  );
}

// ── ItemActions ───────────────────────────────────────────────────────────────
export function ItemActions({ item, dragHandle, reorderMode, onRename, onMove, onDelete }) {
  return (
    <ActionBar className="item-actions" onClick={(e) => e.stopPropagation()}>
      {reorderMode && item.isFolder && dragHandle && (
        <ABtn size="small" title="Drag to reorder" sx={{ cursor: 'grab' }} {...dragHandle.attributes} {...dragHandle.listeners}>
          <IconGripVertical size={13} />
        </ABtn>
      )}
      <ABtn size="small" title="Rename" onClick={() => onRename(item)}>
        <IconEdit size={13} />
      </ABtn>
      <ABtn size="small" title="Move" onClick={() => onMove(item)}>
        <IconFolderShare size={13} />
      </ABtn>
      <ABtn size="small" danger="true" title="Delete" onClick={() => onDelete(item)}>
        <IconTrash size={13} />
      </ABtn>
    </ActionBar>
  );
}

// ── SortableItem ──────────────────────────────────────────────────────────────
export function SortableItem({ item, children, disabled = false }) {
  const { setNodeRef, transform, transition, isDragging, attributes, listeners } = useSortable({
    id: item.isFolder ? `f-${item.id}` : `m-${item.id}`,
    disabled
  });
  return (
    <Box ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}>
      {children({ dragHandle: { attributes, listeners }, isDragging })}
    </Box>
  );
}

// ── TreeItem ──────────────────────────────────────────────────────────────────
export function TreeItem({ folder, level, cid, folders, onNav, expanded, setExpanded, sortable = false }) {
  const { palette } = useTheme();
  const isOpen = expanded.includes(folder.id);
  const hasKids = folders.some((f) => f.parentId === folder.id);
  const isActive = cid === folder.id;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `f-${folder.id}`,
    disabled: !sortable
  });

  const style = sortable ? { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 } : {};

  const toggleExpand = (e) => {
    if (!hasKids) return;
    e.stopPropagation();
    setExpanded((p) => (isOpen ? p.filter((i) => i !== folder.id) : [...p, folder.id]));
  };

  return (
    <Box ref={sortable ? setNodeRef : undefined} style={style}>
      <SbItem isactive={String(isActive)} style={{ paddingLeft: 8 + level * 14 }} onClick={() => onNav(folder.id)}>
        {sortable && (
          <Box
            component="span"
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'grab',
              color: 'text.disabled',
              mr: 0.25,
              '&:hover': { color: 'text.secondary' }
            }}
          >
            <IconGripVertical size={11} />
          </Box>
        )}
        <Box component="span" sx={{ display: 'flex', alignItems: 'center' }} onClick={toggleExpand}>
          {hasKids ? isOpen ? <IconChevronDown size={11} /> : <IconChevronRight size={11} /> : <Box sx={{ width: 11 }} />}
        </Box>
        <IconFolder size={14} color={isActive ? palette.primary.main : '#FFCA28'} />
        <Typography sx={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{folder.name}</Typography>
      </SbItem>

      {hasKids && (
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          {folders
            .filter((f) => f.parentId === folder.id)
            .map((c) => (
              <TreeItem
                key={c.id}
                folder={c}
                level={level + 1}
                cid={cid}
                folders={folders}
                onNav={onNav}
                expanded={expanded}
                setExpanded={setExpanded}
                sortable={false}
              />
            ))}
        </Collapse>
      )}
    </Box>
  );
}
