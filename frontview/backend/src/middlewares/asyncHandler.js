// middlewares/asyncHandler.js

// Ye function ek dusre function (fn) ko as argument leta hai
const asyncHandler = (fn) => (req, res, next) => {
    // Ye 'fn' ko chalata hai, aur agar koi error aaye (catch), toh use 'next(err)' ke throw global error handler ko pass kar deta hai
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;