import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getItemById, deleteItem, markItemRecovered } from '../services/itemService';
import { createClaim } from '../services/claimService';
import { createFlag } from '../services/flagService';
import useAuth from '../hooks/useAuth';
import getErrorMessage from '../utils/getErrorMessage';
import formatDate from '../utils/formatDate';
import timeAgo from '../utils/timeAgo';
import Loader from '../components/Loader';

function ItemDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [claimForm, setClaimForm] = useState({ message: '', details: '' });
  const [claimError, setClaimError] = useState('');
  const [claimSent, setClaimSent] = useState(false);
  const [sending, setSending] = useState(false);

  // "Report this post" form
  const [showFlag, setShowFlag] = useState(false);
  const [flagForm, setFlagForm] = useState({ reason: '', note: '' });
  const [flagError, setFlagError] = useState('');
  const [flagMessage, setFlagMessage] = useState('');
  const [flagSending, setFlagSending] = useState(false);

  useEffect(() => {
    const loadItem = async () => {
      try {
        setItem(await getItemById(id));
      } catch (err) {
        setError(getErrorMessage(err));
      }
      setLoading(false);
    };
    loadItem();
  }, [id]);

  if (loading) return <Loader />;
  if (error) {
    return (
      <div className="container section">
        <p className="alert alert-error">{error}</p>
        <Link to="/explore">Back to Explore</Link>
      </div>
    );
  }

  const isOwner = user && item.user && user._id === item.user._id;
  const canClaim = !isOwner && item.type === 'Found' && item.status === 'Active';

  const handleDelete = async () => {
    if (!window.confirm('Delete this report? This cannot be undone.')) return;
    try {
      await deleteItem(item._id);
      navigate('/my-reports');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleRecovered = async () => {
    if (!window.confirm('Mark this item as recovered?')) return;
    try {
      setItem({ ...item, status: (await markItemRecovered(item._id)).status });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleClaimChange = (e) => setClaimForm({ ...claimForm, [e.target.name]: e.target.value });

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    setClaimError('');

    if (claimForm.message.trim().length < 10) {
      setClaimError('Please explain why this item is yours (at least 10 characters)');
      return;
    }

    setSending(true);
    try {
      await createClaim({ itemId: item._id, ...claimForm });
      setClaimSent(true);
    } catch (err) {
      setClaimError(getErrorMessage(err));
    }
    setSending(false);
  };

  const handleFlagChange = (e) => setFlagForm({ ...flagForm, [e.target.name]: e.target.value });

  const handleFlagSubmit = async (e) => {
    e.preventDefault();
    setFlagError('');

    if (!flagForm.reason) {
      setFlagError('Please select a reason');
      return;
    }

    setFlagSending(true);
    try {
      const data = await createFlag({ itemId: item._id, ...flagForm });
      setFlagMessage(data.message);
    } catch (err) {
      setFlagError(getErrorMessage(err));
    }
    setFlagSending(false);
  };

  return (
    <div className="container section">
      <Link to="/explore" className="back-link">Back to Explore</Link>

      <div className="details">
        {item.image ? (
          <img src={item.image} alt={item.title} className="details-image" />
        ) : (
          <div className="details-image no-image">No image</div>
        )}

        <div className="details-info">
          <div className="badge-row">
            <span className={`badge badge-${item.type.toLowerCase()}`}>{item.type}</span>
            <span className="badge badge-status">{item.status}</span>
          </div>
          <h1>{item.title}</h1>
          <p>{item.description}</p>

          <dl className="info-list">
            <dt>Category</dt>
            <dd>{item.category}</dd>
            <dt>{item.type === 'Lost' ? 'Lost at' : 'Found at'}</dt>
            <dd>{item.location}</dd>
            <dt>{item.type === 'Lost' ? 'Date lost' : 'Date found'}</dt>
            <dd>{formatDate(item.date)}</dd>
            <dt>Reported by</dt>
            <dd>{item.user ? item.user.name : 'Unknown'}</dd>
            <dt>Reported on</dt>
            <dd>{formatDate(item.createdAt)} ({timeAgo(item.createdAt)})</dd>
          </dl>
          <p className="muted small">Contact details stay private until a claim is accepted.</p>

          {/* Actions for the owner */}
          {isOwner && (
            <div className="action-row">
              <Link to={`/edit/${item._id}`} className="btn btn-outline">Edit</Link>
              {item.status !== 'Recovered' && (
                <button className="btn btn-primary" onClick={handleRecovered}>Mark as recovered</button>
              )}
              <button className="btn btn-outline" onClick={handleDelete}>Delete</button>
            </div>
          )}

          {/* Report this post (only on other people's posts) */}
          {user && !isOwner && (
            <div className="flag-box">
              {flagMessage ? (
                <p className="alert alert-success">{flagMessage}</p>
              ) : !showFlag ? (
                <button type="button" className="link-button" onClick={() => setShowFlag(true)}>
                  Report this post
                </button>
              ) : (
                <form onSubmit={handleFlagSubmit}>
                  {flagError && <p className="alert alert-error">{flagError}</p>}

                  <label>Why are you reporting this post?</label>
                  <select name="reason" value={flagForm.reason} onChange={handleFlagChange}>
                    <option value="">Select a reason</option>
                    <option value="Spam">Spam</option>
                    <option value="Fake or misleading">Fake or misleading</option>
                    <option value="Inappropriate">Inappropriate</option>
                    <option value="Other">Other</option>
                  </select>

                  <label>More details (optional)</label>
                  <textarea name="note" rows="2" maxLength="300" value={flagForm.note} onChange={handleFlagChange} />

                  <div className="action-row">
                    <button type="submit" className="btn btn-primary btn-small" disabled={flagSending}>
                      {flagSending ? 'Sending...' : 'Send report'}
                    </button>
                    <button type="button" className="btn btn-outline btn-small" onClick={() => setShowFlag(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Lost item, seen by someone else */}
          {!isOwner && item.type === 'Lost' && (
            <p className="note">
              Did you find this? <Link to="/report?type=Found">Report it as found</Link> so
              the owner can see it and send a claim.
            </p>
          )}
        </div>
      </div>

      {/* Claim form for found items */}
      {canClaim && (
        <div className="claim-box">
          <h2>Is this yours?</h2>
          {!user ? (
            <p>
              <Link to="/login" state={{ from: `/items/${item._id}` }}>Login</Link> to send a claim request.
            </p>
          ) : claimSent ? (
            <p className="alert alert-success">
              Claim sent. The finder will review it. Check <Link to="/my-claims">My Claims</Link> for updates.
            </p>
          ) : (
            <form onSubmit={handleClaimSubmit}>
              {claimError && <p className="alert alert-error">{claimError}</p>}

              <label>Why do you believe this is yours?</label>
              <textarea name="message" rows="3" value={claimForm.message} onChange={handleClaimChange} />

              <label>Identifying details (optional)</label>
              <textarea
                name="details"
                rows="2"
                placeholder="Something only the owner would know: scratches, contents, serial number..."
                value={claimForm.details}
                onChange={handleClaimChange}
              />

              <button type="submit" className="btn btn-primary" disabled={sending}>
                {sending ? 'Sending...' : 'Send claim request'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default ItemDetails;
