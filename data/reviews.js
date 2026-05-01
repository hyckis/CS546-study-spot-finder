import {reviews} from '../config/mongoCollections.js';
import {ObjectId} from 'mongodb';

export const createReview = async(
    userId, 
    spotId, 
    rating, 
    comment
) => {
    if (!spotId || !userId || !rating) throw "Missing fields";

    const reviewCollection = await reviews();
    const newReview = {
        userId: new ObjectId(userId),
        spotId: new ObjectId(spotId),
        rating,
        comment: comment || "",
        createdAt: new Date()
    };

    const insertInfo = await reviewCollection.insertOne(newReview);
    if (!insertInfo.acknowledged) throw "Review insert failed";
    return insertInfo.insertedId; 
};

export const getReviewsBySpotId = async(spotId) => {
    const reviewCollection = await reviews();
    return await reviewCollection.find({
        spotId: new ObjectId(spotId)
    }).toArray();
};

export const updateReview = async(_id, userId, rating, comment) => {};

export const deleteReview = async(_id, userId) => {};