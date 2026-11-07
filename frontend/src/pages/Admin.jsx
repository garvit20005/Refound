import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getStats,
  getUsers,
  toggleBlockUser,
  getAllItems,
  deleteAnyItem,
  getFlags,
  updateFlagStatus,
} from '../services/adminService';
import getErrorMessage from '../utils/getErrorMessage';
import formatDate from '../utils/formatDate';
import Loader from '../components/Loader';

function Admin() {
  const [tab, setTab] = useState('overview'); // overview, users, posts, reports
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load everything the admin page needs
  const loadData = async () => {
    try {
      setStats(await getStats());
      setUsers(await getUsers());
      setItems(await getAllItems());
      setFlags(await getFlags());
    } catch (err) {
      setError(getErrorMessage(err));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBlock = async (user) => {
    const action = user.isBlocked ? 'unblock' : 'block';
    if (!window.confirm(`Do you want to ${action} ${user.name}?`)) return;
    setError('');
    try {
      await toggleBlockUser(user._id);
      loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Delete "${item.title}"? This also removes its claims and reports.`)) return;
    setError('');
    try {
      await deleteAnyItem(item._id);
      loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleFlagStatus = async (flagId, status) => {
    setError('');
    try {
      await updateFlagStatus(flagId, status);
      loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) return <Loader />;

  const statCards = stats
    ? [
        { label: 'Total users', value: stats.users },
        { label: 'Total items', value: stats.items },
        { label: 'Total claims', value: stats.claims },
        { label: 'Lost items', value: stats.lostItems },
        { label: 'Found items', value: stats.foundItems },
        { label: 'Recovered', value: stats.recovered },
        { label: 'Blocked users', value: stats.blockedUsers },
        { label: 'Open reports', value: stats.openFlags },
      ]
    : [];

  return (
    <div className="container section">
      <h1>Admin dashboard</h1>
      <p className="muted">Manage users and posts on ReFound.</p>

      {error && <p className="alert alert-error">{error}</p>}

      <div className="tabs">
        {[
          ['overview', 'Overview'],
          ['users', `Users (${users.length})`],
          ['posts', `Posts (${items.length})`],
          ['reports', `Reports (${flags.filter((f) => f.status === 'Open').length} open)`],
        ].map(([key, label]) => (
          <button key={key} className={tab === key ? 'tab active' : 'tab'} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>

      {/* ---------- Overview ---------- */}
      {tab === 'overview' && (
        <div className="stats-grid stats-grid-4">
          {statCards.map((card) => (
            <div className="stat-card" key={card.label}>
              <span className="stat-number">{card.value}</span>
              <span className="muted">{card.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ---------- Users ---------- */}
      {tab === 'users' && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Items</th>
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.itemCount}</td>
                  <td>{user.role}</td>
                  <td>{user.isBlocked ? 'Blocked' : 'Active'}</td>
                  <td>
                    {user.role === 'admin' ? (
                      <span className="muted">-</span>
                    ) : (
                      <button className="btn btn-outline btn-small" onClick={() => handleBlock(user)}>
                        {user.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ---------- Posts ---------- */}
      {tab === 'posts' && (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Posted by</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td><Link to={`/items/${item._id}`}>{item.title}</Link></td>
                  <td>{item.type}</td>
                  <td>{item.user ? item.user.name : 'Deleted user'}</td>
                  <td>{item.status}</td>
                  <td>{formatDate(item.createdAt)}</td>
                  <td>
                    <button className="btn btn-outline btn-small" onClick={() => handleDeleteItem(item)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && <p className="muted">No posts yet.</p>}
        </div>
      )}

      {/* ---------- Reports (flagged posts) ---------- */}
      {tab === 'reports' && (
        <div className="list">
          {flags.length === 0 && <p className="muted">No reports from users yet.</p>}
          {flags.map((flag) => (
            <div className="claim-card" key={flag._id}>
              <div className="claim-head">
                <Link to={`/items/${flag.item._id}`} className="list-title">{flag.item.title}</Link>
                <span className="badge badge-status">{flag.status}</span>
              </div>
              <p className="muted small">
                Reported by {flag.reporter ? flag.reporter.name : 'a user'} on {formatDate(flag.createdAt)}
              </p>
              <p><strong>Reason:</strong> {flag.reason}</p>
              {flag.note && <p><strong>Details:</strong> {flag.note}</p>}

              <div className="action-row">
                {flag.status === 'Open' && (
                  <>
                    <button className="btn btn-outline btn-small" onClick={() => handleFlagStatus(flag._id, 'Dismissed')}>
                      Dismiss
                    </button>
                    <button className="btn btn-outline btn-small" onClick={() => handleFlagStatus(flag._id, 'Resolved')}>
                      Mark resolved
                    </button>
                  </>
                )}
                <button className="btn btn-primary btn-small" onClick={() => handleDeleteItem(flag.item)}>
                  Delete post
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Admin;
