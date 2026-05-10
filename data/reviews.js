import { reviews, spots, users } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';
import { checkId } from '../helpers.js';

const checkInputReview = (rating, comment) => {
    rating = Number(rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) 
        throw 'Rating must be between 1 and 5';
    if (!comment || typeof comment !== "string" || !comment.trim())
        throw 'Comment cannot be empty';
};

const updateAvgRating = async(spotId) => {
    const reviewCollection = await reviews();
    const spotCollection = await spots();

    const allReviews = await reviewCollection.find({ 
        spotId: new ObjectId(spotId) 
    }).toArray();
    
    let avg = 0;
    if (allReviews.length === 0) avg = 0;
    else avg = allReviews.reduce((sum, r) => sum + Number(r.rating), 0) / allReviews.length;

    await spotCollection.updateOne(
        { _id: new ObjectId(spotId) },
        { $set: { averageRating: Number(avg.toFixed(2)) } }
    );
};

export const createReview = async(
    spotId, 
    userId, 
    rating, 
    comment
) => {
    if (!spotId || !userId || !rating) throw "Missing fields";
    
    spotId = checkId(spotId, "spotId");
    userId = checkId(userId, "userId");
    checkInputReview(rating, comment);

    const reviewCollection = await reviews();
    const existingReview = await reviewCollection.findOne({
        spotId: new ObjectId(spotId),
        userId: new ObjectId(userId)
    }); 
    if (existingReview) throw 'You have already submitted a review for this spot';

    const newReview = {
        spotId: new ObjectId(spotId),
        userId: new ObjectId(userId),
        rating: Number(rating),
        comment: comment || "",
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const insertInfo = await reviewCollection.insertOne(newReview);
    if (!insertInfo.acknowledged) throw "Review insert failed";
    
    await updateAvgRating(spotId);
    
    return {
        _id: insertInfo.insertedId.toString(),
        ...newReview
    };
};

export const getReviewsBySpotId = async(spotId) => {
    spotId = checkId(spotId, "spotId");

    const reviewCollection = await reviews();
    const userCollection = await users();
    const reviewList = await reviewCollection
    .find({
      spotId: new ObjectId(spotId)
    }).sort({ createdAt: -1 }).toArray();

    let result = [];

    for (const review of reviewList) {
        const user = await userCollection.findOne({ _id: review.userId });
        result.push({
           ...review,
            _id: review._id.toString(),
            spotId: review.spotId.toString(),
            userId: review.userId.toString(),
            username: user ? user.username : "Unknown User" 
        });
    }
    return result;
    //return await reviewList.map((review) => ({
      //  ...review,
      //  _id: review._id.toString(),
      //  spotId: review.spotId.toString(),
      //  userId: review.userId.toString()
    //}));
};

export const updateReview = async(reviewId, userId, rating, comment) => {
    reviewId = checkId(reviewId, "reviewId");
    userId = checkId(userId, "userId");
    checkInputReview(rating, comment);

    const reviewCollection = await reviews();
    const review = await reviewCollection.findOne({
        _id: new ObjectId(reviewId),
        userId: new ObjectId(userId)
    });
    if (!review) throw "Review not found or you are not allowed to edit it.";

    await reviewCollection.updateOne(
        { _id: new ObjectId(reviewId) },
        {
        $set: {
            rating,
            comment: comment.trim(),
            updatedAt: new Date()
          }
        }
    );

    await updateAvgRating(review.spotId.toString());
    return review.spotId.toString();
};

export const deleteReview = async(reviewId, userId) => {
    reviewId = checkId(reviewId, "reviewId");
    userId = checkId(userId, "userId");

    const reviewCollection = await reviews();
    const review = await reviewCollection.findOne({
        _id: new ObjectId(reviewId),
        userId: new ObjectId(userId)
    });
    if (!review) throw "Review not found or you are not allowed to delete it.";

    await reviewCollection.deleteOne({ _id: new ObjectId(reviewId) });
    await updateAvgRating(review.spotId.toString());
    return review.spotId.toString();    
};