import { useEffect, useState } from 'react';
import { getItems } from '../services/itemService';
import getErrorMessage from '../utils/getErrorMessage';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import ItemCard from '../components/ItemCard';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

const defaultFilters = { search: '', type: '', category: '', location: '', sort: 'latest' };

function Explore() {
  const [filters, setFilters] = useState(defaultFilters);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch items again whenever a filter changes (small delay while typing)
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        // send only the filters that have a value
        const params = {};
        Object.keys(filters).forEach((key) => {
          if (filters[key]) params[key] = filters[key];
        });
        setItems(await getItems(params));
      } catch (err) {
        setError(getErrorMessage(err));
      }
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters]);

  const handleSearch = (text) => setFilters({ ...filters, search: text });

  return (
    <div className="container section">
      <h1>Explore items</h1>
      <p className="muted">Browse everything that has been reported as lost or found.</p>

      {/* key makes the search box reset when filters are cleared */}
      <SearchBar key={filters.search === '' ? 'empty' : 'filled'} onSearch={handleSearch} initialValue={filters.search} />
      <FilterBar filters={filters} onChange={setFilters} onClear={() => setFilters(defaultFilters)} />

      {error && <p className="alert alert-error">{error}</p>}

      {loading ? (
        <Loader />
      ) : items.length === 0 ? (
        <EmptyState
          title="No items found"
          message="Try a different search or clear the filters. You can also report an item yourself."
          actionText="Report an item"
          actionLink="/report"
        />
      ) : (
        <>
          <p className="muted">{items.length} item(s) found</p>
          <div className="item-grid">
            {items.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Explore;
