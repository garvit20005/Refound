import { Link } from 'react-router-dom';

// Shown when a list has nothing in it
function EmptyState({ title, message, actionText, actionLink }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{message}</p>
      {actionText && (
        <Link to={actionLink} className="btn btn-primary">
          {actionText}
        </Link>
      )}
    </div>
  );
}

export default EmptyState;
