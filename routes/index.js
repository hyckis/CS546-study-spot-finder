import authRoutes from './auth_routes.js';
import sessionsRoutes from './sessions.js';

const constructorMethod = (app) => {
  app.use('/', authRoutes);
  app.use('/sessions', sessionsRoutes);

  app.use((req, res) => {
    res.status(404).render('error', { error: 'Page not found' });
  });
};

export default constructorMethod;