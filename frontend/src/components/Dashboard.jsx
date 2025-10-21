import React, {useEffect, useState } from 'react';
import CandidateCard from './CandidateCard';
import CandidateForm from './CandidateForm';
import { fetchCandidates, getAllFollowUps } from '../services/api';

const Dashboard = () => {
    const [candidates, setCandidates] = useState([]);
    const [followUps, setFollowups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [candidateData, followUpData] = await Promise.all([
                    fetchCandidates(),
                    getAllFollowUps()
                ]);
                setCandidates(candidateData);
                setFollowups(followUpData);
            } catch (err) {
                console.error('Failed to load data', err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const handleAddCandidate = (newCandidate) => {
        setCandidates(prev => [...prev, newCandidate]);
        setShowForm(false);
    };

    const filteredCandidates = candidates.filter(candidate =>
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

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

            <button onClick={() => setShowForm(prev => !prev)}>
                {showForm ? 'Hide Form' : 'Add New Candidate'}
            </button>

            {showForm && (
                <CandidateForm onAdd={handleAddCandidate} onCancel={() => setShowForm(false)} />
            )}

            {filteredCandidates.length === 0 ? (
                <p>No candidates found.</p>
            ) : (
                filteredCandidates.map(candidate => {
                    const candidateFollowUps = followUps.filter(f => f.candidate_id === candidate.id);

                    return (
                        <CandidateCard
                            key={candidate.id}
                            candidate={candidate}
                            followUps={candidateFollowUps}
                        />
                    );
                })
            )}
        </div>
    );
};

export default Dashboard;
