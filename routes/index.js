const authRoutes = require('./auth_routes');
const spotRoutes = require('./spots');
const reportRoutes = require('./reports');
const sessionRoutes = require('./sessions');

const constructorMethod = (app) => {
  app.use('/auth', authRoutes);
  app.use('/spots', spotRoutes);
  app.use('/reports', reportRoutes);
  app.use('/sessions', sessionRoutes);

  app.use('*', (req, res) => {
    res.status(404).render('error');
  });
};

module.exports = constructorMethod;