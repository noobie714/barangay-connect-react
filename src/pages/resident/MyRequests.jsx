import { useEffect, useState } from 'react';
import { GET } from '../../api';
import Navbar  from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

// ── helpers ───────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    pending:    { label:'⏳ Pending',    bg:'#FEF3C7', color:'#92400E' },
    processing: { label:'🔄 Processing', bg:'#DBEAFE', color:'#1E40AF' },
    ready:      { label:'✅ Ready',      bg:'#DCFCE7', color:'#166534' },
    completed:  { label:'🏁 Completed',  bg:'#F3F4F6', color:'#374151' },
    rejected:   { label:'❌ Rejected',   bg:'#FEE2E2', color:'#991B1B' },
  };
  const s = map[status] || { label: status, bg:'#F3F4F6', color:'#374151' };
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding:'3px 10px', borderRadius:'999px',
      fontSize:'12px', fontWeight:700, whiteSpace:'nowrap'
    }}>{s.label}</span>
  );
}

function PayBadge({ method }) {
  if (method === 'GCash') return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
      <svg width="42" height="16" viewBox="0 0 110 38" xmlns="http://www.w3.org/2000/svg">
        <rect width="110" height="38" rx="7" fill="#0076FE"/>
        <circle cx="22" cy="19" r="13" fill="white"/>
        <text x="22" y="24.5" textAnchor="middle" fontSize="16" fontWeight="900" fill="#0076FE" fontFamily="Arial Black,Arial">G</text>
        <text x="68" y="25" textAnchor="middle" fontSize="16" fontWeight="800" fill="white" fontFamily="Arial Black,Arial">GCash</text>
      </svg>
    </span>
  );
  if (method === 'Maya') return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
      <svg width="42" height="16" viewBox="0 0 110 38" xmlns="http://www.w3.org/2000/svg">
        <rect width="110" height="38" rx="8" fill="#00BFA5"/>
        <text x="55" y="26" textAnchor="middle" fontSize="18" fontWeight="900" fill="white" fontFamily="Helvetica Neue,Arial" letterSpacing="2">maya</text>
      </svg>
    </span>
  );
  return <span style={{ fontSize:12, color:'var(--muted2)' }}>🆓 FREE</span>;
}

