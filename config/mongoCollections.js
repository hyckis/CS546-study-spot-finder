import {dbConnection} from './mongoConnection.js';

const getCollectionFn = (collection) => {
  let _col = undefined;
  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }
    return _col;
  };
};

export const users = getCollectionFn('users');
export const spots = getCollectionFn('spots');
export const studySpots = getCollectionFn('spots');
export const spotSuggestions = getCollectionFn('spotsuggestions');
export const reports = getCollectionFn('reports');
export const sessions = getCollectionFn('sessions');
export const reviews = getCollectionFn('reviews');
export const favorites = getCollectionFn('favorites');
