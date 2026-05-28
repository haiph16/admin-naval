import React from 'react';
import { IconEdit, IconFolderShare, IconTrash, IconGripVertical } from '@tabler/icons-react';
import { ActionBar, ABtn } from '../../utils/styles';

/**
 * ItemActions component - Nút hành động cho gallery item (rename, move, delete, reorder)
 */
function GalleryItemActions({ item, dragHandle, reorderMode, onRename, onMove, onDelete }) {
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

export default GalleryItemActions;
