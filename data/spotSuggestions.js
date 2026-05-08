import { ObjectId } from "mongodb";
import { spotSuggestions } from "../config/mongoCollections.js";
import { checkId } from "../helpers.js";

const mapSuggestion = (suggestion) => {
  if (!suggestion) return null;
  const status = suggestion.status || "Pending";
  return {
    ...suggestion,
    status,
    _id: suggestion._id.toString(),
    submittedBy: suggestion.submittedBy ? suggestion.submittedBy.toString() : null,
    reviewedBy: suggestion.reviewedBy ? suggestion.reviewedBy.toString() : null,
    createdSpotId: suggestion.createdSpotId ? suggestion.createdSpotId.toString() : null,
    isPending: status === "Pending",
    isApproved: status === "Approved",
    isDenied: status === "Denied"
  };
};

export const createSpotSuggestion = async (suggestionData) => {
  const col = await spotSuggestions();

  const newSuggestion = {
    ...suggestionData,
    status: "Pending",
    reviewedBy: null,
    reviewNotes: "",
    reviewedAt: null,
    createdSpotId: null,
    submittedAt: new Date(),
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
  id = checkId(id, "Suggestion id");
  const col = await spotSuggestions();
  const suggestion = await col.findOne({ _id: new ObjectId(id) });
  return mapSuggestion(suggestion);
};

export const getAllSpotSuggestions = async () => {
  const col = await spotSuggestions();
  const list = await col.find({}).sort({ createdAt: -1 }).toArray();
  return list.map(mapSuggestion);
};

export const updateSpotSuggestionReview = async (id, reviewData) => {
  id = checkId(id, "Suggestion id");
  const col = await spotSuggestions();

  const updateInfo = await col.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...reviewData,
        updatedAt: new Date()
      }
    }
  );

  if (updateInfo.matchedCount === 0) {
    throw new Error("Spot suggestion not found");
  }

  return await getSpotSuggestionById(id);
};
