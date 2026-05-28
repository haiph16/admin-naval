import React from 'react';
import { Box } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * SortableItem component - Wrapper cho grid/list items hỗ trợ drag & drop
 */
function GallerySortableItem({ item, children, disabled = false }) {
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

export default GallerySortableItem;
