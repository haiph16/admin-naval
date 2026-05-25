import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';

// multimedia routing
const Gallery = Loadable(lazy(() => import('views/multimedia/gallery')));

// user management routing
const UserList = Loadable(lazy(() => import('views/users/UserList')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: <Navigate to="/multimedia/gallery" replace />
    },
    {
      path: 'multimedia',
      children: [
        {
          path: 'gallery',
          element: <Gallery />
        }
      ]
    },
    {
      path: 'management',
      children: [
        {
          path: 'users',
          element: <UserList />
        }
      ]
    }
  ]
};

export default MainRoutes;
