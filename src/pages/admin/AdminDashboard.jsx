import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GET, POST } from '../../api';
import Navbar  from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

export default function AdminDashboard() {
  const [stats,    setStats]    = useState(null);
  const [today,    setToday]    = useState(null);
  const [week,     setWeek]     = useState([]);
  const [byDoc,    setByDoc]    = useState([]);
  const [byPay,    setByPay]    = useState([]);
  const [recent,   setRecent]   = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => { loadDashboard(); }, []);

  async function loadDashboard() {
    setLoading(true);
    try {
      const [dashRes, listRes] = await Promise.all([
        GET('reports', 'dashboard'),
        GET('requests', 'list'),
      ]);
      if (dashRes.data.stats) {
        setStats(dashRes.data.stats);
        setToday(dashRes.data.today);
        setWeek(dashRes.data.week   || []);
        setByDoc(dashRes.data.by_doc || []);
        setByPay(dashRes.data.by_pay || []);
      }
      setRecent((listRes.data.requests || []).slice(0, 6));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status, reason = '') {
    await POST('requests', 'status', { id, status, reject_reason: reason });
    loadDashboard();
  }

  const maxWeek = Math.max(...week, 1);

  const PAY_COLORS = { GCash: '#0076FE', Maya: '#00D26A', FREE: 'var(--muted2)' };

  const statusChip = (s) => <span className={`chip status-${s}`}>{s}</span>;

  return (
    <div className="page active" id="page-app">
      <Navbar />
      <div className="app-body">
        <Sidebar role="admin" />
        <main className="main">
          <div className="panel active">

            {/* Header */}
            <div className="sec-head">
              <div>
                <div className="sec-title">Admin Dashboard</div>
                <div className="sec-sub">
                  📅 {new Date().toLocaleDateString('en-PH', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
                </div>
              </div>
              <Link to="/admin/requests" className="btn btn-primary">View All Requests</Link>
            </div>

            {loading ? (
              <div style={{ color: 'var(--muted)', padding: 40, textAlign: 'center' }}>Loading dashboard…</div>
            ) : (
              <>
                {/* ── STAT CARDS ── */}
                <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 20 }}>
                  {[
                    { label: 'Total Requests',  val: stats?.total       || 0, sub: 'All time',        color: 'var(--text)' },
                    { label: 'Pending Review',  val: stats?.pending     || 0, sub: 'Needs action',    color: 'var(--warning)' },
                    { label: 'Ready to Claim',  val: stats?.ready       || 0, sub: 'Awaiting pickup', color: 'var(--success, #16a34a)' },
                    { label: 'Fees Collected',  val: '₱' + parseFloat(stats?.collected || 0).toFixed(0), sub: 'From paid requests', color: 'var(--accent)' },
                  ].map(({ label, val, sub, color }) => (
                    <div key={label} className="stat-card">
                      <div className="stat-val" style={{ color }}>{val}</div>
                      <div className="stat-lbl">{label}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{sub}</div>
                    </div>
                  ))}
                </div>

                {/* ── WEEK CHART + DOC BREAKDOWN ── */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>

                  {/* Week chart */}
                  <div className="card">
                    <div className="card-head">
                      <div className="card-title">This Week's Requests</div>
                    </div>
                    <div className="bar-chart" style={{ alignItems: 'flex-end', gap: 6, height: 80, marginTop: 14 }}>
                      {week.map((n, i) => (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                          <div className="bar"
                            title={`${n} requests`}
                            style={{ width: '100%', height: Math.max(4, Math.round(n / maxWeek * 100)) + '%',
                                     borderRadius: '5px 5px 0 0',
                                     background: 'linear-gradient(180deg,var(--accent),var(--accent2))',
                                     opacity: n > 0 ? 1 : 0.3 }} />
                          <div style={{ fontSize: 10, color: 'var(--muted)' }}>{DAYS[i]}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Doc breakdown */}
                  <div className="card">
                    <div className="card-head">
                      <div className="card-title">By Document Type</div>
                    </div>
                    {byDoc.length === 0
                      ? <div style={{ color: 'var(--muted)', fontSize: 13 }}>No data yet.</div>
                      : (() => {
                          const total = byDoc.reduce((s, d) => s + parseInt(d.cnt), 0) || 1;
                          return byDoc.map(d => {
                            const pct = Math.round(parseInt(d.cnt) / total * 100);
                            return (
                              <div key={d.name} style={{ marginBottom: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                                  <span>{d.icon} {d.name}</span>
                                  <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{pct}%</span>
                                </div>
                                <div className="progress-bar">
                                  <div className="progress-fill" style={{ width: pct + '%' }} />
                                </div>
                              </div>
                            );
                          });
                        })()
                    }
                  </div>
                </div>

                {/* ── RECENT REQUESTS TABLE ── */}
                <div className="card">
                  <div className="card-head">
                    <div className="card-title">Recent Requests</div>
                    <Link to="/admin/requests" className="btn btn-outline btn-sm">View All</Link>
                  </div>
                  <div className="tbl-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Ref #</th><th>Resident</th><th>Document</th>
                          <th>Date</th><th>Fee</th><th>Status</th><th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recent.length === 0
                          ? <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)' }}>No requests yet.</td></tr>
                          : recent.map(r => (
                            <tr key={r.id}>
                              <td><strong style={{ color: 'var(--accent)' }}>{r.reference_no}</strong></td>
                              <td>{r.resident_name}</td>
                              <td>
                                {r.doc_icon} {r.doc_name}{' '}
                                {r.processing_type === 'urgent'
                                  ? <span style={{ background:'#fef9c3',color:'#a16207',border:'1px solid #fde68a',borderRadius:99,padding:'2px 7px',fontSize:11,fontWeight:700 }}>⚡ Urgent</span>
                                  : <span style={{ background:'var(--surface3)',color:'var(--muted2)',border:'1px solid var(--border)',borderRadius:99,padding:'2px 7px',fontSize:11,fontWeight:600 }}>📋 Normal</span>}
                              </td>
                              <td style={{ color: 'var(--muted2)' }}>{r.date}</td>
                              <td>{parseFloat(r.fee) === 0 ? '🆓 FREE' : '₱' + parseFloat(r.fee).toFixed(2)}</td>
                              <td>{statusChip(r.status)}</td>
                              <td style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                {r.status === 'pending'    && <button className="btn btn-outline btn-sm" onClick={() => updateStatus(r.id,'processing')}>Approve</button>}
                                {r.status === 'processing' && <button className="btn btn-primary btn-sm" onClick={() => updateStatus(r.id,'ready')}>Mark Ready</button>}
                                {r.status === 'ready'      && <button className="btn btn-outline btn-sm" onClick={() => updateStatus(r.id,'completed')}>Complete</button>}
                              </td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
