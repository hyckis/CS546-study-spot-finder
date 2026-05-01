import { Router } from 'express';
import {
  createStatusReport,
  createClosureReport,
  getActiveStatusReportsBySpotId,
  getAggregatedStatus,
  getPendingClosureReports,
  resolveClosureReport
} from '../data/reports.js';

const router = Router();

const requireLogin = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).render('error', {
      title: 'Unauthorized',
      error: 'You must be logged in to perform this action.'
    });
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.session || !req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).render('error', {
      title: 'Forbidden',
      error: 'Admin access required.'
    });
  }
  next();
};

// Create real-time status report
router.post('/spots/:spotId/status', requireLogin, async (req, res) => {
  try {
    const { spotId } = req.params;
    const { wifiStatus, socketStatus, crowdednessStatus } = req.body;
    const userId = req.session.user._id;

    await createStatusReport(
      spotId,
      userId,
      wifiStatus,
      socketStatus,
      crowdednessStatus
    );

    return res.redirect(`/spots/${spotId}`);
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Report Error',
      error: e
    });
  }
});

// Create closure report
router.post('/spots/:spotId/closure', requireLogin, async (req, res) => {
  try {
    const { spotId } = req.params;
    const userId = req.session.user._id;

    await createClosureReport(spotId, userId);

    return res.redirect(`/spots/${spotId}`);
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Closure Report Error',
      error: e
    });
  }
});

// Get active reports as JSON, useful for AJAX
router.get('/spots/:spotId/active', async (req, res) => {
  try {
    const activeReports = await getActiveStatusReportsBySpotId(req.params.spotId);
    return res.json(activeReports);
  } catch (e) {
    return res.status(400).json({ error: e });
  }
});

// Get aggregated status as JSON, useful for AJAX
router.get('/spots/:spotId/summary', async (req, res) => {
  try {
    const summary = await getAggregatedStatusBySpotId(req.params.spotId);
    return res.json(summary);
  } catch (e) {
    return res.status(400).json({ error: e });
  }
});

// Admin page / route for pending closure reports
router.get('/admin/closures', requireAdmin, async (req, res) => {
  try {
    const pendingReports = await getPendingClosureReports();

    return res.render('reports/adminClosures', {
      title: 'Pending Closure Reports',
      pendingReports
    });
  } catch (e) {
    return res.status(500).render('error', {
      title: 'Admin Report Error',
      error: e
    });
  }
});

// Admin resolves closure report
router.post('/admin/closures/:reportId/resolve', requireAdmin, async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status } = req.body;
    const adminId = req.session.user._id;

    await resolveClosureReport(reportId, adminId, status);

    return res.redirect('/reports/admin/closures');
  } catch (e) {
    return res.status(400).render('error', {
      title: 'Resolve Report Error',
      error: e
    });
  }
});

export default router;