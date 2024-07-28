import multer from "multer";

const upload = multer({
    storage : multer.memoryStorage(),
    limits : {fileSize : 1024 * 1024 * 50}
});

export default upload