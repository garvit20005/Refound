import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="container section not-found">
      <h1>404</h1>
      <p>This page does not exist.</p>
      <Link to="/" className="btn btn-primary">Go to home</Link>
    </div>
  );
}

export default NotFound;
