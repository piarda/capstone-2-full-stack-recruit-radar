import React from 'react';

const FollowUpForm = ({ followUp, onChange, onSave, onCancel }) => {
    return (
        <div style={{ marginBottom: '0.5rem' }}>
            <input
                type="date"
                name="followup_date"
                value={followUp.followup_date}
                onChange={onChange}
                style={{ marginRight: '0.5rem' }}
            />
            <input
                type="text"
                name="notes"
                value={followUp.notes}
                onChange={onChange}
                placeholder="Notes"
                style={{ marginRight: '0.5rem' }}
            />
            <select
                name="status"
                value={followUp.status}
                onChange={onChange}
                style={{ marginRight: '0.5rem' }}
            >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
            </select>
            <button onClick={onSave} style={{ marginRight: '0.25rem' }}>Save</button>
            <button onClick={onCancel}>Cancel</button>
        </div>
    );
};

export default FollowUpForm;
