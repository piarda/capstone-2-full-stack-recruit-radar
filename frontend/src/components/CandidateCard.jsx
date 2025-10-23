import React, { useState } from 'react';
import {
    updateCandidate,
    updateCandidateStage,
    createFollowUp,
    updateFollowUp,
    deleteFollowUp,
    completeFollowUp
} from '../services/api';
import FollowUpForm from './FollowUpForm';

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${month}/${day}/${year}`;
};

const CandidateCard = ({ candidate, followUps: initialFollowUps = [], onArchive }) => {
    const [isEditingCandidate, setIsEditingCandidate] = useState(false);
    const [candidateData, setCandidateData] = useState({ ...candidate });
    const [candidateErrors, setCandidateErrors] = useState({});
    const [stage, setStage] = useState(candidate.stage || 'Applied');

    const [followUps, setFollowUps] = useState(initialFollowUps);
    const [editingFollowUpId, setEditingFollowUpId] = useState(null);
    const [followUpForm, setFollowUpForm] = useState({ notes: '', followup_date: '', status: 'pending' });
    const [showFollowUpForm, setShowFollowUpForm] = useState(false);

    const stageOptions = ['Sourcing', 'Application', 'Phone Screen', 'Interviewing', 'Offer', 'Hired', 'Rejected'];

    const validateCandidate = () => {
        const errors = {};
        if (!candidateData.name.trim()) errors.name = 'Name is required';
        if (candidateData.email && !/^\S+@\S+\.\S+$/.test(candidateData.email)) errors.email = 'Email is invalid';
        setCandidateErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCandidateChange = (e) => {
        const { name, value } = e.target;
        setCandidateData(prev => ({ ...prev, [name]: value }));
    };

    const saveCandidate = async () => {
        if (!validateCandidate()) return;
        const updated = await updateCandidate(candidate.id, candidateData);
        Object.assign(candidate, updated);
        setIsEditingCandidate(false);
    };

    const cancelCandidateEdit = () => {
        setIsEditingCandidate(false);
        setCandidateData({ ...candidate });
    };

    const handleStageChange = async (e) => {
        const newStage = e.target.value;
        await updateCandidateStage(candidate.id, newStage);
        setStage(newStage);
    };

    const handleFollowUpChange = (e) => {
        const { name, value } = e.target;
        setFollowUpForm(prev => ({ ...prev, [name]: value }));
    };

    const addFollowUp = async () => {
        const newFup = await createFollowUp({ candidate_id: candidate.id, ...followUpForm });
        const newFupWithDate = { ...newFup, formatted_date: formatDate(newFup.followup_date) };
        setFollowUps(prev => [...prev, newFupWithDate]);
        setFollowUpForm({ notes: '', followup_date: '', status: 'pending' });
        setShowFollowUpForm(false);
    };

    const startEditingFollowUp = (fup) => {
        setEditingFollowUpId(fup.id);
        setFollowUpForm({ notes: fup.notes, followup_date: fup.followup_date, status: fup.status });
    };

    const saveFollowUpEdit = async (id) => {
        const updated = await updateFollowUp(id, followUpForm);
        const updatedWithDate = { ...updated, formatted_date: formatDate(updated.followup_date) };
        setFollowUps(prev => prev.map(fup => fup.id === id ? updatedWithDate : fup));
        setEditingFollowUpId(null);
        setFollowUpForm({ notes: '', followup_date: '', status: 'pending' });
    };


    const cancelFollowUpEdit = () => {
        setEditingFollowUpId(null);
        setFollowUpForm({ notes: '', followup_date: '', status: 'pending' });
    };

    const deleteFollowUpById = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        await deleteFollowUp(id);
        setFollowUps(prev => prev.filter(fup => fup.id !== id));
    };

    const toggleFollowUpComplete = async (id, currentStatus) => {
        const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
        const updated = await completeFollowUp(id, newStatus);
        setFollowUps(prev => prev.map(fup => fup.id === id ? { ...fup, status: updated.status } : fup));
    };

    return (
        <div className="candidate-card" style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
            {isEditingCandidate ? (
                <>
                    <input type="text" name="name" value={candidateData.name} onChange={handleCandidateChange} placeholder="Name" />
                    {candidateErrors.name && <div style={{ color: 'red' }}>{candidateErrors.name}</div>}
                    <input type="email" name="email" value={candidateData.email} onChange={handleCandidateChange} placeholder="Email" />
                    {candidateErrors.email && <div style={{ color: 'red' }}>{candidateErrors.email}</div>}
                    <input type="tel" name="phone" value={candidateData.phone} onChange={handleCandidateChange} placeholder="Phone" />
                    <textarea name="notes" value={candidateData.notes} onChange={handleCandidateChange} placeholder="Notes" rows={3} />
                    <button onClick={saveCandidate}>Save</button>
                    <button onClick={cancelCandidateEdit}>Cancel</button>
                </>
            ) : (
                <>
                    <h3>{candidate.name}</h3>
                    <p>Email: {candidate.email}</p>
                    <p>Phone: {candidate.phone}</p>
                    <p>Notes: {candidate.notes}</p>
                    <button onClick={() => setIsEditingCandidate(true)}>Edit</button>
                </>
            )}

            <label>
                Stage:
                <select value={stage} onChange={handleStageChange}>
                    {stageOptions.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
            </label>

            <h4>Follow-Ups</h4>
            {followUps.length === 0 && <p>No follow-ups yet.</p>}
            <ul>
                {[...followUps].sort((a,b) => new Date(a.followup_date) - new Date(b.followup_date))
                    .map(fup => (
                    <li key={fup.id}>
                        {editingFollowUpId === fup.id ? (
                            <FollowUpForm
                                followUp={followUpForm}
                                onChange={handleFollowUpChange}
                                onSave={() => saveFollowUpEdit(fup.id)}
                                onCancel={cancelFollowUpEdit}
                            />
                        ) : (
                            <div>
                                <label>
                                    <input type="checkbox" checked={fup.status === 'completed'} onChange={() => toggleFollowUpComplete(fup.id, fup.status)} />
                                    <span style={{ textDecoration: fup.status === 'completed' ? 'line-through' : 'none', color: fup.status === 'completed' ? '#888' : '#000' }}>
                                        {fup.formatted_date} – {fup.notes}
                                    </span>
                                </label>
                                <button onClick={() => startEditingFollowUp(fup)}>Edit</button>
                                <button onClick={() => deleteFollowUpById(fup.id)}>Delete</button>
                            </div>
                        )}
                    </li>
                ))}
            </ul>

            {showFollowUpForm && editingFollowUpId === null ? (
                <FollowUpForm
                    followUp={followUpForm}
                    onChange={handleFollowUpChange}
                    onSave={addFollowUp}
                    onCancel={() => setShowFollowUpForm(false)}
                />
            ) : (
                <button onClick={() => setShowFollowUpForm(true)}>+ Add Follow-Up</button>
            )}

            <br />
            <button style={{ marginTop: '0.5rem' }} onClick={() => onArchive(candidate.id)}>Archive</button>
        </div>
    );
};

export default CandidateCard;
