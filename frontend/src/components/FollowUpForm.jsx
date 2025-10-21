import React, { useState } from 'react';
import { createFollowUp } from '../services/api';

const FollowUpForm = ({ candidateId, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        followup_date: '',
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
            await createFollowUp({
                ...formData,
                candidate_id: candidateId
            });
            if (onSuccess) onSuccess();
            setFormData({ followup_date: '', notes: ''});
        } catch (err) {
            setError(err.message || 'Failed to create follow-up');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ marginTop: '0.5rem' }}>
            <h4>Add Follow-Up</h4>

            <input
                type="date"
                name="followup_date"
                value={formData.followup_date}
                onChange={handleChange}
                required
            /><br />

            <textarea
                name="notes"
                placeholder="Follow-up notes"
                value={formData.notes}
                onChange={handleChange}
                required
            /><br />

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Add Follow-Up'}
            </button>
            {onCancel && (
                <button type="button" onClick={onCancel} style={{ marginLeft: '0.5rem' }}>
                    Cancel
                </button>
            )}
        </form>
    );
};

export default FollowUpForm;
