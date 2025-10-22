import React, { useState } from 'react';
import FollowUpForm from './FollowUpForm';
import { completeFollowUp } from '../services/api';
import { archiveCandidate } from '../services/api';
import { updateCandidateStage } from '../services/api';

const stageOptions = ['Sourcing', 'Application', 'Phone Screen', 'Interviewing', 'Offer', 'Hired', 'Rejected'];

const CandidateCard = ({ candidate, followUps: initialFollowUps, onArchive }) => {
    const [showFollowUpForm, setShowFollowUpForm] = useState(false);
    const [followUps, setFollowUps] = useState(initialFollowUps || []);

    const handleToggleComplete = async (id, currentStatus) => {
        const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
        try {
            const updated = await completeFollowUp(id, newStatus);
            setFollowUps(prev =>
                prev.map(fup =>
                    fup.id === id ? { ...fup, status: updated.status } : fup
                )
            );
        } catch (err) {
            console.error('Failed to update follow-up', err);
        }
    };

    const [stage, setStage] = useState(candidate.stage || 'Applied');

    const handleStageChange = async (e) => {
        const newStage = e.target.value;
        try {
            await updateCandidateStage(candidate.id, newStage);
            setStage(newStage);
        } catch (err) {
            console.error('Failed to update stage', err);
        }
    };

    return (
        <div className="candidate-card" style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
            <h3>{candidate.name}</h3>
            <p>{candidate.email}</p>
            <p>{candidate.phone}</p>
            <p>{candidate.notes}</p>

            <label>
                Stage:{' '}
                <select value={stage} onChange={handleStageChange}>
                    {stageOptions.map(option => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            </label>

            <button style={{ marginTop: '0.5rem' }} onClick={() => onArchive(candidate.id)}>
                Archive
            </button>

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
                    {[...followUps]
                        .sort((a, b) => new Date(a.followup_date) - new Date(b.followup_date))
                        .map(fup => (
                            <li key={fup.id}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={fup.status === 'completed'}
                                        onChange={() => handleToggleComplete(fup.id, fup.status)}
                                        style={{ marginRight: '0.5rem' }}
                                    />
                                    <span style={{
                                        textDecoration: fup.status === 'completed' ? 'line-through' : 'none',
                                        color: fup.status === 'completed' ? '#888' : '#000'
                                    }}>
                                        {new Date(fup.followup_date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })} – {fup.notes}
                                    </span>
                                </label>
                            </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CandidateCard;
