import { api } from '../lib/api';
export const createListing = body => api('/api/listings', { method: 'POST', body: JSON.stringify(body) });
export const listListings = q => api(`/api/listings${q ? '?q='+encodeURIComponent(q) : ''}`);