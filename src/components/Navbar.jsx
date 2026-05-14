import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="topnav">
      <div className="brand" onClick={() => navigate('/')}>
        <div className="brand-logo">🏛️</div>
        <span className="brand-name">BarangayConnect</span>
      </div>
      <div className="topnav-right">
        <div className="user-chip">
          <div className="user-avatar">{user?.first_name?.[0]}</div>
          <span className="uname">{user?.first_name} {user?.last_name}</span>
          <span className="role-badge">{user?.role}</span>
        </div>
        <button className="btn btn-outline btn-sm" onClick={handleLogout}>Sign Out</button>
      </div>
    </nav>
  );
}