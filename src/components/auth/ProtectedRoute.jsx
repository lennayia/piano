import { Navigate } from 'react-router-dom';
import useUserStore from '../../store/useUserStore';

function ProtectedRoute({ children }) {
  const currentUser = useUserStore((state) => state.currentUser);

  if (!currentUser) {
    // Přesměrovat na landing page pokud není přihlášen
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
