import { RouterProvider as ReactRouterProvider } from 'react-router-dom';
import { router } from '../routes';

export function AppRouterProvider() {
  return <ReactRouterProvider router={router} />;
}
