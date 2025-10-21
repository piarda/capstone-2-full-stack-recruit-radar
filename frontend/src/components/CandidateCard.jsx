import React, { useState } from 'react';
import FollowUpForm from './FollowUpForm';

const CandidateCard = ({ candidate, followUps }) => {
    const [showFollowUpForm, setShowFollowUpForm] = useState(false);

    return (
        <div className="candidate-card" style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
            <h3>{candidate.name}</h3>
            <p>{candidate.email}</p>
            <p>{candidate.phone}</p>
            <p>{candidate.notes}</p>

            <button onClick={() => setShowFollowUpForm(prev => !prev)}>
                {showFollowUpForm ? 'Cancel Follow-Up' : '+ Add Follow-Up'}
            </button>

            {showFollowUpForm && (
                <FollowUpForm
                    candidateId={candidate.id}
                    onSuccess={() => setShowFollowUpForm(false)}
                    onCancel={() => setShowFollowUpForm(false)}
                />
            )}

            <h4>Follow-Ups</h4>
            {followUps.length === 0 ? (
                <p>No follow-ups yet.</p>
            ) : (
                <ul>
                    {followUps.map(fup => (
                        <li key={fup.id}>
                            {new Date(fup.due_date).toLocaleDateString()} - {fup.notes}
                            {fup.completed ? ' ✅' : ''}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CandidateCard;
