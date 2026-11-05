import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { updateProfile } from '../services/authService';
import { getMyItems } from '../services/itemService';
import getErrorMessage from '../utils/getErrorMessage';
import formatDate from '../utils/formatDate';

function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user.name, phone: user.phone, location: user.location });
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMyItems().then(setItems).catch(() => setItems([]));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name || !form.phone || !form.location) {
      setError('Name, phone and location are required');
      return;
    }

    setSaving(true);
    try {
      const updatedUser = await updateProfile(form);
      updateUser(updatedUser);
      setSuccess('Profile updated');
    } catch (err) {
      setError(getErrorMessage(err));
    }
    setSaving(false);
  };

  return (
    <div className="container section">
      <h1>My profile</h1>

      <div className="profile-layout">
        <form className="form-card" onSubmit={handleSubmit}>
          {error && <p className="alert alert-error">{error}</p>}
          {success && <p className="alert alert-success">{success}</p>}

          <label>Email</label>
          <input type="email" value={user.email} disabled />
          <small className="muted">Email cannot be changed. Member since {formatDate(user.createdAt)}.</small>

          <label>Name</label>
          <input type="text" name="name" value={form.name} onChange={handleChange} />

          <label>Phone number</label>
          <input type="tel" name="phone" value={form.phone} onChange={handleChange} />

          <label>Location</label>
          <input type="text" name="location" value={form.location} onChange={handleChange} />

          <button type="submit" className="btn btn-primary btn-full" disabled={saving}>
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>

        <div>
          <h2>My reported items</h2>
          {items.length === 0 ? (
            <p className="muted">You have not reported any items yet.</p>
          ) : (
            <ul className="activity-list">
              {items.slice(0, 8).map((item) => (
                <li key={item._id}>
                  <Link to={`/items/${item._id}`}>{item.title} ({item.type})</Link>
                  <span className="muted small">{item.status}</span>
                </li>
              ))}
            </ul>
          )}
          {items.length > 0 && <Link to="/my-reports">View all reports</Link>}
        </div>
      </div>
    </div>
  );
}

export default Profile;
