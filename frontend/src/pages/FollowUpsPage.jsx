import React, { useEffect, useState } from 'react';
import { getDueFollowUps, completeFollowUp } from '../services/api';

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

    const groupFollowUps = (followUps) => {
        const groups = {
            today: [],
            tomorrow: [],
            thisWeek: [],
            upcoming: [],
            pastDue: []
        };

        const normalize = (d) => {
            if (!(d instanceof Date)) return null;
            const n = new Date(d.getFullYear(), d.getMonth(), d.getDate());
            return n;
        };

        const today = normalize(new Date());
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + (7 - today.getDay()));

        followUps.forEach(fup => {
            const fDate = normalize(parseLocalDate(fup.followup_date));
            if (!fDate) return;

            if (fDate < today) groups.pastDue.push(fup);
            else if (fDate.getTime() === today.getTime()) groups.today.push(fup);
            else if (fDate.getTime() === tomorrow.getTime()) groups.tomorrow.push(fup);
            else if (fDate <= endOfWeek) groups.thisWeek.push(fup);
            else groups.upcoming.push(fup);
        });

        return groups;
    };

    const renderGroup = (title, items) => (
        <div style={{ marginBottom: '2rem' }}>
        <h3>{title}</h3>
        {items.length === 0 ? (
            <p style={{ color: '#777', fontStyle: 'italic' }}>No follow-ups in this section.</p>
        ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
            {items
                .sort((a, b) => parseLocalDate(a.followup_date) - parseLocalDate(b.followup_date))
                .map(fup => (
                <li key={fup.id} style={{ marginBottom: '1rem' }}>
                    <div style={{ textDecoration: fup.status === 'completed' ? 'line-through' : 'none' }}>
                    <strong>{formatDate(fup.followup_date)}</strong> – {fup.notes}
                    <br />
                    <small>
                        Candidate: {fup.candidate_name
                        ? `${fup.candidate_name} - ${fup.candidate_stage || 'No stage'}`
                        : `ID: ${fup.candidate_id}`}
                    </small>
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
        )}
        </div>
    );

    if (loading) return <p>Loading follow-ups...</p>;
    if (followUps.length === 0) return <p>No upcoming follow-ups</p>;

    const groups = groupFollowUps(followUps);

    return (
        <div style={{ padding: '1rem' }}>
            <h2>Due Follow-Ups</h2>
            {renderGroup('⚠️ Past Due', groups.pastDue)}
            {renderGroup('📅 Today', groups.today)}
            {renderGroup('🕑 Tomorrow', groups.tomorrow)}
            {renderGroup('📆 Later This Week', groups.thisWeek)}
            {renderGroup('📆 Upcoming', groups.upcoming)}
        </div>
    );
};

export default FollowUpsPage;
