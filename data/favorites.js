import { ObjectId } from "mongodb";
import { favorites, spots } from "../config/mongoCollections.js";

const checkId = (id, name) => {
  if (!id || typeof id !== "string" || !ObjectId.isValid(id.trim())) {
    throw new Error(`${name} must be a valid ObjectId`);
  }
  return id.trim();
};

export const addFavorite = async (userId, spotId) => {
  userId = checkId(userId, "userId");
  spotId = checkId(spotId, "spotId");

  const favoriteCollection = await favorites();

  await favoriteCollection.updateOne(
    {
      userId: new ObjectId(userId),
      spotId: new ObjectId(spotId)
    },
    {
      $setOnInsert: {
        userId: new ObjectId(userId),
        spotId: new ObjectId(spotId),
        createdAt: new Date()
      }
    },
    { upsert: true }
  );

  return true;
};

export const removeFavorite = async (userId, spotId) => {
  userId = checkId(userId, "userId");
  spotId = checkId(spotId, "spotId");

  const favoriteCollection = await favorites();

  await favoriteCollection.deleteOne({
    userId: new ObjectId(userId),
    spotId: new ObjectId(spotId)
  });

  return true;
};

export const getFavoritesByUserId = async (userId) => {
  userId = checkId(userId, "userId");

  const favoriteCollection = await favorites();
  const spotCollection = await spots();

  const favs = await favoriteCollection
    .find({ userId: new ObjectId(userId) })
    .toArray();

  const spotIds = favs.map((fav) => fav.spotId);

  if (spotIds.length === 0) return [];

  return await spotCollection
    .find({ _id: { $in: spotIds } })
    .toArray();
};