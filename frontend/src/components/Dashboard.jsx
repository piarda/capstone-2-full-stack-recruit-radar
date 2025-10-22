import React, {useEffect, useState } from 'react';
import CandidateCard from './CandidateCard';
import CandidateForm from './CandidateForm';
import { fetchCandidates, getAllFollowUps, archiveCandidate } from '../services/api';

const Dashboard = () => {
    const [candidates, setCandidates] = useState([]);
    const [followUps, setFollowups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 3000);

        return () => clearTimeout(handler);
    }, [searchTerm]);

    const loadCandidates = async () => {
        try {
            const data = await fetchCandidates(page, 10, debouncedSearch);
            setCandidates(data.candidates);
            setTotalPages(data.pages);
            setPage(data.current_page);
        } catch (err) {
            console.error('Failed to load candidates', err);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true)
                await loadCandidates();
                const followUpData = await getAllFollowUps();
                setFollowups(followUpData);
            } catch (err) {
                console.error('Failed to load data', err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [page, debouncedSearch]);

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
            <h1>Active Candidates</h1>

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
                    const candidateFollowUps = followUps.filter(f => f.candidate_id === candidate.id);

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
