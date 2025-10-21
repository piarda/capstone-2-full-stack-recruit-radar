const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5050/api';

export async function fetchCandidates() {
    const res = await fetch(`${BASE_URL}/candidates/`);
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

export async function completeFollowUp(id) {
  const res = await fetch(`${BASE_URL}/followups/${id}/complete`, { method: 'PUT' });
  if (!res.ok) throw new Error('Failed to complete follow-up');
  return res.json();
}

export async function getAllFollowUps() {
  const res = await fetch(`${BASE_URL}/followups/`);
  if (!res.ok) throw new Error('Failed to fetch follow-ups');
  return res.json();
}
