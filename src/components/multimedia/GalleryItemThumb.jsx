import React from 'react';
import { Box } from '@mui/material';
import { FILE_META, fileCat } from '../../utils/constants';
import { IconBg } from '../../utils/styles';

// Helper function to get icon based on mime type
function getFileIcon(mime) {
  const category = fileCat(mime);
  const meta = FILE_META[category];
  return meta?.Icon || null;
}

/**
 * ItemThumb component - Thumbnail cho gallery item
 */
function GalleryItemThumb({ item }) {
  // For media files with preview URL, show image
  if (!item.isFolder && item.url) {
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
  }

  // For folders or media without preview, show icon
  const bgColor = item.isFolder ? '#FAEEDA' : FILE_META[fileCat(item.type)].bg;
  const Icon = getFileIcon(item.type);

  return <IconBg bg={bgColor}>{Icon ? <Icon size={26} /> : <Box />}</IconBg>;
}

export default GalleryItemThumb;
