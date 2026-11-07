import { Link } from 'react-router-dom';
import formatDate from '../utils/formatDate';
import timeAgo from '../utils/timeAgo';

function ItemCard({ item }) {
  return (
    <Link to={`/items/${item._id}`} className="item-card">
      {item.image ? (
        <img src={item.image} alt={item.title} className="item-card-image" />
      ) : (
        <div className="item-card-image no-image">No image</div>
      )}

      <div className="item-card-body">
        <div className="badge-row">
          <span className={`badge badge-${item.type.toLowerCase()}`}>{item.type}</span>
          {item.status !== 'Active' && <span className="badge badge-status">{item.status}</span>}
        </div>
        <h3>{item.title}</h3>
        <p className="muted">{item.category}</p>
        <p className="muted">{item.location}</p>
        <p className="muted">{formatDate(item.date)}</p>
        <p className="muted small">Reported {timeAgo(item.createdAt)}</p>
      </div>
    </Link>
  );
}

export default ItemCard;
