import {ObjectId} from 'mongodb';

export const checkId = (id, name) => {
    if (!id || typeof id !== 'string') throw `${name} must be a valid ObjectId`;
    const trimmed = id.trim();
    if (!ObjectId.isValid(trimmed)) throw `${name} is not a valid ObjectId`;
    //if (String(new ObjectId(trimmed)) !== trimmed) throw `${name} is not a valid ObjectId`;
    return trimmed;
};

export const checkReportId = (id, name) => {
  if (!id) throw `${name} is missing`;
  const trimmed = id.toString().trim();
  if (!ObjectId.isValid(trimmed)) throw `${name} is not a valid ObjectId`;
  return trimmed;
};

