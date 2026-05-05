import authRoutes from "./auth.js";
import spotRoutes from "./spots.js";
import adminSpotRoutes from "./adminSpots.js";
import favoriteRoutes from "./favorites.js";
import userRoutes from "./users.js";
import reportRoutes from "./reports.js";
import sessionRoutes from "./sessions.js";

const constructorMethod = (app) => {
  app.get("/", (req, res) => {
    res.render("home", {title: "Spot Scouter"});
  });
  app.use("/auth", authRoutes);
  app.use("/spots", spotRoutes);
  app.use("/admin/spots", adminSpotRoutes);
  app.use("/favorites", favoriteRoutes);
  app.use("/users", userRoutes);
  app.use("/reports", reportRoutes);
  app.use("/sessions", sessionRoutes);

  app.use('*', (req, res) => {
    res.status(404).render('error', {
      title: '404', 
      error: 'Page not found'
    });
  });
};

export default constructorMethod;