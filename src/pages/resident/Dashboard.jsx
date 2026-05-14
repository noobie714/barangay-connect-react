import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GET } from "../../api";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";
import Navbar  from "../../components/Navbar";

export default function Dashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    GET('requests', 'list').then(r => setRequests(r.data.requests || []));
  }, []);

  const pending   = requests.filter(r => r.status === 'pending').length;
  const ready     = requests.filter(r => r.status === 'ready').length;
  const completed = requests.filter(r => r.status === 'completed').length;

  return (
    <div className="page active" id="page-app">
      <Navbar />
      <div className="app-body">
        <Sidebar role="resident" active="res-home" />
        <main className="main">
          <div className="panel active">
            <div className="sec-head">
              <div>
                <div className="sec-title">Good day, {user?.first_name}! 👋</div>
                <div className="sec-sub">Here's a summary of your requests</div>
              </div>
              <Link to="/request" className="btn btn-primary">+ New Request</Link>
            </div>
            <div className="stat-grid">
              {[['📋','Total',requests.length],['⏳','Pending',pending],['✅','Ready',ready],['🏁','Completed',completed]]
                .map(([icon,label,val]) => (
                  <div key={label} className="stat-card">
                    <div className="stat-icon">{icon}</div>
                    <div className="stat-val">{val}</div>
                    <div className="stat-lbl">{label}</div>
                  </div>
                ))}
            </div>
            <div className="card">
              <div className="card-head">
                <div className="card-title">Recent Requests</div>
                <Link to="/my-requests" className="btn btn-outline btn-sm">View All</Link>
              </div>
              <div className="tbl-wrap">
                <table>
                  <thead><tr><th>Ref #</th><th>Document</th><th>Date</th><th>Status</th></tr></thead>
                  <tbody>
                    {requests.slice(0,5).map(r => (
                      <tr key={r.id}>
                        <td><strong>{r.reference_no}</strong></td>
                        <td>{r.doc_icon} {r.doc_name}</td>
                        <td>{r.date}</td>
                        <td><span className={`chip status-${r.status}`}>{r.status}</span></td>
                      </tr>
                    ))}
                    {requests.length === 0 && (
                      <tr><td colSpan={4} style={{textAlign:'center',color:'var(--muted)'}}>No requests yet.</td></tr>
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