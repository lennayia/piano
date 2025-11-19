import { Navigate } from 'react-router-dom';
import useUserStore from '../../store/useUserStore';

function ProtectedRoute({ children }) {
  const currentUser = useUserStore((state) => state.currentUser);

  if (!currentUser) {
    // Přesměrovat na přihlášení pokud není přihlášen
    return <Navigate to="/registration" replace />;
  }

  return children;
}

export default ProtectedRoute;
