import { useEffect, useState } from 'react';
import { GET } from '../../api';
import Navbar  from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

export default function Residents() {
  const [residents, setResidents] = useState([]);
  const [search,    setSearch]    = useState('');
  const [loading,   setLoading]   = useState(true);

  const load = (q = '') => {
    setLoading(true);
    GET('users', 'residents', { search: q })
      .then(r => setResidents(r.data.residents || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const t = setTimeout(() => load(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="page active" id="page-app">
      <Navbar />
      <div className="app-body">
        <Sidebar role="admin" />
        <main className="main">
          <div className="panel active">

            <div className="sec-head">
              <div>
                <div className="sec-title">Residents</div>
                <div className="sec-sub">
                  {residents.length} registered resident{residents.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="search-row">
              <span style={{ color:'var(--muted)' }}>🔍</span>
              <input
                type="text"
                placeholder="Search by name, email, or purok…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Table */}
            <div className="card">
              <div className="tbl-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Mobile</th>
                      <th>Purok</th>
                      <th>Registered</th>
                      <th>Requests</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={6} style={{ textAlign:'center', padding:30, color:'var(--muted)' }}>Loading…</td></tr>
                    ) : residents.length === 0 ? (
                      <tr>
                        <td colSpan={6}>
                          <div className="empty-state">
                            <div className="empty-icon">👥</div>
                            <div>No residents found.</div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      residents.map((u, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight:600 }}>{u.first_name} {u.last_name}</td>
                          <td style={{ color:'var(--muted2)' }}>{u.email}</td>
                          <td style={{ color:'var(--muted2)' }}>{u.phone || '—'}</td>
                          <td>
                            <span className="chip">{u.purok || '—'}</span>
                          </td>
                          <td style={{ color:'var(--muted2)' }}>{u.registered}</td>
                          <td>
                            <span className="badge b-processing">{u.request_count} requests</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
