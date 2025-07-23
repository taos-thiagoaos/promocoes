import { getSession } from 'next-auth/react';
import allowedEmails from '../../data/allowed-emails.json';

export const isUserAllowed = async (req) => {
  const session = await getSession({ req });
  if (!session || !session.user || !session.user.email) {
    return false;
  }

  return allowedEmails.includes(session.user.email);
};

export const withAllowedUsers = (handler) => async (req, res) => {
  const allowed = await isUserAllowed(req);
  if (!allowed) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  return handler(req, res);
};
