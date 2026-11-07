import { useState } from 'react';
import { changePassword } from '../services/authService';
import getErrorMessage from '../utils/getErrorMessage';

function ChangePasswordForm() {
  const emptyForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (form.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }

    setSaving(true);
    try {
      await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setSuccess('Password changed successfully');
      setForm(emptyForm);
    } catch (err) {
      setError(getErrorMessage(err));
    }
    setSaving(false);
  };

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h2>Change password</h2>
      {error && <p className="alert alert-error">{error}</p>}
      {success && <p className="alert alert-success">{success}</p>}

      <label>Current password</label>
      <input type="password" name="currentPassword" value={form.currentPassword} onChange={handleChange} />

      <label>New password</label>
      <input type="password" name="newPassword" value={form.newPassword} onChange={handleChange} />

      <label>Confirm new password</label>
      <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} />

      <button type="submit" className="btn btn-primary btn-full" disabled={saving}>
        {saving ? 'Saving...' : 'Change password'}
      </button>
    </form>
  );
}

export default ChangePasswordForm;
