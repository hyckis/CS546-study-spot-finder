import { ObjectId } from "mongodb";
import { spots } from "../config/mongoCollections.js";
import { checkId } from "../helpers.js";

export const getAllSpots = async () => {
  const spotCollection = await spots();
  const spotList = await spotCollection.find({}).sort({ name: 1 }).toArray();
  const mapped = spotList.map((spot) => ({
    ...spot,
    _id: spot._id.toString()
  }));
  return mapped;
};

export const getSpotById = async (id) => {
  id = checkId(id);
  const spotCollection = await spots();
  const spot = await spotCollection.findOne({ _id: new ObjectId(id) });
  if (!spot) return null;
  return {
    ...spot,
    _id: spot._id.toString()
  };
};

export const createSpot = async (spotData) => {
  const spotCollection = await spots();

  const newSpot = {
    ...spotData,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const insertInfo = await spotCollection.insertOne(newSpot);

  if (!insertInfo.acknowledged || !insertInfo.insertedId) throw new Error("Could not create study spot");

  return {
    ...newSpot,
    _id: insertInfo.insertedId.toString()
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
