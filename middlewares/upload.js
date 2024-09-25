import multer from "multer";

/* 
Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files. It is written on top of busboy for maximum efficiency.
*/

const upload = multer({
    storage : multer.memoryStorage(),
    limits : {fileSize : 1024 * 1024 * 50}
});

export default upload