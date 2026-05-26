export const FILE_META = {
  image: { bg: '#E6F1FB', color: '#378ADD', label: 'Image', chip: 'primary' },
  video: { bg: '#FCEBEB', color: '#E24B4A', label: 'Video', chip: 'error' },
  audio: { bg: '#FAEEDA', color: '#BA7517', label: 'Audio', chip: 'warning' },
  pdf: { bg: '#FCEBEB', color: '#E24B4A', label: 'PDF', chip: 'error' },
  text: { bg: '#EAF3DE', color: '#3B6D11', label: 'Text', chip: 'success' },
  other: { bg: '#F1EFE8', color: '#888780', label: 'File', chip: 'default' },
};

export const fileCat = (mime) => {
  if (!mime) return 'other';
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime.includes('pdf')) return 'pdf';
  if (mime.includes('text')) return 'text';
  return 'other';
};
