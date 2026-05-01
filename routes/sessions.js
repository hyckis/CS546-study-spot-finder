import { Router } from 'express';
import User from '../models/User.js';

import {
  createSession,
  requestToJoin,
  approveRequest,
  rejectRequest,
  searchSessions,
  matchSessions
} from '../data/sessions.js';

const router = Router();

router.get("/current", async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "Not logged in." });
  }

  try {
    const user = await User.findById(req.session.userId).select("-passwordHash");

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    return res.json(user);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router
  .route('/create')
  .get(async (req, res) => {
    return res.render('sessions/create');
  })
  .post(async (req, res) => {
    const { creatorId, spotId, course, topic, sessionTime, groupSize } = req.body;

    try {
      const newSession = await createSession(
        creatorId,
        spotId,
        course,
        topic,
        sessionTime,
        groupSize
      );
      return res.status(200).json(newSession);
    } catch (e) {
      console.log(e);
      return res.status(400).json({ error: e.toString() });
    }
  });

router
  .route('/search')
  .get(async (req, res) => {
    if (Object.keys(req.query).length > 0) {
      try {
        const results = await searchSessions(req.query);
        return res.status(200).json(results);
      } catch (e) {
        console.log(e);
        return res.status(400).json({ error: e.toString() });
      }
    }

    return res.render('sessions/search');
  });

router.route('/:id/join').post(async (req, res) => {
  const sessionId = req.params.id;
  const { userId } = req.body;

  try {
    const result = await requestToJoin(sessionId, userId);
    return res.status(200).json(result);
  } catch (e) {
    console.log(e);
    return res.status(400).json({ error: e.toString() });
  }
});

router.route('/:id/approve').post(async (req, res) => {
  const sessionId = req.params.id;
  const { userId } = req.body;

  try {
    const result = await approveRequest(sessionId, userId);
    return res.status(200).json(result);
  } catch (e) {
    console.log(e);
    return res.status(400).json({ error: e.toString() });
  }
});

router.route('/:id/reject').post(async (req, res) => {
  const sessionId = req.params.id;
  const { userId } = req.body;

  try {
    const result = await rejectRequest(sessionId, userId);
    return res.status(200).json(result);
  } catch (e) {
    console.log(e);
    return res.status(400).json({ error: e.toString() });
  }
});

router.route('/match').post(async (req, res) => {
  const { user } = req.body;

  try {
    const results = await matchSessions(user);
    return res.status(200).json(results);
  } catch (e) {
    console.log(e);
    return res.status(400).json({ error: e.toString() });
  }
});

export default router;
