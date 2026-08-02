import { useAuthStore } from '../stores/authStore';
import { useNavigate, useLocation } from 'react-router-dom';

export const useAuthAction = () => {
  const { isAuthenticated, queueAction } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const runWithAuth = (actionCallback) => {
    if (isAuthenticated) {
      actionCallback();
    } else {
      // Store the callback in Zustand store
      queueAction(actionCallback);
      
      // Navigate to login page, passing the current path to return back if needed,
      // or open the login dialog (which we will support on the login page/modal)
      navigate('/login', { state: { from: location.pathname } });
    }
  };

  return runWithAuth;
};
export default useAuthAction;