// ── Request Detail Modal ──────────────────────────────────
function DetailModal({ requestId, onClose }) {
  const [req, setReq] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!requestId) return;
    setLoading(true);
    GET('requests', 'get', { id: requestId })
      .then(r => setReq(r.data.request))
      .finally(() => setLoading(false));
  }, [requestId]);

  if (!requestId) return null;

  const statusFlow = ['pending','processing','ready','completed'];
  const idx = req ? statusFlow.indexOf(req.status) : -1;
  const steps = req ? [
    { label:'Submitted',      done:true,    current:false },
    { label:'Under Review',   done:idx>=1,  current:req.status==='processing' },
    { label:'Ready to Claim', done:idx>=2,  current:req.status==='ready' },
    { label:'Completed',      done:idx>=3,  current:false },
  ] : [];

  return (
    <div className="overlay" style={{ display:'flex' }} onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth:600 }}>
        <div className="modal-head">
          <h3>Request Details</h3>
          <button className="x-btn" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {loading ? (
            <div style={{ textAlign:'center', padding:40, color:'var(--muted)' }}>Loading…</div>
          ) : req ? (
            <>
              {/* Header */}
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18, paddingBottom:16, borderBottom:'1.5px solid var(--border)' }}>
                <span style={{ fontSize:36 }}>{req.doc_icon || '📄'}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:800, fontSize:17 }}>{req.doc_name}</div>
                  <div style={{ color:'var(--accent)', fontSize:12, marginTop:2 }}>{req.reference_no}</div>
                </div>
                <StatusBadge status={req.status} />
              </div>

              {/* Alerts */}
              {req.status === 'rejected' && req.reject_reason && (
                <div className="alert alert-warn" style={{ marginBottom:16 }}>
                  ⚠️ <strong>Rejected:</strong> {req.reject_reason}
                </div>
              )}
              {req.status === 'ready' && (
                <div className="alert alert-success" style={{ marginBottom:16 }}>
                  ✅ Your document is ready! Visit the barangay hall with a valid ID.
                </div>
              )}

              {/* Details grid */}
              <div style={{ background:'var(--surface2)', border:'1.5px solid var(--border)', borderRadius:12, padding:'16px 18px', marginBottom:16 }}>
                <div style={{ fontSize:11, fontWeight:800, color:'var(--muted2)', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:14 }}>📄 Request Details</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, fontSize:13 }}>
                  {[
                    ['Document',     `${req.doc_icon||'📄'} ${req.doc_name}`],
                    ['Reference #',  req.reference_no],
                    ['Date Filed',   req.date || (req.created_at||'').slice(0,10)],
                    ['Purpose',      req.purpose],
                    ['Fee',          parseFloat(req.fee)===0 ? '🆓 FREE' : `₱${parseFloat(req.fee).toFixed(2)}`],
                    ['Processing',   req.processing_type === 'urgent' ? '⚡ Urgent' : '📋 Normal'],
                    ['Payment',      req.payment_method],
                    ['Ref #',        req.payment_ref || 'N/A'],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <div style={{ color:'var(--muted2)', fontSize:10.5, fontWeight:700, textTransform:'uppercase', letterSpacing:'.5px', marginBottom:3 }}>{label}</div>
                      <div style={{ fontWeight:600, fontSize:13.5 }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div style={{ background:'var(--surface2)', border:'1.5px solid var(--border)', borderRadius:12, padding:'16px 18px' }}>
                <div style={{ fontSize:11, fontWeight:800, color:'var(--muted2)', textTransform:'uppercase', letterSpacing:'.8px', marginBottom:14 }}>Progress</div>
                <div className="timeline">
                  {steps.map((s, i) => (
                    <div className="tl" key={i}>
                      <div className="tl-col">
                        <div className={`tl-dot ${s.done?'done':''} ${s.current?'current':''}`}></div>
                        {i < steps.length-1 && <div className={`tl-line ${s.done?'done':''}`}></div>}
                      </div>
                      <div className="tl-text" style={{ paddingBottom: i < steps.length-1 ? 18 : 0 }}>
                        <div className={`tl-label ${s.done?'done':''} ${s.current?'current':''}`}>{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign:'center', color:'var(--muted)', padding:40 }}>Failed to load request.</div>
          )}
        </div>
        <div className="modal-foot">
          <button className="btn btn-outline btn-sm" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────
export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [search,   setSearch]   = useState('');
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);

  const load = (q = '') => {
    setLoading(true);
    const params = {};
    if (q) params.search = q;
    GET('requests', 'list', params)
      .then(r => setRequests(r.data.requests || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // search on type with small debounce
  useEffect(() => {
    const t = setTimeout(() => load(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="page active" id="page-app">
      <Navbar />
      <div className="app-body">
        <Sidebar role="resident" />
        <main className="main">
          <div className="panel active">

            <div className="sec-head">
              <div>
                <div className="sec-title">My Requests</div>
                <div className="sec-sub">All your submitted document requests</div>
              </div>
            </div>

            {/* Search */}
            <div className="search-row">
              <span style={{ color:'var(--muted)' }}>🔍</span>
              <input
                type="text"
                placeholder="Search by reference number or document type…"
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
                      <th>Ref #</th>
                      <th>Document</th>
                      <th>Date</th>
                      <th>Purpose</th>
                      <th>Fee</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={8} style={{ textAlign:'center', padding:30, color:'var(--muted)' }}>Loading…</td></tr>
                    ) : requests.length === 0 ? (
                      <tr>
                        <td colSpan={8}>
                          <div className="empty-state">
                            <div className="empty-icon">📋</div>
                            <div>No requests found.</div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      requests.map(r => (
                        <tr key={r.id}>
                          <td>
                            <span
                              style={{ fontWeight:700, color:'var(--accent)', cursor:'pointer' }}
                              onClick={() => setSelected(r.id)}
                            >
                              {r.reference_no}
                            </span>
                          </td>
                          <td>{r.doc_icon} {r.doc_name}</td>
                          <td style={{ color:'var(--muted2)' }}>{r.date}</td>
                          <td style={{ color:'var(--muted2)' }}>{r.purpose}</td>
                          <td>
                            {parseFloat(r.fee) === 0
                              ? <span style={{ color:'var(--success)', fontWeight:700 }}>FREE</span>
                              : `₱${parseFloat(r.fee).toFixed(2)}`}
                          </td>
                          <td><PayBadge method={r.payment_method} /></td>
                          <td><StatusBadge status={r.status} /></td>
                          <td>
                            <button
                              className="btn btn-outline btn-xs"
                              onClick={() => setSelected(r.id)}
                            >
                              View
                            </button>
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

      {/* Detail Modal */}
      <DetailModal
        requestId={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
