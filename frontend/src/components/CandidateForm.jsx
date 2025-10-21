import React, { useState } from 'react';
import { createCandidate } from '../services/api';

const CandidateForm = ({ onAdd, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        notes: ''
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const newCandidate = await createCandidate(formData);
            onAdd(newCandidate);
            setFormData({ name: '', email: '', phone: '', notes: '' });
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
            <h3> Add New Candidate</h3>

            <input
                type="text"
                name="name"
                placeholder="Name"
                value={formData.name}
                onChange={handleChange}
                required
            /><br />

            <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
            /><br />

            <input
                type="tel"
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleChange}
            /><br />

            <textarea
                name="notes"
                placeholder="Notes"
                value={formData.notes}
                onChange={handleChange}
            /><br />

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Add Candidate'}
            </button>
            {onCancel && (
                <button type="button" onClick={onCancel} style={{ marginLeft: '0.5rem' }}>
                    Cancel
                </button>
            )}
        </form>
    );
};

export default CandidateForm;
