const express = require("express");
const { engine } = require("express-handlebars");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");
const path = require("path");

const authRoutes = require("./routes/auth");
const spotRoutes = require("./routes/spots");
const adminSpotRoutes = require("./routes/adminSpots");
const userRoutes = require("./routes/users");
const favoriteRoutes = require("./routes/favorites");

const app = express();
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/Group15_Project";

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

app.use("/auth", authRoutes);
app.use("/spots", spotRoutes);
app.use("/admin/spots", adminSpotRoutes);
app.use("/users", userRoutes);
app.use("/favorites", favoriteRoutes);

app.use((_req, res) => {
  res.status(404).render("error", { title: "Not Found", error: "Page not found." });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
