import { ObjectId } from "mongodb";
import { spots } from "../config/mongoCollections.js";

const checkId = (id) => {
  if (!id || typeof id !== "string" || !ObjectId.isValid(id.trim())) {
    throw new Error("Invalid spot id");
  }
  return id.trim();
};

export const getAllSpots = async () => {
  const spotCollection = await spots();
  return await spotCollection.find({}).sort({ name: 1 }).toArray();
};

export const getSpotById = async (id) => {
  id = checkId(id);
  const spotCollection = await spots();
  return await spotCollection.findOne({ _id: new ObjectId(id) });
};

export const createSpot = async (spotData) => {
  const spotCollection = await spots();

  const newSpot = {
    ...spotData,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const insertInfo = await spotCollection.insertOne(newSpot);

  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    throw new Error("Could not create study spot");
  }

  return {
    _id: insertInfo.insertedId.toString(),
    ...newSpot
  };
};

export const updateSpot = async (id, spotData) => {
  id = checkId(id);
  const spotCollection = await spots();

  const updateInfo = await spotCollection.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...spotData,
        updatedAt: new Date()
      }
    }
  );

  if (updateInfo.matchedCount === 0) {
    throw new Error("Study spot not found");
  }

  return true;
};

export const deleteSpot = async (id) => {
  id = checkId(id);
  const spotCollection = await spots();

  const deleteInfo = await spotCollection.deleteOne({
    _id: new ObjectId(id)
  });

  if (deleteInfo.deletedCount === 0) {
    throw new Error("Could not delete study spot");
  }

  return true;
};