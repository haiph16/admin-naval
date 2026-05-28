import React from 'react';
import { Box, Collapse, Typography, useTheme } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconChevronDown, IconChevronRight, IconFolder, IconGripVertical } from '@tabler/icons-react';
import { SbItem } from '../../utils/styles';

/**
 * TreeItem component - Sidebar folder tree item (supports drag to reorder)
 */
function GalleryTreeItem({ folder, level, cid, folders, onNav, expanded, setExpanded, sortable = false }) {
  const { palette } = useTheme();
  const isOpen = expanded.includes(folder.id);
  const hasKids = folders.some((f) => f.parentId === folder.id);
  const isActive = cid === folder.id;

  // dnd-kit sortable hook (only when sortable=true)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: folder.id,
    disabled: !sortable
  });

  const style = sortable
    ? {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1
      }
    : {};

  return (
    <Box ref={sortable ? setNodeRef : undefined} style={style}>
      <SbItem isactive={String(isActive)} style={{ paddingLeft: 8 + level * 14 }} onClick={() => onNav(folder.id)}>
        {/* drag handle */}
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

        {/* expand toggle */}
        <Box
          component="span"
          sx={{ display: 'flex', alignItems: 'center' }}
          onClick={(e) => {
            if (!hasKids) return;
            e.stopPropagation();
            setExpanded((p) => (isOpen ? p.filter((i) => i !== folder.id) : [...p, folder.id]));
          }}
        >
          {hasKids ? isOpen ? <IconChevronDown size={11} /> : <IconChevronRight size={11} /> : <Box sx={{ width: 11 }} />}
        </Box>

        <IconFolder size={14} color={isActive ? palette.primary.main : '#FFCA28'} />
        <Typography sx={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{folder.name}</Typography>
        <Typography
          sx={{
            fontSize: 10,
            color: 'text.secondary',
            ml: 0.5,
            px: 0.75,
            py: 0.25,
            bgcolor: palette.action.hover,
            borderRadius: '4px',
            whiteSpace: 'nowrap',
            fontWeight: 500
          }}
        >
          #{folder.order ?? 0}
        </Typography>
      </SbItem>

      {hasKids && (
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          {folders
            .filter((f) => f.parentId === folder.id)
            .map((c) => (
              <GalleryTreeItem
                key={c.id}
                folder={c}
                level={level + 1}
                cid={cid}
                folders={folders}
                onNav={onNav}
                expanded={expanded}
                setExpanded={setExpanded}
                sortable={sortable}
              />
            ))}
        </Collapse>
      )}
    </Box>
  );
}

export default GalleryTreeItem;
