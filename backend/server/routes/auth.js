/**
 * server/routes/auth.js
 * POST /api/auth/register
 * POST /api/auth/login
 * POST /api/auth/invite      — owner/editor creates an invite link
 * GET  /api/auth/invites    — list pending invites sent by this user
 * POST /api/auth/accept     — accept an invite (sets inviteeId + creates user link)
 * GET  /api/auth/me         — get current user info
 */
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { authenticate, requireRole } from '../middleware/auth.js';
import prisma from '../../lib/prisma.js';

const router = express.Router();
const JWT_SECRET  = process.env.JWT_SECRET || 'secret-change-in-production';
const INVITE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'name, email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email already registered.' });

    const hash   = await bcrypt.hash(password, 10);
    const user   = await prisma.user.create({
      data: { email, password: hash, name, role: 'editor' },
    });
    const token  = signToken({ id: user.id, email: user.email, role: user.role });

    return res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    console.error('[POST /api/auth/register]', err);
    return res.status(500).json({ message: 'Registration failed.' });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email and password are required.' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials.' });

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return res.status(200).json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    console.error('[POST /api/auth/login]', err);
    return res.status(500).json({ message: 'Login failed.' });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    return res.status(200).json(user);
  } catch (err) {
    console.error('[GET /api/auth/me]', err);
    return res.status(500).json({ message: 'Failed to fetch user.' });
  }
});

// ── POST /api/auth/invite ────────────────────────────────────────────────────
router.post('/invite', authenticate, requireRole('owner', 'editor'), async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email || !role) return res.status(400).json({ message: 'email and role are required.' });
    if (!['editor', 'viewer'].includes(role)) return res.status(400).json({ message: 'Role must be "editor" or "viewer".' });

    // Check if email already registered
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ message: 'This email is already registered.' });

    // Check for existing pending invite
    const pending = await prisma.invitation.findFirst({
      where: { email, accepted: false, expiresAt: { gt: new Date() } },
    });
    if (pending) return res.status(409).json({ message: 'An invite for this email is already pending.' });

    const token = crypto.randomBytes(32).toString('hex');
    const invitation = await prisma.invitation.create({
      data: {
        token,
        email,
        role,
        invitedById: req.user.id,
        expiresAt: new Date(Date.now() + INVITE_TTL),
      },
    });

    const inviteLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/accept-invite?token=${token}`;
    return res.status(201).json({ inviteLink, invitationId: invitation.id });
  } catch (err) {
    console.error('[POST /api/auth/invite]', err);
    return res.status(500).json({ message: 'Failed to create invitation.' });
  }
});

// ── GET /api/auth/invites ─────────────────────────────────────────────────────
router.get('/invites', authenticate, requireRole('owner', 'editor'), async (req, res) => {
  try {
    const invites = await prisma.invitation.findMany({
      where: { invitedById: req.user.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, role: true, accepted: true, expiresAt: true, createdAt: true },
    });
    return res.status(200).json(invites);
  } catch (err) {
    console.error('[GET /api/auth/invites]', err);
    return res.status(500).json({ message: 'Failed to fetch invites.' });
  }
});

// ── POST /api/auth/accept ────────────────────────────────────────────────────
// Register a new user and attach them to the invitation
router.post('/accept', async (req, res) => {
  try {
    const { token, name, password } = req.body;
    if (!token || !name || !password) return res.status(400).json({ message: 'token, name and password are required.' });

    const invitation = await prisma.invitation.findUnique({ where: { token } });
    if (!invitation) return res.status(404).json({ message: 'Invitation not found.' });
    if (invitation.accepted) return res.status(409).json({ message: 'Invitation already accepted.' });
    if (invitation.expiresAt < new Date()) return res.status(410).json({ message: 'Invitation has expired.' });

    const existing = await prisma.user.findUnique({ where: { email: invitation.email } });
    if (existing) return res.status(409).json({ message: 'Email already registered.' });

    const hash = await bcrypt.hash(password, 10);
    const user  = await prisma.user.create({
      data: { email: invitation.email, password: hash, name, role: invitation.role },
    });

    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { accepted: true, inviteeId: user.id },
    });

    const token_ = signToken({ id: user.id, email: user.email, role: user.role });
    return res.status(201).json({ token: token_, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    console.error('[POST /api/auth/accept]', err);
    return res.status(500).json({ message: 'Failed to accept invitation.' });
  }
});

// ── DELETE /api/auth/invite/:id ───────────────────────────────────────────────
router.delete('/invite/:id', authenticate, requireRole('owner', 'editor'), async (req, res) => {
  try {
    const invite = await prisma.invitation.findUnique({ where: { id: req.params.id } });
    if (!invite) return res.status(404).json({ message: 'Invitation not found.' });
    if (invite.invitedById !== req.user.id) return res.status(403).json({ message: 'Not your invitation.' });
    await prisma.invitation.delete({ where: { id: req.params.id } });
    return res.status(200).json({ message: 'Invitation cancelled.' });
  } catch (err) {
    console.error('[DELETE /api/auth/invite]', err);
    return res.status(500).json({ message: 'Failed to cancel invitation.' });
  }
});

export default router;
