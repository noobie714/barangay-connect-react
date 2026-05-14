import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { POST } from "../api";

export default function Register() {
  const [form, setForm]     = useState({
    first_name:'', last_name:'', email:'', phone:'',
    purok:'', address:'', password:'', confirm_password:''
  });
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      const res = await POST('auth', 'register', form);
      setSuccess(res.data.message);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page"style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh'
    }}>
      <div className="auth-wrap" style={{ maxWidth: 500 }}>
        <div className="auth-brand">
          <div className="auth-logo">🏛️</div>
          <h1>BarangayConnect</h1>
          <p>Create your resident account</p>
        </div>
        <div className="auth-card">
          <h2>Create Account</h2>
          {error   && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="row2">
              <div className="field"><label>First Name *</label>
                <input value={form.first_name} onChange={set('first_name')} placeholder="Juan" required /></div>
              <div className="field"><label>Last Name *</label>
                <input value={form.last_name} onChange={set('last_name')} placeholder="dela Cruz" required /></div>
            </div>
            <div className="field"><label>Email *</label>
              <input type="email" value={form.email} onChange={set('email')} required /></div>
            <div className="row2">
              <div className="field"><label>Mobile *</label>
                <input value={form.phone} onChange={set('phone')} placeholder="09XX XXX XXXX" required /></div>
              <div className="field"><label>Barangay *</label>
                <select value={form.purok} onChange={set('purok')} required>
                  <option value="">Select</option>
                  <option>Pusok</option>
                  <option>Pajo</option>
                </select>
              </div>
            </div>
            <div className="field"><label>Complete Address</label>
              <input value={form.address} onChange={set('address')} /></div>
            <div className="row2">
              <div className="field"><label>Password *</label>
                <input type="password" value={form.password} onChange={set('password')} required /></div>
              <div className="field"><label>Confirm Password *</label>
                <input type="password" value={form.confirm_password} onChange={set('confirm_password')} required /></div>
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Creating…' : 'Create Account →'}
            </button>
          </form>
        </div>
        <div className="auth-footer">Already registered? <Link to="/login">Sign in</Link></div>
      </div>
    </div>
  );
}