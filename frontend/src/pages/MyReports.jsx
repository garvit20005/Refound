import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyItems, deleteItem, markItemRecovered } from '../services/itemService';
import getErrorMessage from '../utils/getErrorMessage';
import formatDate from '../utils/formatDate';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

function MyReports() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('All'); // All, Lost, Found
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadItems = async () => {
    try {
      setItems(await getMyItems());
    } catch (err) {
      setError(getErrorMessage(err));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this report? This cannot be undone.')) return;
    try {
      await deleteItem(id);
      setItems(items.filter((item) => item._id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleRecovered = async (id) => {
    if (!window.confirm('Mark this item as recovered?')) return;
    try {
      await markItemRecovered(id);
      loadItems();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) return <Loader />;

  const shownItems = filter === 'All' ? items : items.filter((item) => item.type === filter);

  return (
    <div className="container section">
      <div className="section-header">
        <h1>My reports</h1>
        <Link to="/report" className="btn btn-primary">New report</Link>
      </div>

      {error && <p className="alert alert-error">{error}</p>}

      <div className="tabs">
        {['All', 'Lost', 'Found'].map((name) => (
          <button
            key={name}
            className={filter === name ? 'tab active' : 'tab'}
            onClick={() => setFilter(name)}
          >
            {name}
          </button>
        ))}
      </div>

      {shownItems.length === 0 ? (
        <EmptyState
          title="No reports here"
          message="Items you report as lost or found will appear here."
          actionText="Report an item"
          actionLink="/report"
        />
      ) : (
        <div className="list">
          {shownItems.map((item) => (
            <div className="list-row" key={item._id}>
              {item.image ? (
                <img src={item.image} alt={item.title} className="list-thumb" />
              ) : (
                <div className="list-thumb no-image">No image</div>
              )}

              <div className="list-main">
                <div className="badge-row">
                  <span className={`badge badge-${item.type.toLowerCase()}`}>{item.type}</span>
                  <span className="badge badge-status">{item.status}</span>
                </div>
                <Link to={`/items/${item._id}`} className="list-title">{item.title}</Link>
                <p className="muted small">{item.location} - {formatDate(item.date)}</p>
              </div>

              <div className="list-actions">
                <Link to={`/edit/${item._id}`} className="btn btn-outline btn-small">Edit</Link>
                {item.status !== 'Recovered' && (
                  <button className="btn btn-outline btn-small" onClick={() => handleRecovered(item._id)}>
                    Mark recovered
                  </button>
                )}
                <button className="btn btn-outline btn-small" onClick={() => handleDelete(item._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyReports;
