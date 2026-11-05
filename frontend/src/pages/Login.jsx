import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import getErrorMessage from '../utils/getErrorMessage';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password) {
      setError('Please enter your email and password');
      return;
    }

    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    }
    setSubmitting(false);
  };

  return (
    <div className="container auth-page">
      <form className="form-card" onSubmit={handleSubmit}>
        <h1>Login</h1>
        {error && <p className="alert alert-error">{error}</p>}

        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} />

        <label>Password</label>
        <input type="password" name="password" value={form.password} onChange={handleChange} />

        <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
          {submitting ? 'Logging in...' : 'Login'}
        </button>

        <p className="form-footer">
          New to ReFound? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
