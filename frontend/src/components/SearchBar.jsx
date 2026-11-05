import { useState } from 'react';

// Search box. Calls onSearch(text) when the form is submitted.
function SearchBar({ onSearch, initialValue = '' }) {
  const [text, setText] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(text.trim());
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Search by item name, e.g. black wallet"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button type="submit" className="btn btn-primary">Search</button>
    </form>
  );
}

export default SearchBar;
