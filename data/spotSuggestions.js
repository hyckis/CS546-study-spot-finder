import { ObjectId } from "mongodb";
import { spotSuggestions } from "../config/mongoCollections.js";

export const createSpotSuggestion = async (suggestionData) => {
  const col = await spotSuggestions();

  const newSuggestion = {
    ...suggestionData,
    status: "Pending",
    reviewedBy: null,
    reviewNotes: "",
    reviewedAt: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await col.insertOne(newSuggestion);

  if (!result.acknowledged || !result.insertedId) {
    throw new Error("Could not create spot suggestion");
  }

  return {
    ...newSuggestion,
    _id: result.insertedId.toString()
  };
};

export const getSpotSuggestionById = async (id) => {
  if (!ObjectId.isValid(id)) throw new Error("Invalid suggestion id");

  const col = await spotSuggestions();

  return await col.findOne({
    _id: new ObjectId(id)
  });
};