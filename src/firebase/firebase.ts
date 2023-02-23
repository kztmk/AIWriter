import { getAnalytics } from 'firebase/analytics';
import { getDatabase } from 'firebase/database';
import app from '../main';

export const analytics = getAnalytics(app);
export const db = getDatabase(app);
