import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GET, POST } from '../../api';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

export default function RequestForm() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep]                   = useState(1);
  const [docTypes, setDocTypes]           = useState([]);
  const [selectedDoc, setSelectedDoc]     = useState(null);
  const [procType, setProcType]           = useState('normal');
  const [payMethod, setPayMethod]         = useState(null);
  const [paySettings, setPaySettings]     = useState({});
  const [loading, setLoading]             = useState(false);
  const [submitting, setSubmitting]       = useState(false);
  const [successRef, setSuccessRef]       = useState(null);

  const [form, setForm] = useState({
    full_name: '', date_of_birth: '', phone: '',
    civil_status: 'Single', address: '', purpose: '', payment_ref: '',
  });

  // Load document types on mount
  useEffect(() => {
    setLoading(true);
    GET('requests', 'doc_types')
      .then(r => setDocTypes(r.data.doc_types || []))
      .finally(() => setLoading(false));
  }, []);

  // Prefill user info
  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim(),
        phone:     user.phone   || '',
        address:   user.address || '',
      }));
    }
  }, [user]);

  // Load payment settings when reaching step 3
  useEffect(() => {
    if (step === 3) {
      GET('reports', 'settings_get')
        .then(r => { if (r.data?.settings) setPaySettings(r.data.settings); })
        .catch(() => {});
    }
  }, [step]);

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }));

  const baseFee   = parseFloat(selectedDoc?.fee   || 0);
  const urgentFee = procType === 'urgent' ? parseFloat(selectedDoc?.urgent_fee || 50) : 0;
  const totalFee  = baseFee + urgentFee;
  const isFree    = totalFee === 0;

  function validateStep(s) {
    if (s === 1 && !selectedDoc) { alert('Please select a document type.'); return false; }
    if (s === 2) {
      if (!form.full_name)     { alert('Full name is required.');      return false; }
      if (!form.date_of_birth) { alert('Date of birth is required.');  return false; }
      if (!form.phone)         { alert('Contact number is required.'); return false; }
      if (!form.address)       { alert('Address is required.');        return false; }
      if (!form.purpose)       { alert('Purpose is required.');        return false; }
    }
    return true;
  }

  function goStep(s) {
    if (s > step && !validateStep(step)) return;
    setStep(s);
    if (s < 3) setPayMethod(null);
  }

  async function handleSubmit() {
    if (!isFree) {
      if (!payMethod)         { alert('Please select a payment method.'); return; }
      if (!form.payment_ref)  { alert('Please enter your payment reference number.'); return; }
    }
    setSubmitting(true);
    try {
      const payload = {
        doc_type_id:     selectedDoc.id,
        full_name:       form.full_name,
        date_of_birth:   form.date_of_birth,
        phone:           form.phone,
        civil_status:    form.civil_status,
        address:         form.address,
        purpose:         form.purpose,
        processing_type: procType,
        payment_method:  isFree ? 'FREE' : (payMethod === 'gcash' ? 'GCash' : 'Maya'),
        payment_ref:     isFree ? 'FREE' : form.payment_ref,
      };
      const res = await POST('requests', 'submit', payload);
      setSuccessRef(res.data.reference_no);
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setStep(1); setSelectedDoc(null); setProcType('normal');
    setPayMethod(null); setSuccessRef(null);
    setForm({ full_name: `${user?.first_name||''} ${user?.last_name||''}`.trim(),
              date_of_birth:'', phone: user?.phone||'', civil_status:'Single',
              address: user?.address||'', purpose:'', payment_ref:'' });
  }

  // ── SUCCESS SCREEN ──────────────────────────────────────
  if (successRef) {
    return (
      <div className="page active" id="page-app">
        <Navbar />
        <div className="app-body">
          <Sidebar role="resident" active="res-request" />
          <main className="main">
            <div className="panel active" style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center', paddingTop: 60 }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
              <h2 style={{ fontFamily: "'Sora',sans-serif", color: 'var(--accent2)', marginBottom: 8 }}>Request Submitted!</h2>
              <p style={{ color: 'var(--muted)', marginBottom: 20 }}>Your reference number is:</p>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 28, fontWeight: 800, color: 'var(--accent2)',
                            background: 'var(--accent-lt)', border: '2px solid var(--accent)', borderRadius: 12,
                            padding: '16px 24px', marginBottom: 28, letterSpacing: 2 }}>
                {successRef}
              </div>
              <p style={{ color: 'var(--muted)', fontSize: 13.5, marginBottom: 28 }}>
                Save this reference number to track your request status.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button className="btn btn-outline" onClick={() => navigate('/my-requests')}>View My Requests</button>
                <button className="btn btn-primary" onClick={resetForm}>New Request</button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ── STEP INDICATOR ──────────────────────────────────────
  const StepBar = () => (
    <div className="steps-row">
      {['Select Document','Personal Details','Payment'].map((label, i) => {
        const n = i + 1;
        return (
          <div className="step-item" key={n}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div id={`sn${n}`} className={`step-num ${step > n ? 'done' : step === n ? 'active' : ''}`}>
                {step > n ? '✓' : n}
              </div>
              <div style={{ fontSize: 11, color: step === n ? 'var(--accent2)' : 'var(--muted)', fontWeight: step === n ? 700 : 400, whiteSpace: 'nowrap' }}>
                {label}
              </div>
            </div>
            {n < 3 && <div id={`sc${n}`} className={`step-connector ${step > n ? 'done' : ''}`} style={{ marginBottom: 18 }} />}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="page active" id="page-app">
      <Navbar />
      <div className="app-body">
        <Sidebar role="resident" active="res-request" />
        <main className="main">
          <div className="panel active">
            <div className="sec-head">
              <div>
                <div className="sec-title">Request a Document</div>
                <div className="sec-sub">Fill out the 3-step form below</div>
              </div>
            </div>

            <div className="card" style={{ maxWidth: 680 }}>
              <StepBar />

              {/* ── STEP 1: SELECT DOCUMENT TYPE ── */}
              {step === 1 && (
                <div id="req-s1">
                  <div style={{ fontWeight: 700, marginBottom: 12, color: 'var(--text2)', fontSize: 13,
                                textTransform: 'uppercase', letterSpacing: '.7px' }}>
                    Choose Document Type <span style={{ color: 'var(--danger)' }}>*</span>
                  </div>
                  {loading ? (
                    <div style={{ color: 'var(--muted)', fontSize: 13.5 }}>Loading…</div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 12 }}>
                      {docTypes.map(dt => (
                        <div key={dt.id}
                          className={`doc-card${selectedDoc?.id === dt.id ? ' sel' : ''}`}
                          onClick={() => setSelectedDoc(dt)}>
                          <div className="di">{dt.icon}</div>
                          <div className="dn">{dt.name}</div>
                          <div className="df">{parseFloat(dt.fee) === 0 ? '🆓 FREE' : '₱' + parseFloat(dt.fee).toFixed(2)}</div>
                          <div className="dd">{dt.description || ''} · {dt.processing_days} day{dt.processing_days > 1 ? 's' : ''}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedDoc && (
                    <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
                      <button className="btn btn-primary" style={{ minWidth: 220, padding: '13px 24px', fontSize: 15 }}
                        onClick={() => goStep(2)}>
                        Continue to Personal Details →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ── STEP 2: PERSONAL DETAILS ── */}
              {step === 2 && (
                <div id="req-s2">
                  {/* Selected doc banner + processing type */}
                  <div className="alert alert-success" style={{ marginBottom: 14 }}>
                    {selectedDoc.icon} <strong>{selectedDoc.name}</strong> —{' '}
                    {parseFloat(selectedDoc.fee) === 0 ? <strong>FREE</strong> : '₱' + parseFloat(selectedDoc.fee).toFixed(2)}
                    {' '}· {selectedDoc.processing_days} day processing
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase',
                                  letterSpacing: '.7px', marginBottom: 10 }}>
                      Processing Type <span style={{ color: 'var(--danger)' }}>*</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div onClick={() => setProcType('normal')} style={{
                        border: procType === 'normal' ? '2px solid var(--accent)' : '2px solid var(--border)',
                        background: procType === 'normal' ? 'var(--accent-lt)' : 'var(--white)',
                        borderRadius: 13, padding: '16px 14px', cursor: 'pointer', transition: '.18s' }}>
                        <div style={{ fontSize: 24, marginBottom: 6 }}>📋</div>
                        <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Normal</div>
                        <div style={{ fontSize: 12, color: 'var(--muted2)', marginTop: 3 }}>{selectedDoc.processing_days} day{selectedDoc.processing_days > 1 ? 's' : ''} processing</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent2)', marginTop: 6 }}>
                          {parseFloat(selectedDoc.fee) === 0 ? '🆓 FREE' : '₱' + parseFloat(selectedDoc.fee).toFixed(2)}
                        </div>
                      </div>
                      <div onClick={() => setProcType('urgent')} style={{
                        border: procType === 'urgent' ? '2px solid var(--warning)' : '2px solid var(--border)',
                        background: procType === 'urgent' ? '#fefce8' : 'var(--white)',
                        borderRadius: 13, padding: '16px 14px', cursor: 'pointer', transition: '.18s' }}>
                        <div style={{ fontSize: 24, marginBottom: 6 }}>⚡</div>
                        <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Urgent</div>
                        <div style={{ fontSize: 12, color: 'var(--muted2)', marginTop: 3 }}>Same-day / priority</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--warning)', marginTop: 6 }}>
                          {parseFloat(selectedDoc.fee) === 0
                            ? `₱${parseFloat(selectedDoc.urgent_fee || 50).toFixed(2)} (urgent fee)`
                            : `₱${(parseFloat(selectedDoc.fee) + parseFloat(selectedDoc.urgent_fee || 50)).toFixed(2)} (+₱${parseFloat(selectedDoc.urgent_fee || 50).toFixed(2)} urgent)`}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Personal fields */}
                  <div className="field">
                    <label>Full Name *</label>
                    <input value={form.full_name} onChange={set('full_name')} placeholder="Juan dela Cruz" required />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="field">
                      <label>Date of Birth *</label>
                      <input type="date" value={form.date_of_birth} onChange={set('date_of_birth')} required />
                    </div>
                    <div className="field">
                      <label>Civil Status</label>
                      <select value={form.civil_status} onChange={set('civil_status')}>
                        <option>Single</option><option>Married</option>
                        <option>Widowed</option><option>Separated</option>
                      </select>
                    </div>
                  </div>
                  <div className="field">
                    <label>Contact Number *</label>
                    <input value={form.phone} onChange={set('phone')} placeholder="09XX XXX XXXX" required />
                  </div>
                  <div className="field">
                    <label>Complete Address *</label>
                    <input value={form.address} onChange={set('address')} placeholder="House #, Street, Barangay" required />
                  </div>
                  <div className="field">
                    <label>Purpose *</label>
                    <input value={form.purpose} onChange={set('purpose')} placeholder="e.g. For employment, scholarship, etc." required />
                  </div>

                  <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', marginTop: 8 }}>
                    <button className="btn btn-outline" onClick={() => goStep(1)}>← Back</button>
                    <button className="btn btn-primary" onClick={() => goStep(3)}>Continue to Payment →</button>
                  </div>
                </div>
              )}

              {/* ── STEP 3: PAYMENT ── */}
              {step === 3 && (
                <div id="req-s3">
                  {/* Fee summary */}
                  <div className="alert alert-info" style={{ marginBottom: 14 }}>
                    {selectedDoc.icon} <strong>{selectedDoc.name}</strong> —{' '}
                    {procType === 'urgent'
                      ? <>⚡ <strong style={{ color: 'var(--warning)' }}>Urgent Processing</strong> &nbsp;·&nbsp;
                          Base: ₱{baseFee.toFixed(2)} + Urgent: ₱{urgentFee.toFixed(2)} = </>
                      : '📋 Normal Processing &nbsp;·&nbsp; Fee: '}
                    <strong style={{ color: 'var(--accent)' }}>{isFree ? 'FREE' : '₱' + totalFee.toFixed(2)}</strong>
                  </div>

                  {isFree ? (
                    <div className="alert alert-success" style={{ marginBottom: 18 }}>
                      🎉 This document is <strong>FREE</strong>! No payment needed. Just submit your request.
                    </div>
                  ) : (
                    <>
                      <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text2)', textTransform: 'uppercase',
                                    letterSpacing: '.7px', marginBottom: 12 }}>
                        Select Payment Method *
                      </div>
                      <div className="pay-grid" style={{ marginBottom: 18 }}>
                        {['gcash','maya'].map(method => (
                          <div key={method} id={`pc-${method}`}
                            className={`pay-card${payMethod === method ? ' sel' : ''}`}
                            onClick={() => setPayMethod(method)}>
                            <div className="pay-logo" style={{ fontSize: 28 }}>
                              {method === 'gcash' ? '💙' : '💜'}
                            </div>
                            <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 14 }}>
                              {method === 'gcash' ? 'GCash' : 'Maya'}
                            </div>
                            <div className="pay-sub">Send Money</div>
                          </div>
                        ))}
                      </div>

                      {payMethod && (
                        <div className="pay-qr-box" style={{ marginBottom: 18 }}>
                          <div className="qr-icon">
                            <img
                              src={`/BARANGAY-CONNECT-SYSTEM-/images/${payMethod}-qr.png`}
                              alt={`${payMethod} QR`}
                              style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 8 }}
                            />
                          </div>
                          <div className="pay-amount">₱{totalFee.toFixed(2)}</div>
                          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>
                            {payMethod === 'gcash' ? 'Scan QR or send via GCash Send Money' : 'Scan QR or send via Maya Send Money'}
                          </div>
                          <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>
                            {payMethod === 'gcash'
                              ? (paySettings.gcash_number || '0917-123-4567')
                              : (paySettings.maya_number  || '0998-765-4321')}
                          </div>
                        </div>
                      )}

                      <div className="field">
                        <label>Payment Reference Number *</label>
                        <input
                          value={form.payment_ref}
                          onChange={set('payment_ref')}
                          placeholder={payMethod === 'gcash' ? 'Enter GCash reference number' : payMethod === 'maya' ? 'Enter Maya reference number' : 'Select a payment method first'}
                          disabled={!payMethod}
                        />
                      </div>
                    </>
                  )}

                  <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', marginTop: 8 }}>
                    <button className="btn btn-outline" onClick={() => goStep(2)}>← Back</button>
                    <button className="btn btn-primary" style={{ minWidth: 180 }}
                      onClick={handleSubmit} disabled={submitting}>
                      {submitting ? 'Submitting…' : 'Submit Request ✓'}
                    </button>
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
