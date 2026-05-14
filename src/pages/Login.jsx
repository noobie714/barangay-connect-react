import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { POST } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await POST('auth', 'login', { email, password });
      login(res.data.user);
      if (res.data.user.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh'
    }}>
      <div className="auth-wrap">
        <div className="auth-brand">
          <div className="auth-logo">🏛️</div>
          <h1>BarangayConnect</h1>
          <p>Digital Barangay Document Services</p>
        </div>
        <div className="auth-card">
          <h2>Welcome Back</h2>
          <div className="sub">Sign in to your account</div>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Email Address</label>
              <input type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="yourname@email.com" required />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>
        </div>
        <div className="auth-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </div>
      </div>
    </div>
  );
}