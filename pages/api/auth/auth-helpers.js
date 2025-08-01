import { getServerSession } from 'next-auth';
import { authOptions } from "@/pages/api/auth/[...nextauth]";

const allowedEmails = process.env.ADMIN_USERS ? process.env.ADMIN_USERS.split(',') : [];

export const isUserAllowed = async (req, res) => {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user || !session.user.email) {
    return false;
  }

  return userIsAdmin(session.user);
};

export const userIsAdmin = (user) => {
  return allowedEmails.includes(user.email);
};

export const withAllowedUsers = (handler) => async (req, res) => {
  const allowed = await isUserAllowed(req, res);
  if (!allowed) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  return handler(req, res);
};
