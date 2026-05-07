import { sessions } from '../config/mongoCollections.js';
import { ObjectId } from 'mongodb';

import {
  checkId,
  checkCourse,
  checkTopic,
  checkDate,
  checkGroupSize
} from '../utils/validators.js';

export const createSession = async (
  creatorId,
  spotId,
  course,
  topic,
  sessionTime,
  groupSize
) => {
  creatorId = checkId(creatorId, 'creatorId');
  spotId = checkId(spotId, 'spotId');
  course = checkCourse(course);
  topic = checkTopic(topic);
  sessionTime = checkDate(sessionTime);
  groupSize = checkGroupSize(groupSize);

  const sessionCollection = await sessions();

  const newSession = {
    creatorId,
    spotId,
    course,
    topic,
    sessionTime,
    groupSize,
    approvedMemberIds: [],
    pendingMemberIds: [],
    status: 'Open',
    createdAt: new Date()
  };

  const insertInfo = await sessionCollection.insertOne(newSession);

  if (!insertInfo.acknowledged || !insertInfo.insertedId) {
    throw 'Could not create session';
  }

  const createdSession = await sessionCollection.findOne({
    _id: insertInfo.insertedId
  });

  return createdSession;
};

export const requestToJoin = async (sessionId, userId) => {
  sessionId = checkId(sessionId, 'sessionId');
  userId = checkId(userId, 'userId');

  const sessionCollection = await sessions();

  const session = await sessionCollection.findOne({
    _id: new ObjectId(sessionId)
  });

  if (!session) throw 'Session not found';

  if (session.creatorId === userId) {
    throw 'Creator cannot join their own session';
  }

  if (session.approvedMemberIds.includes(userId)) {
    throw 'User already approved in session';
  }

  if (session.pendingMemberIds.includes(userId)) {
    throw 'User already requested to join';
  }

  if (session.status !== 'Open') {
    throw 'Session is not open';
  }

  await sessionCollection.updateOne(
    { _id: new ObjectId(sessionId) },
    { $push: { pendingMemberIds: userId } }
  );

  return { message: 'Join request sent' };
};

export const approveRequest = async (sessionId, userId) => {
  sessionId = checkId(sessionId, 'sessionId');
  userId = checkId(userId, 'userId');

  const sessionCollection = await sessions();

  const session = await sessionCollection.findOne({
    _id: new ObjectId(sessionId)
  });

  if (!session) throw 'Session not found';

  if (!session.pendingMemberIds.includes(userId)) {
    throw 'User is not in pending list';
  }

  if (session.approvedMemberIds.length >= session.groupSize) {
    throw 'Session is already full';
  }

  await sessionCollection.updateOne(
    { _id: new ObjectId(sessionId) },
    {
      $pull: { pendingMemberIds: userId },
      $push: { approvedMemberIds: userId }
    }
  );

  const updatedSession = await sessionCollection.findOne({
    _id: new ObjectId(sessionId)
  });

  if (updatedSession.approvedMemberIds.length >= updatedSession.groupSize) {
    await sessionCollection.updateOne(
      { _id: new ObjectId(sessionId) },
      { $set: { status: 'Full' } }
    );
  }

  return { message: 'User approved' };
};

export const rejectRequest = async (sessionId, userId) => {
  sessionId = checkId(sessionId, 'sessionId');
  userId = checkId(userId, 'userId');

  const sessionCollection = await sessions();

  const session = await sessionCollection.findOne({
    _id: new ObjectId(sessionId)
  });

  if (!session) throw 'Session not found';

  if (!session.pendingMemberIds.includes(userId)) {
    throw 'User is not in pending list';
  }

  await sessionCollection.updateOne(
    { _id: new ObjectId(sessionId) },
    { $pull: { pendingMemberIds: userId } }
  );

  return { message: 'User rejected' };
};

export const searchSessions = async (filters = {}) => {
  const sessionCollection = await sessions();

  const query = {};

  if (filters.course) {
    const course = filters.course.trim();
    query.course = { $regex: course, $options: 'i' };
  }

  if (filters.topic) {
    const topic = filters.topic.trim();
    query.topic = { $regex: topic, $options: 'i' };
  }

  if (filters.spotId) {
    query.spotId = checkId(filters.spotId, 'spotId');
  }

  if (filters.openOnly === 'true') {
    query.status = 'Open';
  }

  const results = await sessionCollection.find(query).toArray();
  return results;
};

export const matchSessions = async (user) => {
  if (!user) throw 'User must be provided';

  const sessionCollection = await sessions();

  const userMajor = user.major ? user.major.trim() : '';
  const userInterests = user.interests ? user.interests : [];

  const query = { $or: [] };

  if (userMajor) {
    query.$or.push({
      course: { $regex: userMajor, $options: 'i' }
    });
  }

  if (userInterests.length > 0) {
    for (let interest of userInterests) {
      interest = interest.trim();
      if (interest.length > 0) {
        query.$or.push({
          topic: { $regex: interest, $options: 'i' }
        });
      }
    }
  }

  if (query.$or.length === 0) {
    return [];
  }

  const results = await sessionCollection.find(query).toArray();

  results.sort((a, b) => {
    return a.approvedMemberIds.length - b.approvedMemberIds.length;
  });

  return results;
};