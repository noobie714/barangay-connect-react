import { Link, useNavigate } from 'react-router-dom';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div id="page-landing" className="page active">

      {/* NAV */}
      <nav className="land-nav">
        <a className="land-brand" href="/">
          <div className="land-logo">🏛️</div>
          <span className="land-brand-txt">BarangayConnect</span>
        </a>
        <div className="land-nav-links">
          <a href="#how-it-works">How It Works</a>
          <a href="#documents">Documents</a>
          <a href="#features">Features</a>
        </div>
        <div style={{ display:'flex', gap:'8px', marginLeft:'16px' }}>
          <button className="lnav-login" onClick={() => navigate('/login')}>Sign In</button>
          <button className="lnav-start" onClick={() => navigate('/register')}>Get Started →</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="land-hero">
        <div className="hero-text">
          <div className="hero-badge">
            <span className="hero-badge-dot"></span>
            Barangay Pusok, Lapu-Lapu City · Cebu
          </div>
          <h1>Barangay Documents,<br /><em>Done Online.</em></h1>
          <p>No more long queues at the barangay hall. Request your barangay clearance, certificates, and more — from your phone or computer, anytime.</p>
          <div className="hero-btns">
            <button className="hero-btn-main" onClick={() => navigate('/register')}>📄 Request a Document</button>
            <button className="hero-btn-ghost" onClick={() => navigate('/login')}>Sign In →</button>
          </div>
          <div className="hero-stats">
            <div>
              <div className="hero-stat-num">6+</div>
              <div className="hero-stat-lbl">Document Types</div>
            </div>
            <div>
              <div className="hero-stat-num">1 Day</div>
              <div className="hero-stat-lbl">Processing Time</div>
            </div>
            <div>
              <div className="hero-stat-num">100%</div>
              <div className="hero-stat-lbl">Online Process</div>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card">
            <div className="hc-head">
              <div className="hc-icon">📋</div>
              <div>
                <div className="hc-title">Barangay Clearance</div>
                <div className="hc-sub">REQ-2024-003 · Juan dela Cruz</div>
              </div>
            </div>
            <div className="hc-steps">
              <div className="hcs">
                <div className="hcs-num">1</div>
                <div className="hcs-txt">Request Submitted</div>
                <span className="hcs-badge b-done">✅ Done</span>
              </div>
              <div className="hcs">
                <div className="hcs-num">2</div>
                <div className="hcs-txt">Under Review</div>
                <span className="hcs-badge b-done">✅ Done</span>
              </div>
              <div className="hcs" style={{ borderColor:'var(--accent)', background:'var(--accent-lt)' }}>
                <div className="hcs-num">3</div>
                <div className="hcs-txt" style={{ color:'var(--accent2)', fontWeight:700 }}>Ready to Claim!</div>
                <span className="hcs-badge b-done" style={{ background:'var(--accent)', color:'#fff' }}>🏛️ Visit Hall</span>
              </div>
            </div>
            <div style={{ marginTop:'16px', paddingTop:'14px', borderTop:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ fontSize:'12px', color:'var(--muted)' }}>Fee paid via</div>
              <svg width="52" height="18" viewBox="0 0 110 38" xmlns="http://www.w3.org/2000/svg">
                <rect width="110" height="38" rx="7" fill="#0076FE"/>
                <circle cx="22" cy="19" r="13" fill="white"/>
                <text x="22" y="24.5" textAnchor="middle" fontSize="16" fontWeight="900" fill="#0076FE" fontFamily="Arial Black,Arial,sans-serif">G</text>
                <text x="68" y="25" textAnchor="middle" fontSize="16" fontWeight="800" fill="white" fontFamily="Arial Black,Arial,sans-serif">GCash</text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="land-section alt" id="how-it-works">
        <div className="section-badge">Simple Process</div>
        <h2 className="section-title">How It Works</h2>
        <p className="section-sub">Get your barangay documents in 3 easy steps — no need to visit the hall until your document is ready.</p>
        <div className="hiw-grid">
          {[
            { num:1, icon:'📝', title:'Create an Account',    desc:'Register with your name, email, and mobile number. It only takes 2 minutes to get started.' },
            { num:2, icon:'📄', title:'Submit Your Request',  desc:'Choose the document you need, fill in your details, and pay the fee online via GCash or Maya.' },
            { num:3, icon:'🔔', title:'Get Notified',         desc:"We'll send you a notification when your document is ready. Just visit the barangay hall to claim it." },
            { num:4, icon:'🏛️', title:'Claim Your Document', desc:'Bring a valid government ID to the barangay hall. Your document will be ready and waiting for you.' },
          ].map(s => (
            <div className="hiw-card" key={s.num}>
              <div className="hiw-num">{s.num}</div>
              <div className="hiw-icon">{s.icon}</div>
              <div className="hiw-title">{s.title}</div>
              <div className="hiw-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* DOCUMENTS */}
      <section className="land-section" id="documents">
        <div className="section-badge">Available Documents</div>
        <h2 className="section-title">What Can You Request?</h2>
        <p className="section-sub">We offer all the most commonly needed barangay documents, available online 24/7.</p>
        <div className="docs-grid">
          {[
            { icon:'📋', name:'Barangay Clearance',       fee:'₱50.00',  days:'1 day processing',  free:false },
            { icon:'🏠', name:'Certificate of Residency', fee:'₱50.00',  days:'1 day processing',  free:false },
            { icon:'📜', name:'Indigency Certificate',    fee:'🆓 FREE', days:'1 day processing',  free:true  },
            { icon:'🏪', name:'Business Clearance',       fee:'₱150.00', days:'2 days processing', free:false },
            { icon:'⭐', name:'Good Moral Certificate',   fee:'₱50.00',  days:'1 day processing',  free:false },
            { icon:'👫', name:'Cohabitation Certificate', fee:'₱75.00',  days:'1 day processing',  free:false },
          ].map(d => (
            <div className="ldoc-card" key={d.name}>
              <div className="ldoc-icon">{d.icon}</div>
              <div className="ldoc-name">{d.name}</div>
              <div className="ldoc-fee" style={d.free ? { color:'var(--success)' } : {}}>{d.fee}</div>
              <div className="ldoc-days">⏱ {d.days}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="land-section alt" id="features">
        <div className="section-badge">Why BarangayConnect</div>
        <h2 className="section-title">Everything You Need</h2>
        <p className="section-sub">A complete digital system for barangay document services — built for residents and staff alike.</p>
        <div className="feat-grid">
          {[
            { icon:'📱', title:'Works on Any Device',       desc:'Access from your phone, tablet, or computer. No app download needed — just open your browser.' },
            { icon:'💳', title:'Online Payment',            desc:'Pay securely via GCash or Maya. No need to bring cash — just send money and enter your reference number.' },
            { icon:'🔔', title:'Real-Time Notifications',   desc:'Get notified instantly when your request is approved, processed, and ready for pickup.' },
            { icon:'🔍', title:'Track Your Request',        desc:'Use your reference number to check the status of your request anytime, even without logging in.' },
            { icon:'🛡️', title:'Admin Dashboard',          desc:'Barangay staff get a full dashboard to manage requests, residents, reports, and settings.' },
            { icon:'📊', title:'Monthly Reports',           desc:'Automatic monthly summaries with total requests, fees collected, and processing analytics.' },
          ].map(f => (
            <div className="feat-card" key={f.title}>
              <div className="feat-icon">{f.icon}</div>
              <div>
                <div className="feat-title">{f.title}</div>
                <div className="feat-desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="land-cta">
        <h2>Ready to request your document?</h2>
        <p>Create a free account and submit your first request in minutes.</p>
        <div className="cta-btns">
          <button className="cta-white" onClick={() => navigate('/register')}>📄 Get Started — It's Free</button>
          <button className="cta-ghost" onClick={() => navigate('/login')}>Already have an account? Sign In</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="land-footer">
        <div className="lfoot-brand">
          <div className="lfoot-logo">🏛️</div>
          <span className="lfoot-name">BarangayConnect</span>
        </div>
        <p>© 2026 Barangay Pusok, Lapu-Lapu City, Cebu. All rights reserved.</p>
        <p>📞 (032) 234-5678 &nbsp;·&nbsp; Barangay Hall, Pusok</p>
      </footer>

    </div>
  );
}
