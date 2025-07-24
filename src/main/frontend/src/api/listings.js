import api from '../lib/api';
export const createListing = body => api.post('/listings', body);
export const listListings = q => api.get(`/listings${q ? '?q='+encodeURIComponent(q) : ''}`);