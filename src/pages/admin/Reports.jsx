import { useEffect, useState } from 'react';
import { GET } from '../../api';
import Navbar  from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

function PayBadge({ method }) {
  if (method === 'GCash') return (
    <svg width="52" height="18" viewBox="0 0 110 38" xmlns="http://www.w3.org/2000/svg">
      <rect width="110" height="38" rx="7" fill="#0076FE"/>
      <circle cx="22" cy="19" r="13" fill="white"/>
      <text x="22" y="24.5" textAnchor="middle" fontSize="16" fontWeight="900" fill="#0076FE" fontFamily="Arial Black,Arial">G</text>
      <text x="68" y="25" textAnchor="middle" fontSize="16" fontWeight="800" fill="white" fontFamily="Arial Black,Arial">GCash</text>
    </svg>
  );
  if (method === 'Maya') return (
    <svg width="52" height="18" viewBox="0 0 110 38" xmlns="http://www.w3.org/2000/svg">
      <rect width="110" height="38" rx="8" fill="#00BFA5"/>
      <text x="55" y="26" textAnchor="middle" fontSize="18" fontWeight="900" fill="white" fontFamily="Helvetica Neue,Arial" letterSpacing="2">maya</text>
    </svg>
  );
  return <span style={{ fontSize:12, color:'var(--muted2)', fontWeight:600 }}>🆓 FREE</span>;
}

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

export default function Reports() {
  const curMonth = new Date().getMonth() + 1;
  const curYear  = new Date().getFullYear();

  const [month,   setMonth]   = useState(curMonth);
  const [stats,   setStats]   = useState(null);
  const [byDoc,   setByDoc]   = useState([]);
  const [byPay,   setByPay]   = useState([]);
  const [loading, setLoading] = useState(true);

  const load = (m) => {
    setLoading(true);
    Promise.all([
      GET('reports', 'monthly',   { month: m, year: curYear }),
      GET('reports', 'dashboard'),
    ]).then(([monthRes, dashRes]) => {
      if (monthRes.data?.stats)   setStats(monthRes.data.stats);
      if (dashRes.data?.by_doc)   setByDoc(dashRes.data.by_doc);
      if (dashRes.data?.by_pay)   setByPay(dashRes.data.by_pay);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(month); }, [month]);

  const totalDoc = byDoc.reduce((s, d) => s + parseInt(d.cnt), 0) || 1;
  const totalPay = byPay.reduce((s, p) => s + parseInt(p.cnt), 0) || 1;
  const payColors = { GCash:'#0076FE', Maya:'#00BFA5', FREE:'var(--muted2)' };

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
                <div className="sec-title">Reports</div>
                <div className="sec-sub">Monthly summary and analytics</div>
              </div>
              {/* Month selector */}
              <select
                value={month}
                onChange={e => setMonth(Number(e.target.value))}
                style={{
                  background:'var(--surface2)',
                  border:'1.5px solid var(--border2)',
                  borderRadius:10,
                  padding:'8px 14px',
                  color:'var(--text)',
                  fontSize:13,
                  fontFamily:'inherit',
                  cursor:'pointer',
                }}
              >
                {MONTHS.map((m, i) => (
                  <option key={i+1} value={i+1}>{m} {curYear}</option>
                ))}
              </select>
            </div>

            {loading ? (
              <div style={{ textAlign:'center', padding:60, color:'var(--muted)' }}>Loading…</div>
            ) : (
              <>
                {/* Stats row */}
                <div className="stat-grid" style={{ marginBottom:22 }}>
                  {[
                    { icon:'📄', label:'Total Requests', val: stats?.total    || 0, color:'var(--accent2)' },
                    { icon:'💰', label:'Fees Collected',  val:`₱${parseFloat(stats?.collected||0).toFixed(0)}`, color:'var(--success)' },
                    { icon:'⏱️', label:'Avg. Processing', val:`${parseFloat(stats?.avg_hours||0).toFixed(1)}h`, color:'var(--warning)' },
                    { icon:'🏁', label:'Completed',       val: stats?.completed || 0, color:'var(--accent)' },
                  ].map(s => (
                    <div key={s.label} className="stat-card">
                      <div className="stat-icon">{s.icon}</div>
                      <div className="stat-val" style={{ color: s.color }}>{s.val}</div>
                      <div className="stat-lbl">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Two columns */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>

                  {/* Requests by document type */}
                  <div className="card">
                    <div className="card-head">
                      <div className="card-title">📄 Requests by Document Type</div>
                    </div>
                    <div style={{ padding:'8px 0' }}>
                      {byDoc.length === 0 ? (
                        <div style={{ color:'var(--muted)', fontSize:13, padding:'10px 0' }}>No data yet.</div>
                      ) : (
                        byDoc.map((d, i) => {
                          const pct = Math.round(parseInt(d.cnt) / totalDoc * 100);
                          return (
                            <div key={i} style={{ marginBottom:14 }}>
                              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:5 }}>
                                <span>{d.icon} {d.name}</span>
                                <span style={{ color:'var(--accent)', fontWeight:700 }}>{d.cnt} ({pct}%)</span>
                              </div>
                              <div className="progress-bar">
                                <div className="progress-fill" style={{ width:`${pct}%` }}></div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Requests by payment method */}
                  <div className="card">
                    <div className="card-head">
                      <div className="card-title">💳 Requests by Payment Method</div>
                    </div>
                    <div style={{ padding:'8px 0' }}>
                      {byPay.length === 0 ? (
                        <div style={{ color:'var(--muted)', fontSize:13, padding:'10px 0' }}>No data yet.</div>
                      ) : (
                        byPay.map((p, i) => {
                          const pct = Math.round(parseInt(p.cnt) / totalPay * 100);
                          return (
                            <div key={i} style={{ marginBottom:16 }}>
                              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:13, marginBottom:6 }}>
                                <PayBadge method={p.payment_method} />
                                <span style={{ fontWeight:700 }}>{p.cnt} ({pct}%)</span>
                              </div>
                              <div className="progress-bar">
                                <div
                                  className="progress-fill"
                                  style={{
                                    width:`${pct}%`,
                                    background: payColors[p.payment_method] || 'var(--accent)'
                                  }}
                                ></div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                </div>

                {/* Status breakdown */}
                {stats && (
                  <div className="card" style={{ marginTop:16 }}>
                    <div className="card-head">
                      <div className="card-title">📊 Status Breakdown — {MONTHS[month-1]} {curYear}</div>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:12, padding:'8px 0' }}>
                      {[
                        { label:'Pending',    val: stats.pending    || 0, bg:'#FEF3C7', color:'#92400E' },
                        { label:'Processing', val: stats.processing || 0, bg:'#DBEAFE', color:'#1E40AF' },
                        { label:'Ready',      val: stats.ready      || 0, bg:'#DCFCE7', color:'#166534' },
                        { label:'Completed',  val: stats.completed  || 0, bg:'#F3F4F6', color:'#374151' },
                        { label:'Rejected',   val: stats.rejected   || 0, bg:'#FEE2E2', color:'#991B1B' },
                      ].map(item => (
                        <div key={item.label} style={{
                          background: item.bg,
                          borderRadius:12,
                          padding:'14px 16px',
                          textAlign:'center',
                        }}>
                          <div style={{ fontSize:24, fontWeight:800, color: item.color }}>{item.val}</div>
                          <div style={{ fontSize:11, fontWeight:700, color: item.color, textTransform:'uppercase', letterSpacing:'.5px', marginTop:4 }}>
                            {item.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
