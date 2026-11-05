import { CATEGORIES } from '../utils/constants';

// Dropdowns and inputs for filtering. Parent keeps the values.
function FilterBar({ filters, onChange, onClear }) {
  const handleChange = (e) => {
    onChange({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="filter-bar">
      <select name="type" value={filters.type} onChange={handleChange}>
        <option value="">Lost and Found</option>
        <option value="Lost">Lost</option>
        <option value="Found">Found</option>
      </select>

      <select name="category" value={filters.category} onChange={handleChange}>
        <option value="">All categories</option>
        {CATEGORIES.map((category) => (
          <option key={category} value={category}>{category}</option>
        ))}
      </select>

      <input
        type="text"
        name="location"
        placeholder="Location"
        value={filters.location}
        onChange={handleChange}
      />

      <select name="sort" value={filters.sort} onChange={handleChange}>
        <option value="latest">Latest first</option>
        <option value="oldest">Oldest first</option>
      </select>

      <button type="button" className="btn btn-outline" onClick={onClear}>
        Clear
      </button>
    </div>
  );
}

export default FilterBar;
