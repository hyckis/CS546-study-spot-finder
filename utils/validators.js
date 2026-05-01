import { ObjectId } from 'mongodb';

export const checkId = (id, varName = 'id') => {
  if (!id) throw `${varName} must be provided`;
  if (typeof id !== 'string') throw `${varName} must be a string`;

  id = id.trim();
  if (id.length === 0) throw `${varName} cannot be empty`;

  if (!ObjectId.isValid(id)) throw `${varName} is not a valid ObjectId`;

  return id;
};

export const checkString = (str, varName = 'string') => {
  if (!str) throw `${varName} must be provided`;
  if (typeof str !== 'string') throw `${varName} must be a string`;

  str = str.trim();
  if (str.length === 0) throw `${varName} cannot be empty`;

  return str;
};

export const checkCourse = (course) => {
  course = checkString(course, 'course');

  if (course.length < 1 || course.length > 100) {
    throw 'course must be between 1 and 100 characters';
  }

  return course;
};

export const checkTopic = (topic) => {
  topic = checkString(topic, 'topic');

  if (topic.length < 1 || topic.length > 100) {
    throw 'topic must be between 1 and 100 characters';
  }

  return topic;
};

export const checkGroupSize = (size) => {
  if (size === undefined || size === null) {
    throw 'groupSize must be provided';
  }

  size = Number(size);

  if (isNaN(size)) {
    throw 'groupSize must be a number';
  }

  if (!Number.isInteger(size)) {
    throw 'groupSize must be an integer';
  }

  if (size < 1 || size > 20) {
    throw 'groupSize must be between 1 and 20';
  }

  return size;
};

export const checkDate = (dateStr) => {
  dateStr = checkString(dateStr, 'sessionTime');

  const date = new Date(dateStr);

  if (isNaN(date.getTime())) {
    throw 'sessionTime must be a valid date';
  }

  const now = new Date();
  if (date < now) {
    throw 'sessionTime must be in the future';
  }

  return date;
};

export const checkSessionStatus = (status) => {
  const validStatuses = ['Open', 'Full', 'Closed'];

  if (!validStatuses.includes(status)) {
    throw 'Invalid session status';
  }

  return status;
};