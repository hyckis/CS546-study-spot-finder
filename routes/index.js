import authRoutes = from './auth_routes.js';
import spotRoutes = from './spots.js';
import reportRoutes = from './reports.js';
import sessionRoutes = from './sessions.js';

const constructorMethod = (app) => {
  app.use('/', authRoutes);
  app.use('/sessions', sessionsRoutes);

  app.use('*', (req, res) => {
    res.status(404).render('error', {
      title: '404', 
      error: 'Page not found'
    });
  });
};

export default constructorMethod;