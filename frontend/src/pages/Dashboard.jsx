import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyItems } from '../services/itemService';
import { getMyClaims, getReceivedClaims } from '../services/claimService';
import useAuth from '../hooks/useAuth';
import getErrorMessage from '../utils/getErrorMessage';
import formatDate from '../utils/formatDate';
import Loader from '../components/Loader';

function Dashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [received, setReceived] = useState([]);
  const [submitted, setSubmitted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setItems(await getMyItems());
        setReceived(await getReceivedClaims());
        setSubmitted(await getMyClaims());
      } catch (err) {
        setError(getErrorMessage(err));
      }
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) return <Loader />;

  // Numbers shown on the dashboard
  const stats = [
    { label: 'Total reported', value: items.length },
    { label: 'Lost items', value: items.filter((i) => i.type === 'Lost').length },
    { label: 'Found items', value: items.filter((i) => i.type === 'Found').length },
    { label: 'Pending claims', value: received.filter((c) => c.status === 'Pending').length },
    { label: 'Accepted claims', value: received.filter((c) => c.status === 'Accepted').length },
    { label: 'Recovered items', value: items.filter((i) => i.status === 'Recovered').length },
  ];

  // Recent activity = my reports + claims I got + claims I sent, newest first
  const activity = [
    ...items.map((item) => ({
      id: `item-${item._id}`,
      text: `You reported "${item.title}" as ${item.type.toLowerCase()}`,
      date: item.createdAt,
      link: `/items/${item._id}`,
    })),
    ...received.map((claim) => ({
      id: `received-${claim._id}`,
      text: `${claim.claimant?.name || 'Someone'} claimed "${claim.item?.title}" (${claim.status})`,
      date: claim.createdAt,
      link: '/my-claims',
    })),
    ...submitted.map((claim) => ({
      id: `submitted-${claim._id}`,
      text: `You claimed "${claim.item?.title || 'an item'}" (${claim.status})`,
      date: claim.createdAt,
      link: '/my-claims',
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  return (
    <div className="container section">
      <h1>Hello, {user.name}</h1>
      <p className="muted">Here is a summary of your activity.</p>

      {error && <p className="alert alert-error">{error}</p>}

      <div className="stats-grid">
        {stats.map((stat) => (
          <div className="stat-card" key={stat.label}>
            <span className="stat-number">{stat.value}</span>
            <span className="muted">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="section-header">
        <h2>Recent activity</h2>
        <Link to="/report" className="btn btn-primary btn-small">New report</Link>
      </div>

      {activity.length === 0 ? (
        <p className="muted">Nothing here yet. Report your first item to get started.</p>
      ) : (
        <ul className="activity-list">
          {activity.map((entry) => (
            <li key={entry.id}>
              <Link to={entry.link}>{entry.text}</Link>
              <span className="muted small">{formatDate(entry.date)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dashboard;
