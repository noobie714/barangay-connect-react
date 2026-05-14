import { useEffect, useState } from 'react';
import { GET, POST } from '../../api';
import Navbar  from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

const STATUSES = ['all','pending','processing','ready','completed','rejected'];

export default function AllRequests() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter]     = useState('all');
  const [search, setSearch]     = useState('');

  const load = () => {
    const params = {};
    if (filter !== 'all') params.status = filter;
    if (search) params.search = search;
    GET('requests', 'list', params).then(r => setRequests(r.data.requests || []));
  };

  useEffect(() => { load(); }, [filter, search]);

  const updateStatus = async (id, status, reason = '') => {
    await POST('requests', 'status', { id, status, reject_reason: reason });
    load();
  };

  return (
    <div className="page active" id="page-app">
      <Navbar />
      <div className="app-body">
        <Sidebar role="admin" active="adm-requests" />
        <main className="main">
          <div className="panel active">
            <div className="sec-head">
              <div><div className="sec-title">All Requests</div></div>
            </div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:14 }}>
              {STATUSES.map(s => (
                <button key={s}
                  className={`btn btn-outline btn-sm${filter===s?' active':''}`}
                  onClick={() => setFilter(s)}>
                  {s.charAt(0).toUpperCase()+s.slice(1)}
                </button>
              ))}
            </div>
            <div className="search-row">
              <input placeholder="Search by ref, resident, document…"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="card">
              <div className="tbl-wrap">
                <table>
                  <thead><tr>
                    <th>Ref #</th><th>Resident</th><th>Document</th>
                    <th>Date</th><th>Fee</th><th>Status</th><th>Actions</th>
                  </tr></thead>
                  <tbody>
                    {requests.map(r => (
                      <tr key={r.id}>
                        <td><strong>{r.reference_no}</strong></td>
                        <td>{r.resident_name}</td>
                        <td>{r.doc_icon} {r.doc_name}</td>
                        <td>{r.date}</td>
                        <td>{r.fee == 0 ? '🆓 FREE' : `₱${r.fee}`}</td>
                        <td><span className={`chip status-${r.status}`}>{r.status}</span></td>
                        <td>
                          {r.status === 'pending' && (
                            <button className="btn btn-outline btn-sm"
                              onClick={() => updateStatus(r.id,'processing')}>
                              Process
                            </button>
                          )}
                          {r.status === 'processing' && (
                            <button className="btn btn-primary btn-sm"
                              onClick={() => updateStatus(r.id,'ready')}>
                              Mark Ready
                            </button>
                          )}
                          {r.status === 'ready' && (
                            <button className="btn btn-outline btn-sm"
                              onClick={() => updateStatus(r.id,'completed')}>
                              Complete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
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