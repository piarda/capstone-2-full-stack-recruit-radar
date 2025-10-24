import React, { useEffect, useState } from 'react';
import { getArchivedCandidates, unarchiveCandidate } from '../services/api';

const ArchivedPage = () => {
    const [archived, setArchived] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getArchivedCandidates()
            .then(data => setArchived(data))
            .catch(err => console.error('Failed to fetch archived candidates', err))
            .finally(() => setLoading(false));
    }, []);

    const handleUnarchive = async (id) => {
        try {
            await unarchiveCandidate(id);
            setArchived(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            console.error('Failed to unarchive candidate', err);
        }
    };

    if (loading) return <p>Loading archived candidates...</p>;

    return (
        <div>
            <h2>Archived Candidates</h2>
            {archived.length === 0 ? (
                <p>No archived candidates.</p>
            ) : (
                <ul>
                {[...archived]
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map(candidate => (
                        <li key={candidate.id} style={{ marginBottom: '1rem' }}>
                        <strong>{candidate.name}</strong> — {candidate.email}
                        <button
                            style={{ marginLeft: '1rem' }}
                            onClick={() => handleUnarchive(candidate.id)}
                        >
                            Unarchive
                        </button>
                    </li>
                ))}
                </ul>
            )}
        </div>
    );
};

export default ArchivedPage;
