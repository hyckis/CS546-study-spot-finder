const authRoutes = require('./auth_routes.js');
const spotRoutes = require('./spots.js');
const reportRoutes = require('./reports.js');
const sessionRoutes = require('./sessions.js');

const constructorMethod = (app) => {
  app.use('/auth', authRoutes);
  app.use('/spots', spotRoutes);
  app.use('/reports', reportRoutes);
  app.use('/sessions', sessionRoutes);

  app.use('*', (req, res) => {
    res.status(404).render('error', {
      title: '404', 
      error: 'Page not found'
    });
  });
};

module.exports = constructorMethod;