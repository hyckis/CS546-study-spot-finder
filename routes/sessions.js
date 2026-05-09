import { Router } from "express";
import { getUserById } from "../data/users.js";

import {
  createSession,
  getSessionById,
  requestToJoin,
  approveRequest,
  rejectRequest,
  searchSessions,
  matchSessions,
  getSessionsForUser,
  quitSession,
  disbandSession,
  inviteUser,
  acceptInvitation,
  declineInvitation
} from "../data/sessions.js";

const router = Router();

router.get("/current", async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "Not logged in." });
  }

  try {
    const user = await getUserById(req.session.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const { passwordHash, hashedPassword, ...safeUser } = user;
    return res.json(safeUser);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err.toString() });
  }
});

router
  .route("/create")
  .get(async (req, res) => {
    if (!req.session || !req.session.userId) {
      return res.redirect("/auth/login");
    }

    return res.render("sessions/create");
  })
  .post(async (req, res) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        error: "You must be logged in to create a session"
      });
    }

    const creatorId = req.session.userId;
    const { spotId, course, topic, sessionTime, groupSize } = req.body;

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
  .route("/search")
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

    let userMajor = "";

    if (req.session && req.session.userId) {
      try {
        const user = await getUserById(req.session.userId);

        if (user && user.major) {
          userMajor = user.major;
        }
      } catch (e) {
        console.log(e);
      }
    }

    return res.render("sessions/search", {
      userMajor
    });
  });

router.route("/manage").get(async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.redirect("/auth/login");
  }

  return res.render("sessions/manage");
});

router.route("/manage/data").get(async (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "You must be logged in" });
  }

  try {
    const data = await getSessionsForUser(req.session.userId);
    return res.status(200).json(data);
  } catch (e) {
    console.log(e);
    return res.status(400).json({ error: e.toString() });
  }
});

router.route("/match").post(async (req, res) => {
  const { user } = req.body;

  try {
    const results = await matchSessions(user);
    return res.status(200).json(results);
  } catch (e) {
    console.log(e);
    return res.status(400).json({ error: e.toString() });
  }
});

router.route("/:id").get(async (req, res) => {
  const sessionId = req.params.id;

  try {
    const session = await getSessionById(sessionId);
    return res.status(200).json(session);
  } catch (e) {
    console.log(e);
    return res.status(400).json({ error: e.toString() });
  }
});

router.route("/:id/join").post(async (req, res) => {
  const sessionId = req.params.id;

  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      error: "You must be logged in to join a session"
    });
  }

  const userId = req.session.userId;

  try {
    const result = await requestToJoin(sessionId, userId);
    return res.status(200).json(result);
  } catch (e) {
    console.log(e);
    return res.status(400).json({ error: e.toString() });
  }
});

router.route("/:id/approve").post(async (req, res) => {
  const sessionId = req.params.id;
  const { userId } = req.body;

  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      error: "You must be logged in to approve a request"
    });
  }

  try {
    const result = await approveRequest(sessionId, userId);
    return res.status(200).json(result);
  } catch (e) {
    console.log(e);
    return res.status(400).json({ error: e.toString() });
  }
});

router.route("/:id/reject").post(async (req, res) => {
  const sessionId = req.params.id;
  const { userId } = req.body;

  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      error: "You must be logged in to reject a request"
    });
  }

  try {
    const result = await rejectRequest(sessionId, userId);
    return res.status(200).json(result);
  } catch (e) {
    console.log(e);
    return res.status(400).json({ error: e.toString() });
  }
});

router.route("/:id/quit").post(async (req, res) => {
  const sessionId = req.params.id;

  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "You must be logged in" });
  }

  try {
    const result = await quitSession(sessionId, req.session.userId);
    return res.status(200).json(result);
  } catch (e) {
    console.log(e);
    return res.status(400).json({ error: e.toString() });
  }
});

router.route("/:id/disband").post(async (req, res) => {
  const sessionId = req.params.id;

  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "You must be logged in" });
  }

  try {
    const result = await disbandSession(sessionId, req.session.userId);
    return res.status(200).json(result);
  } catch (e) {
    console.log(e);
    return res.status(400).json({ error: e.toString() });
  }
});

router.route("/:id/invite").post(async (req, res) => {
  const sessionId = req.params.id;
  const { invitedEmail } = req.body;

  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "You must be logged in" });
  }

  try {
    const result = await inviteUser(
      sessionId,
      req.session.userId,
      invitedEmail
    );

    return res.status(200).json(result);
  } catch (e) {
    console.log(e);
    return res.status(400).json({ error: e.toString() });
  }
});

router.route("/:id/invite/accept").post(async (req, res) => {
  const sessionId = req.params.id;

  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "You must be logged in" });
  }

  try {
    const result = await acceptInvitation(sessionId, req.session.userId);
    return res.status(200).json(result);
  } catch (e) {
    console.log(e);
    return res.status(400).json({ error: e.toString() });
  }
});

router.route("/:id/invite/decline").post(async (req, res) => {
  const sessionId = req.params.id;

  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "You must be logged in" });
  }

  try {
    const result = await declineInvitation(sessionId, req.session.userId);
    return res.status(200).json(result);
  } catch (e) {
    console.log(e);
    return res.status(400).json({ error: e.toString() });
  }
});

export default router;