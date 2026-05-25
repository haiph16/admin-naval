import { IconPhoto, IconDeviceFloppy, IconLayoutGrid, IconLayoutList } from '@tabler/icons-react';

const icons = { IconPhoto, IconDeviceFloppy, IconLayoutGrid, IconLayoutList };

const multimedia = {
  id: 'multimedia',
  title: 'Multimedia',
  type: 'group',
  children: [
    {
      id: 'gallery',
      title: 'Gallery',
      type: 'item',
      url: '/multimedia/gallery',
      icon: icons.IconPhoto,
      breadcrumbs: false
    }
  ]
};

export default multimedia;
