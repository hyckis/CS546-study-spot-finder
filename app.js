import express from "express";
import { engine } from "express-handlebars";
import session from "express-session";
import MongoStore from "connect-mongo";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

import configRoutes from "./routes/index.js";

import authRoutes = from "./routes/auth";
import spotRoutes = from "./routes/spots";
import adminSpotRoutes = from "./routes/adminSpots";
import userRoutes = from "./routes/users";
import favoriteRoutes = from "./routes/favorites";

const app = express();
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/Group15_Project";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.engine("handlebars", engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "changethislater",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: MONGO_URI }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
  })
);

app.use((req, res, next) => {
  res.locals.userId = req.session.userId || null;
  res.locals.username = req.session.username || null;
  res.locals.userRole = req.session.userRole || null;
  res.locals.isAdmin = req.session.userRole === "admin";
  next();
});

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (_req, res) => {
  res.render("home", { title: "Home" });
});

app.use('/public', express.static('public'));
app.use("/auth", authRoutes);
app.use("/spots", spotRoutes);
app.use("/admin/spots", adminSpotRoutes);
app.use("/users", userRoutes);
app.use("/favorites", favoriteRoutes);

app.use((_req, res) => {
  res.status(404).render("error", { title: "Not Found", error: "Page not found." });
});

app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

configRoutes(app);
app.listen(3000, () => {
  console.log("We've now got a server!");
});