export const checkId = (id, name) => {
    if (!id || typeof id !== 'string' || ObjectId.isValid(id.trim()))
        throw `${name} must be a valid ObjectId`;
    return id.trim();
};