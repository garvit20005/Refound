// One form used for: reporting a new item AND editing an existing item
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { createItem, updateItem, getItemById } from '../services/itemService';
import getErrorMessage from '../utils/getErrorMessage';
import { CATEGORIES } from '../utils/constants';
import Loader from '../components/Loader';

function ReportItem() {
  const { id } = useParams(); // exists only on /edit/:id
  const isEditing = Boolean(id);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    type: searchParams.get('type') === 'Found' ? 'Found' : 'Lost',
    title: '',
    description: '',
    category: '',
    location: '',
    date: today,
  });
  const [imageFile, setImageFile] = useState(null);
  const [currentImage, setCurrentImage] = useState('');
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // When editing, load the existing item into the form
  useEffect(() => {
    if (!isEditing) return;
    const loadItem = async () => {
      try {
        const item = await getItemById(id);
        setForm({
          type: item.type,
          title: item.title,
          description: item.description,
          category: item.category,
          location: item.location,
          date: item.date.slice(0, 10),
        });
        setCurrentImage(item.image);
      } catch (err) {
        setError(getErrorMessage(err));
      }
      setLoading(false);
    };
    loadItem();
  }, [id, isEditing]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5 MB');
      return;
    }
    setError('');
    setImageFile(file || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Frontend validation
    if (!form.title || !form.description || !form.category || !form.location || !form.date) {
      setError('Please fill in all required fields');
      return;
    }

    // FormData is needed to send a file together with text
    const formData = new FormData();
    Object.keys(form).forEach((key) => formData.append(key, form[key]));
    if (imageFile) formData.append('image', imageFile);

    setSubmitting(true);
    try {
      if (isEditing) {
        await updateItem(id, formData);
        navigate(`/items/${id}`);
      } else {
        const newItem = await createItem(formData);
        navigate(`/items/${newItem._id}`);
      }
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="container auth-page">
      <form className="form-card form-wide" onSubmit={handleSubmit}>
        <h1>{isEditing ? 'Edit report' : 'Report an item'}</h1>
        {error && <p className="alert alert-error">{error}</p>}

        <label>This item was</label>
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="Lost">Lost by me</option>
          <option value="Found">Found by me</option>
        </select>

        <label>Item title</label>
        <input
          type="text"
          name="title"
          maxLength="80"
          placeholder="e.g. Black leather wallet"
          value={form.title}
          onChange={handleChange}
        />

        <label>Description</label>
        <textarea
          name="description"
          rows="4"
          placeholder="Colour, brand, size and other details. For found items, keep one detail private so you can verify the owner."
          value={form.description}
          onChange={handleChange}
        />

        <label>Category</label>
        <select name="category" value={form.category} onChange={handleChange}>
          <option value="">Select a category</option>
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <label>Location where it was {form.type.toLowerCase()}</label>
        <input
          type="text"
          name="location"
          placeholder="e.g. Jaipur Railway Station"
          value={form.location}
          onChange={handleChange}
        />

        <label>Date when it was {form.type.toLowerCase()}</label>
        <input type="date" name="date" max={today} value={form.date} onChange={handleChange} />

        <label>Image (optional, max 5 MB)</label>
        {currentImage && !imageFile && (
          <img src={currentImage} alt="Current" className="preview-image" />
        )}
        {imageFile && (
          <img src={URL.createObjectURL(imageFile)} alt="Preview" className="preview-image" />
        )}
        <input type="file" accept="image/*" onChange={handleImageChange} />

        <button type="submit" className="btn btn-primary btn-full" disabled={submitting}>
          {submitting ? 'Saving...' : isEditing ? 'Save changes' : 'Submit report'}
        </button>
      </form>
    </div>
  );
}

export default ReportItem;
