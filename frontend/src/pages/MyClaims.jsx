import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyClaims, getReceivedClaims, updateClaimStatus } from '../services/claimService';
import getErrorMessage from '../utils/getErrorMessage';
import formatDate from '../utils/formatDate';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

function MyClaims() {
  const [tab, setTab] = useState('received'); // received or submitted
  const [submitted, setSubmitted] = useState([]);
  const [received, setReceived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadClaims = async () => {
    try {
      setSubmitted(await getMyClaims());
      setReceived(await getReceivedClaims());
    } catch (err) {
      setError(getErrorMessage(err));
    }
    setLoading(false);
  };

  useEffect(() => {
    loadClaims();
  }, []);

  const handleDecision = async (claimId, status) => {
    if (!window.confirm(`${status === 'Accepted' ? 'Accept' : 'Reject'} this claim?`)) return;
    setError('');
    try {
      await updateClaimStatus(claimId, status);
      loadClaims(); // reload so statuses (and contact details) update
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="container section">
      <h1>My claims</h1>
      {error && <p className="alert alert-error">{error}</p>}

      <div className="tabs">
        <button className={tab === 'received' ? 'tab active' : 'tab'} onClick={() => setTab('received')}>
          Received ({received.length})
        </button>
        <button className={tab === 'submitted' ? 'tab active' : 'tab'} onClick={() => setTab('submitted')}>
          Submitted ({submitted.length})
        </button>
      </div>

      {/* Claims on found items I reported */}
      {tab === 'received' &&
        (received.length === 0 ? (
          <EmptyState
            title="No claims received"
            message="When someone claims an item you found, it will show up here."
          />
        ) : (
          <div className="list">
            {received.map((claim) => (
              <div className="claim-card" key={claim._id}>
                <div className="claim-head">
                  <Link to={`/items/${claim.item._id}`} className="list-title">{claim.item.title}</Link>
                  <span className={`badge badge-claim-${claim.status.toLowerCase()}`}>{claim.status}</span>
                </div>
                <p className="muted small">
                  From {claim.claimant ? claim.claimant.name : 'a user'} on {formatDate(claim.createdAt)}
                </p>
                <p><strong>Message:</strong> {claim.message}</p>
                {claim.details && <p><strong>Details:</strong> {claim.details}</p>}

                {claim.status === 'Pending' && (
                  <div className="action-row">
                    <button className="btn btn-primary btn-small" onClick={() => handleDecision(claim._id, 'Accepted')}>
                      Accept
                    </button>
                    <button className="btn btn-outline btn-small" onClick={() => handleDecision(claim._id, 'Rejected')}>
                      Reject
                    </button>
                  </div>
                )}

                {claim.status === 'Accepted' && claim.claimant && (
                  <div className="note">
                    Contact the owner: {claim.claimant.phone} / {claim.claimant.email}. After
                    handing over the item, mark it as recovered in <Link to="/my-reports">My Reports</Link>.
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}

      {/* Claims I sent */}
      {tab === 'submitted' &&
        (submitted.length === 0 ? (
          <EmptyState
            title="No claims submitted"
            message="Found something that looks like yours? Send a claim from the item page."
            actionText="Explore items"
            actionLink="/explore"
          />
        ) : (
          <div className="list">
            {submitted.map((claim) => (
              <div className="claim-card" key={claim._id}>
                <div className="claim-head">
                  {claim.item ? (
                    <Link to={`/items/${claim.item._id}`} className="list-title">{claim.item.title}</Link>
                  ) : (
                    <span className="list-title">Item removed</span>
                  )}
                  <span className={`badge badge-claim-${claim.status.toLowerCase()}`}>{claim.status}</span>
                </div>
                <p className="muted small">Sent on {formatDate(claim.createdAt)}</p>
                <p><strong>Your message:</strong> {claim.message}</p>

                {claim.status === 'Pending' && <p className="muted">Waiting for the finder to respond.</p>}
                {claim.status === 'Rejected' && <p className="muted">The finder did not accept this claim.</p>}
                {claim.status === 'Accepted' && claim.item?.user && (
                  <div className="note">
                    Claim accepted. Contact {claim.item.user.name}: {claim.item.user.phone} / {claim.item.user.email}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}

export default MyClaims;
