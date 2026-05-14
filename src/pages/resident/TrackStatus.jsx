import { useState } from 'react';
import { GET } from '../../api';
import Navbar  from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

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
      padding:'4px 12px', borderRadius:'999px',
      fontSize:'13px', fontWeight:700
    }}>{s.label}</span>
  );
}

export default function TrackStatus() {
  const [refNo,   setRefNo]   = useState('');
  const [result,  setResult]  = useState(null);  // null = not searched, false = not found, obj = found
  const [loading, setLoading] = useState(false);

  const doTrack = async () => {
    const ref = refNo.trim().toUpperCase();
    if (!ref) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await GET('requests', 'track', { ref });
      setResult(res.data.request);
    } catch {
      setResult(false);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') doTrack();
  };

  // Build timeline steps from result
  const statusFlow = ['pending','processing','ready','completed'];
  const idx = result ? statusFlow.indexOf(result.status) : -1;
  const steps = result ? [
    { label:'Submitted',      sub:'Request received by the barangay',        done:true,    current:false },
    { label:'Under Review',   sub:'Staff is reviewing your request',         done:idx>=1,  current:result.status==='processing' },
    { label:'Ready to Claim', sub:'Document is ready at the barangay hall',  done:idx>=2,  current:result.status==='ready' },
    { label:'Completed',      sub:'Document has been claimed',               done:idx>=3,  current:false },
  ] : [];

  return (
    <div className="page active" id="page-app">
      <Navbar />
      <div className="app-body">
        <Sidebar role="resident" />
        <main className="main">
          <div className="panel active">

            <div className="sec-head">
              <div>
                <div className="sec-title">Track Request</div>
                <div className="sec-sub">Enter your reference number to check status</div>
              </div>
            </div>

            <div className="card" style={{ maxWidth:640 }}>

              {/* Search bar */}
              <div style={{ display:'flex', gap:10, marginBottom:22 }}>
                <input
                  type="text"
                  placeholder="e.g. REQ-2024-001"
                  value={refNo}
                  onChange={e => setRefNo(e.target.value)}
                  onKeyDown={handleKey}
                  style={{
                    flex:1,
                    background:'var(--surface2)',
                    border:'1.5px solid var(--border2)',
                    borderRadius:10,
                    padding:'11px 14px',
                    color:'var(--text)',
                    fontSize:'14.5px',
                    outline:'none',
                    fontFamily:'inherit',
                  }}
                />
                <button
                  className="btn btn-primary"
                  onClick={doTrack}
                  disabled={loading || !refNo.trim()}
                >
                  {loading ? '…' : 'Track'}
                </button>
              </div>

              {/* Results */}
              {result === null && !loading && (
                <div className="empty-state">
                  <div className="empty-icon">🔍</div>
                  <div>Enter a reference number above.</div>
                </div>
              )}

              {loading && (
                <div style={{ textAlign:'center', padding:30, color:'var(--muted)' }}>
                  Searching…
                </div>
              )}

              {result === false && (
                <div className="empty-state">
                  <div className="empty-icon">🔍</div>
                  <div>No request found for <strong style={{ color:'var(--text)' }}>{refNo.trim().toUpperCase()}</strong></div>
                  <div style={{ fontSize:13, marginTop:6 }}>Check the reference number and try again.</div>
                </div>
              )}

              {result && result !== false && (
                <div style={{ background:'var(--surface2)', borderRadius:13, padding:22 }}>

                  {/* Request header */}
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:10 }}>
                    <div>
                      <div style={{ fontFamily:"'Sora',sans-serif", fontSize:20, fontWeight:800, color:'var(--accent)' }}>
                        {result.reference_no}
                      </div>
                      <div style={{ fontSize:14, fontWeight:600, marginTop:2 }}>
                        {result.doc_icon} {result.doc_name}
                      </div>
                      <div style={{ fontSize:13, color:'var(--muted2)', marginTop:2 }}>
                        Submitted: {result.date} · {result.purpose}
                      </div>
                    </div>
                    <StatusBadge status={result.status} />
                  </div>

                  {/* Alerts */}
                  {result.status === 'rejected' && result.reject_reason && (
                    <div className="alert alert-warn" style={{ marginBottom:14 }}>
                      ⚠️ Rejected: {result.reject_reason}
                    </div>
                  )}
                  {result.status === 'ready' && (
                    <div className="alert alert-success" style={{ marginBottom:14 }}>
                      ✅ Your document is ready! Visit the barangay hall with a valid ID.
                    </div>
                  )}

                  {/* Fee info */}
                  <div style={{ display:'flex', gap:16, marginBottom:20, flexWrap:'wrap' }}>
                    <div style={{ background:'var(--surface3)', borderRadius:9, padding:'10px 14px', fontSize:13 }}>
                      <span style={{ color:'var(--muted2)' }}>Fee: </span>
                      {parseFloat(result.fee) === 0
                        ? <strong style={{ color:'var(--success)' }}>FREE</strong>
                        : <strong>₱{parseFloat(result.fee).toFixed(2)}</strong>}
                    </div>
                    <div style={{ background:'var(--surface3)', borderRadius:9, padding:'10px 14px', fontSize:13 }}>
                      <span style={{ color:'var(--muted2)' }}>Payment: </span>
                      <strong>{result.payment_method}</strong>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="timeline" style={{ marginTop:8 }}>
                    {steps.map((s, i) => (
                      <div className="tl" key={i}>
                        <div className="tl-col">
                          <div className={`tl-dot ${s.done?'done':''} ${s.current?'current':''}`}></div>
                          {i < steps.length-1 && (
                            <div className={`tl-line ${s.done?'done':''}`}></div>
                          )}
                        </div>
                        <div className="tl-text" style={{ paddingBottom: i < steps.length-1 ? 22 : 0 }}>
                          <div className={`tl-label ${s.done?'done':''} ${s.current?'current':''}`}>
                            {s.label}
                          </div>
                          <div className="tl-sub">{s.sub}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
