import { Link, useLocation } from 'react-router-dom';

const residentLinks = [
  { to:'/dashboard',   icon:'🏠', label:'Dashboard'        },
  { to:'/request',     icon:'📄', label:'Request Document'  },
  { to:'/my-requests', icon:'📋', label:'My Requests'       },
  { to:'/track',       icon:'🔍', label:'Track Status'      },
];

const adminLinks = [
  { to:'/admin',           icon:'📊', label:'Dashboard'   },
  { to:'/admin/requests',  icon:'📥', label:'All Requests' },
  { to:'/admin/residents', icon:'👥', label:'Residents'    },
  { to:'/admin/reports',   icon:'📈', label:'Reports'      },
];

export default function Sidebar({ role }) {
  const { pathname } = useLocation();
  const links = role === 'admin' ? adminLinks : residentLinks;
  const label = role === 'admin' ? 'Administration' : 'Resident Portal';

  return (
    <aside className="sidebar">
      <div className="sidebar-label">{label}</div>
      {links.map(({ to, icon, label }) => (
        <Link key={to} to={to}
          className={`slink${pathname === to ? ' active' : ''}`}>
          <span className="si">{icon}</span> {label}
        </Link>
      ))}
    </aside>
  );
}