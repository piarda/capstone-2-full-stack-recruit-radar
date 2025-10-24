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
        <div className="candidate-card">
            <div className="card-grid-layout">
                <div className="card-info-section">
                    {isEditingCandidate ? (
                        <>
                            <input type="text" name="name" className="input-field mb-2" value={candidateData.name} onChange={handleCandidateChange} placeholder="Name" />
                            {candidateErrors.name && <div style={{ color: 'red', fontSize: '0.85rem' }}>{candidateErrors.name}</div>}
                            <input type="email" name="email" className="input-field mb-2" value={candidateData.email} onChange={handleCandidateChange} placeholder="Email" />
                            {candidateErrors.email && <div style={{ color: 'red', fontSize: '0.85rem' }}>{candidateErrors.email}</div>}
                            <input type="tel" name="phone" className="input-field mb-2" value={candidateData.phone} onChange={handleCandidateChange} placeholder="Phone" />
                            <textarea name="notes" className="input-field mb-2" value={candidateData.notes} onChange={handleCandidateChange} placeholder="Notes" rows={3} />
                            <div className="flex gap-2 mt-2">
                                <button onClick={saveCandidate} className="btn-primary text-sm px-3 py-1">Save</button>
                                <button onClick={cancelCandidateEdit} className="btn-secondary text-sm px-3 py-1">Cancel</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="card-title">{candidate.name || 'N/A'}</div>
                            <div className="card-contact-row">
                                <span className="card-info-item"><strong>Email:</strong> {candidate.email || 'N/A'}</span>
                                <span className="card-info-item"><strong>Phone:</strong> {candidate.phone || 'N/A'}</span>
                            </div>
                            <div className="notes-preview">
                                <strong>Notes: </strong> 
                                <span className="text-sm text-gray-600 italic">
                                    {candidate.notes ? (candidate.notes.substring(0, 1000)) : 'No notes added.'}
                                </span>
                            </div>
                            <button onClick={() => setIsEditingCandidate(true)} className="btn-secondary text-xs px-2 py-1 mt-2">Edit Info</button>
                        </>
                    )}
                </div>
                <div className="card-stage-section">
                    <label className="text-xs font-semibold block mb-1">Stage</label>
                    <select value={stage} onChange={handleStageChange} className="input-field text-sm p-1.5">
                        {stageOptions.map(option => <option key={option} value={option}>{option}</option>)}
                    </select>
                </div>

                <div className="card-followup-section">
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-semibold">Follow-Ups </label>
                        {!showFollowUpForm && editingFollowUpId === null && (
                            <button onClick={() => setShowFollowUpForm(true)} className="btn-secondary text-xs px-2 py-1">
                                + Add
                            </button>
                        )}
                    </div>
                    
                    {showFollowUpForm && editingFollowUpId === null && (
                        <FollowUpForm
                            followUp={followUpForm}
                            onChange={handleFollowUpChange}
                            onSave={addFollowUp}
                            onCancel={() => setShowFollowUpForm(false)}
                        />
                    )}

                    <ul className="followup-list">
                        {[...followUps]
                            .sort((a,b) => new Date(a.followup_date) - new Date(b.followup_date))
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
                                    <div className="flex items-center justify-between text-xs py-1">
                                        <label className="flex items-center cursor-pointer">
                                            <input type="checkbox" className="mr-2" checked={fup.status === 'completed'} onChange={() => toggleFollowUpComplete(fup.id, fup.status)} />
                                            <span 
                                                className="followup-item" 
                                                style={{ 
                                                    textDecoration: fup.status === 'completed' ? 'line-through' : 'none', 
                                                    color: fup.status === 'completed' ? '#888' : '#000' 
                                                }}
                                            >
                                                {formatDate(fup.followup_date)} – {fup.notes || 'No notes'}
                                            </span>
                                        </label>
                                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                                            <button 
                                                onClick={() => startEditingFollowUp(fup)} 
                                                style={{ color: '#3b82f6', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>Edit</button>
                                            <button 
                                                onClick={() => deleteFollowUpById(fup.id)} 
                                                style={{ color: '#ef4444', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>Delete</button>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="card-actions">
                <button title="Archive" onClick={() => onArchive(candidate.id)} className="text-gray-500 hover:text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8.25V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8.25M18.75 8.25H5.25A2.25 2.25 0 0 1 3 6V3.75A2.25 2.25 0 0 1 5.25 1.5h13.5A2.25 2.25 0 0 1 21 3.75V6a2.25 2.25 0 0 1-2.25 2.25Z"></path><path d="M12 17.25h.001"></path><path d="M10.5 17.25h3"></path><path d="M10.5 13.5h3"></path></svg>
                </button>
            </div>
        </div>
    );
};

export default CandidateCard;
