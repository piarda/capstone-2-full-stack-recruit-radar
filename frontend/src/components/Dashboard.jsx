import React, {useEffect, useState } from 'react';
import CandidateCard from './CandidateCard';
import CandidateForm from './CandidateForm';
import { fetchCandidates, getAllFollowUps, archiveCandidate } from '../services/api';

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${month}/${day}/${year}`;
};

const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
};

const Dashboard = () => {
    const [candidates, setCandidates] = useState([]);
    const [followUps, setFollowups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        setPage(1);
    }, [searchTerm]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchCandidates(page, 10, searchTerm);
                setCandidates(data.candidates);
                setTotalPages(data.pages > 0 ? data.pages : 1);
                setPage(Math.min(data.current_page, data.pages > 0 ? data.pages : 1));

                const followUpData = await getAllFollowUps();
                setFollowups(followUpData);
            } catch (err) {
                console.error('Failed to load data', err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [page, searchTerm]);

    const handleAddCandidate = (newCandidate) => {
        setCandidates(prev => [...prev, newCandidate]);
        setShowForm(false);
    };

    const handleArchive = async (id) => {
        try {
            await archiveCandidate(id);
            setCandidates(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            console.error("Failed to archive candidate", err);
        }
    };

    if (loading) return <p>Loading candidates...</p>;

    return (
        <div>
            <h2>Active Candidates</h2>

            <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '0.5rem', marginBottom: '1rem', width: '100%' }}
            />

            <button onClick={() => setShowForm(prev => !prev)} style={{ marginBottom: '1rem' }}>
                {showForm ? 'Hide Form' : 'Add New Candidate'}
            </button>

            {showForm && (
                <CandidateForm onAdd={handleAddCandidate} onCancel={() => setShowForm(false)} />
            )}

            {candidates.length === 0 ? (
                <p>No candidates found.</p>
            ) : (
                candidates.map(candidate => {
                    const candidateFollowUps = followUps
                        .filter(f => f.candidate_id === candidate.id)
                        .sort((a, b) => parseLocalDate(a.followup_date) - parseLocalDate(b.followup_date))
                        .map(f => ({
                            ...f,
                            formatted_date: formatDate(f.followup_date),
                        }));

                    return (
                        <CandidateCard
                            key={candidate.id}
                            candidate={candidate}
                            followUps={candidateFollowUps}
                            onArchive={handleArchive}
                        />
                    );
                })
            )}

            <div style={{ marginTop: '2rem' }}>
                <button
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    style={{ marginRight: '1rem' }}
                >
                    Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button
                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    style={{ marginLeft: '1rem' }}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Dashboard;
