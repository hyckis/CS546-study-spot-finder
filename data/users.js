import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import { users } from "../config/mongoCollections.js";

export const getUserByEmail = async (email) => {
  if (!email || typeof email !== "string") return null;
  const userCollection = await users();
  return await userCollection.findOne({
    email: email.trim().toLowerCase()
  });
};

export const getUserById = async (id) => {
  if (!ObjectId.isValid(id)) throw new Error("Invalid user id");
  const userCollection = await users();
  return await userCollection.findOne({ _id: new ObjectId(id) });
};

export const createUser = async ({
  username,
  email,
  password,
  firstName = "",
  lastName = "",
  major = "",
  role = "user"
}) => {
  if (!username || typeof username !== "string") throw new Error("Username is required");
  if (!email || typeof email !== "string") throw new Error("Email is required");
  if (!password || typeof password !== "string") throw new Error("Password is required");
  const userCollection = await users();
  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = {
    username: username.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    major: major.trim(),
    role,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  const insertInfo = await userCollection.insertOne(newUser);
  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    throw new Error("Could not create user");
  }
  return { _id: insertInfo.insertedId, ...newUser };
};

export const comparePassword = async (password, passwordHash) => {
  return await bcrypt.compare(password, passwordHash);
};

export const updateUser = async (id, updateData) => {
  if (!ObjectId.isValid(id)) throw new Error("Invalid user id");
  const userCollection = await users();
  const updateInfo = await userCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...updateData, updatedAt: new Date() } }
  );
  if (updateInfo.matchedCount === 0) throw new Error("User not found");
  return await getUserById(id);
};

export const deleteUser = async (id) => {
  if (!ObjectId.isValid(id)) throw new Error("Invalid user id");
  const userCollection = await users();
  const deleteInfo = await userCollection.deleteOne({ _id: new ObjectId(id) });
  if (deleteInfo.deletedCount === 0) throw new Error("User not found");
  return true;
};

export const changePassword = async (id, currentPassword, newPassword) => {
  if (!ObjectId.isValid(id)) throw new Error("Invalid user id");
  if (!currentPassword || !newPassword) throw new Error("Both current and new password are required");
  const userCollection = await users();
  const user = await userCollection.findOne({ _id: new ObjectId(id) });
  if (!user) throw new Error("User not found");
  const match = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!match) throw new Error("Current password is incorrect");
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await userCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { passwordHash, updatedAt: new Date() } }
  );
  return true;
};