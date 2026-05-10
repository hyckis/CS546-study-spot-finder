import { Router } from "express";
import { getUserById, updateUser, deleteUser, changePassword } from "../data/users.js";
import { getFavoritesByUserId } from "../data/favorites.js";
import requireAuth from "../middleware/requireAuth.js";

const router = Router();

router.get("/:id", async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) {
      return res.status(404).render("error", { title: "Not Found", error: "User not found." });
    }
    const isOwner = req.session.userId === user._id.toString();
    const { passwordHash, ...safeUser } = user;
    const favorites = await getFavoritesByUserId(user._id.toString());
    res.render("user/profile", {
      title: `${safeUser.username}'s Profile`,
      user: safeUser,
      isOwner,
      favorites
    });
  } catch (err) {
    res.render("error", { title: "Error", error: err.message || err });
  }
});

router.post("/:id", requireAuth, async (req, res) => {
  if (req.session.userId !== req.params.id) {
    return res.status(403).render("error", { title: "Forbidden", error: "You can only edit your own profile." });
  }
  const { username, email } = req.body;
  try {
    const updated = await updateUser(req.params.id, { username, email });
    req.session.username = updated.username;
    res.redirect(`/users/${req.params.id}`);
  } catch (err) {
    res.render("error", { title: "Error", error: err.message || err });
  }
});

router.post("/:id/password", requireAuth, async (req, res) => {
  if (req.session.userId !== req.params.id) {
    return res.status(403).render("error", { title: "Forbidden", error: "You can only change your own password." });
  }
  const { currentPassword, newPassword } = req.body;
  try {
    await changePassword(req.params.id, currentPassword, newPassword);
    res.redirect(`/users/${req.params.id}`);
  } catch (err) {
    res.render("error", { title: "Error", error: err.message || err });
  }
});

router.post("/:id/delete", requireAuth, async (req, res) => {
  if (req.session.userId !== req.params.id) {
    return res.status(403).render("error", { title: "Forbidden", error: "You can only delete your own account." });
  }
  try {
    await deleteUser(req.params.id);
    req.session.destroy(() => { res.redirect("/"); });
  } catch (err) {
    res.render("error", { title: "Error", error: err.message || err });
  }
});

export default router;