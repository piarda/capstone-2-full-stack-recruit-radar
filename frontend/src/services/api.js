const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5050/api';

export async function fetchCandidates(page = 1, perPage = 10, search = '') {
    const params = new URLSearchParams({
        page,
        per_page: perPage,
    });

    if (search) {
        params.append('search', search);
    }

    const res = await fetch(`${BASE_URL}/candidates/?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch candidates');
    return res.json();
}

export async function createCandidate(candidateData) {
    const res = await fetch(`${BASE_URL}/candidates/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidateData),
    });
    if (!res.ok) throw new Error('Failed to create candidate');
    return res.json();
}

export async function archiveCandidate(id) {
    const res = await fetch(`${BASE_URL}/candidates/${id}/archive`, { method: 'PUT' });
    if (!res.ok) throw new Error('Failed to archive candidate');
    return res.json();
}

export async function unarchiveCandidate(id) {
    const res = await fetch(`${BASE_URL}/candidates/${id}/unarchive`, { method: 'PUT' });
    if (!res.ok) throw new Error('Failed to unarchive candidate');
    return res.json();
}

export async function getArchivedCandidates() {
    const res = await fetch(`${BASE_URL}/candidates/archived`);
    if (!res.ok) throw new Error('Failed to fetch archived candidates');
    return res.json();
}

export async function createFollowUp(data) {
    const res = await fetch(`${BASE_URL}/followups/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create follow-up');
    return res.json();
}

export async function getDueFollowUps() {
    const res = await fetch(`${BASE_URL}/followups/due`);
    if (!res.ok) throw new Error('Failed to fetch due follow-ups');
    return res.json();
}

export async function completeFollowUp(id, status = 'completed') {
    const res = await fetch(`${BASE_URL}/followups/${id}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
    });

    if (!res.ok) throw new Error('Failed to update follow-up');
    return res.json();
}

export async function updateFollowUp(id, data) {
    const res = await fetch(`${BASE_URL}/followups/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update follow-up');
    }

    return res.json();
}

export async function deleteFollowUp(id) {
    const res = await fetch(`${BASE_URL}/followups/${id}`, {
        method: 'DELETE',
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to delete follow-up');
    }

    return res.json();
}

export async function getAllFollowUps() {
    const res = await fetch(`${BASE_URL}/followups/`);
    if (!res.ok) throw new Error('Failed to fetch follow-ups');
    return res.json();
}

export async function updateCandidate(id, updatedData) {
    const res = await fetch(`${BASE_URL}/candidates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
    });
    if (!res.ok) throw new Error('Failed to update candidate');
    return res.json();
}

export const updateCandidateStage = async (id, stage) => {
    const res = await fetch(`${BASE_URL}/candidates/${id}/stage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage })
    });

    if (!res.ok) throw new Error('Failed to update stage');
    return res.json();
};
