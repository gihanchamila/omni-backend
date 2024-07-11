export const notFound = (req, res, next) => {
    res.status(400).json({code : 404, status : false, message : "Api not found"})
}