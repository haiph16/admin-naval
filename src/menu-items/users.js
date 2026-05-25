import { IconUsers } from '@tabler/icons-react';

const icons = { IconUsers };

const users = {
  id: 'user-management',
  title: 'Management',
  type: 'group',
  children: [
    {
      id: 'users',
      title: 'Users',
      type: 'item',
      url: '/management/users',
      icon: icons.IconUsers,
      breadcrumbs: false
    }
  ]
};

export default users;
