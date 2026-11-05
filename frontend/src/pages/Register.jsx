import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import getErrorMessage from '../utils/getErrorMessage';

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    location: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Frontend validation
    if (!form.name || !form.email || !form.password || !form.phone || !form.location) {
      setError('Please fill in all fields');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (!/^[0-9+\-\s]{7,15}$/.test(form.phone)) {
      setError('Please enter a valid phone number');
      return;
    }

    setSubmitting(true);
    try {
      await register(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    }
    setSubmitting(false);
  };

  return (
    <div className="container auth-page">
      <form className="form-card" onSubmit={handleSubmit}>
        <h1>Create account</h1>
        {error && <p className="alert alert-error">{error}</p>}

        <label>Name</label>
        <input type="text" name="name" value={form.name} onChange={handleChange} />

        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} />

        <label>Password</label>
        <input type="password" name="password" value={form.password} onChange={handleChange} />
        <small className="muted">At least 6 characters</small>

        <label>Phone number</label>
        <input type="tel" name="phone" value={form.phone} onChange={handleChange} />

        <label>Location (city)</label>
        <input type="text" name="location" value={form.location} onChange={handleChange} />

        <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Sign up'}
        </button>

        <p className="form-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
