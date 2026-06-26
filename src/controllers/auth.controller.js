const prisma = require('../client');
const logger = require('../logger');
const { hashPassword, comparePassword } = require('../utils/passwords');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../utils/tokens');

const REFRESH_COOKIE = 'refreshToken';
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    createdAt: user.createdAt,
  };
}

function setRefreshCookie(res, token) {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: REFRESH_COOKIE_MAX_AGE,
    path: '/auth',
  });
}

async function issueTokens(user, res) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  await prisma.refreshToken.create({
    data: { token: refreshToken, userId: user.id },
  });
  setRefreshCookie(res, refreshToken);
  return { accessToken, refreshToken };
}

exports.register = async (req, res, next) => {
  try {
    const { username, name, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { username: username.trim() } });
    if (existing) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { username: username.trim(), name: name?.trim() || null, password: passwordHash },
    });

    logger.info({ userId: user.id, username: user.username }, 'User registered');
    const tokens = await issueTokens(user, res);

    return res.status(201).json({ user: publicUser(user), ...tokens });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    logger.info({ userId: user.id, username: user.username }, 'User logged in');
    const tokens = await issueTokens(user, res);

    return res.status(200).json({ user: publicUser(user), ...tokens });
  } catch (err) {
    next(err);
  }
};

exports.refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];

    if (!token) {
      return res.status(401).json({ error: 'Refresh token missing' });
    }

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored) {
      return res.status(401).json({ error: 'Refresh token not recognized' });
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    await prisma.refreshToken.delete({ where: { id: stored.id } });
    const tokens = await issueTokens(user, res);

    logger.info({ userId: user.id }, 'Token refreshed');
    return res.status(200).json(tokens);
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (token) {
      await prisma.refreshToken.deleteMany({ where: { token } });
    }
    res.clearCookie(REFRESH_COOKIE, { path: '/auth' });
    logger.info('User logged out');
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    return res.status(200).json(publicUser(req.user));
  } catch (err) {
    next(err);
  }
};

module.exports = exports;
