/* Shared reviews store — localStorage bridge between MarketPage and Landing
   NOTE: replace localStorage calls with real API (GET/POST /api/v1/reviews)
   once the backend module is deployed. */

const KEY = 'vexio_user_reviews';

const AVATAR_COLORS = [
  '#8b5cf6', '#2563FF', '#ec4899', '#10b981',
  '#f59e0b', '#ef4444', '#06b6d4', '#84cc16',
];

function pickColor(name) {
  return AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
}

function readStored() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Returns all user-submitted reviews (newest first) */
export function getUserReviews() {
  return readStored();
}

/** True if this userId already submitted a review */
export function hasUserAlreadyReviewed(userId) {
  if (!userId) return false;
  return readStored().some((r) => r.userId === userId);
}

/** Persists a new review and returns the full review object */
export function addUserReview({ userId, name, email, rating, text }) {
  const review = {
    id: `u-${Date.now()}`,
    userId,
    name: name.trim(),
    email: email || '',
    initials: name.trim().slice(0, 2).toUpperCase(),
    avatarColor: pickColor(name.trim()),
    rating,
    text: text.trim(),
    date: 'ahora mismo',
    likes: 0,
    isUserReview: true,
  };
  try {
    const current = readStored();
    const updated = [review, ...current].slice(0, 50);
    localStorage.setItem(KEY, JSON.stringify(updated));
  } catch {
    /* silently fail — review still returned for immediate UI update */
  }
  return review;
}
