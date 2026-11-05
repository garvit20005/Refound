import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getItems } from '../services/itemService';
import ItemCard from '../components/ItemCard';
import Loader from '../components/Loader';

function Home() {
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load the latest items to show on the home page
  useEffect(() => {
    const loadItems = async () => {
      try {
        const items = await getItems({ sort: 'latest' });
        setRecentItems(items.slice(0, 4));
      } catch (error) {
        setRecentItems([]);
      }
      setLoading(false);
    };
    loadItems();
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Lost. Located. Returned.</h1>
          <p className="hero-text">
            ReFound helps you report something you lost, post something you found, and
            connect lost belongings with their owners.
          </p>
          <div className="hero-actions">
            <Link to="/report?type=Lost" className="btn btn-primary">Report Lost Item</Link>
            <Link to="/report?type=Found" className="btn btn-outline">Report Found Item</Link>
            <Link to="/explore" className="btn btn-outline">Explore Items</Link>
          </div>
        </div>
      </section>

      <section className="container section">
        <h2>How it works</h2>
        <div className="steps">
          <div className="step">
            <h3>1. Report</h3>
            <p>Post the item you lost or found with a photo, place and date.</p>
          </div>
          <div className="step">
            <h3>2. Match</h3>
            <p>Search the listings. If a found item is yours, send a claim with details.</p>
          </div>
          <div className="step">
            <h3>3. Recover</h3>
            <p>The finder reviews your claim. Once accepted, you can contact each other.</p>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="section-header">
          <h2>Recent reports</h2>
          <Link to="/explore">View all</Link>
        </div>
        {loading ? (
          <Loader />
        ) : recentItems.length === 0 ? (
          <p className="muted">No reports yet. Be the first to report an item.</p>
        ) : (
          <div className="item-grid">
            {recentItems.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default Home;
