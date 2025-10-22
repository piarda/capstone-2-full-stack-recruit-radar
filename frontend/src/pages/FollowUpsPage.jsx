import React, { useEffect, useState } from 'react';
import { getDueFollowUps, completeFollowUp } from '../services/api';

const FollowUpsPage = () => {
    const [followUps, setFollowUps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFollowUps();
    }, []);

    const loadFollowUps = async () => {
        setLoading(true);
        try {
            const data = await getDueFollowUps();
            setFollowUps(data);
        } catch (err) {
            console.error('Failed to fetch due follow-ups:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleComplete = async (id, currentStatus) => {
        try {
            await completeFollowUp(id);
            setFollowUps(prev =>
                prev.map(fup =>
                    fup.id === id
                    ? { ...fup, status: currentStatus === 'completed' ? 'pending' : 'completed' }
                    : fup
                )
            );
        } catch (err) {
            console.error('Failed to toggle completion', err);
        }
    };

    if (loading) return <p>Loading follow-ups...</p>;

    if (followUps.length === 0) return <p>No upcoming follow-ups 🎉</p>;

    return (
        <div style={{ padding: '1rem' }}>
            <h2>Due Follow-Ups</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
                {followUps
                    .sort((a, b) => new Date(a.followup_date) - new Date(b.followup_date))
                    .map(fup => (
                        <li key={fup.id} style={{ marginBottom: '1rem' }}>
                            <div style={{ textDecoration: fup.status === 'completed' ? 'line-through' : 'none' }}>
                                <strong>{new Date(fup.followup_date).toLocaleDateString()}</strong> – {fup.notes}
                                <br />
                                <small>Candidate ID: {fup.candidate_id}</small>
                            </div>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={fup.status === 'completed'}
                                    onChange={() => handleToggleComplete(fup.id, fup.status)}
                                    style={{ marginRight: '0.5rem' }}
                                />
                                Mark as {fup.status === 'completed' ? 'pending' : 'completed'}
                            </label>
                        </li>
                    ))}
            </ul>
        </div>
    );
};

export default FollowUpsPage;
