"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const imageProcessor_1 = require("../utils/imageProcessor");
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
const imagesFolder = path_1.default.resolve(__dirname, '../../images');
const uploadsFolder = path_1.default.resolve(__dirname, '../../uploads');
// Multer setup for uploading only jpg files
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsFolder);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg') {
        cb(null, true);
    }
    else {
        cb(new Error('Only JPG files are allowed!'));
    }
};
const upload = (0, multer_1.default)({ storage, fileFilter });
// GET /api/images?filename=xxx&width=xxx&height=xxx
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filename = req.query.filename;
    const width = parseInt(req.query.width);
    const height = parseInt(req.query.height);
    // Validate inputs
    if (!filename || !width || !height || width <= 0 || height <= 0) {
        res.status(400).send('Missing or invalid filename, width, or height');
        return;
    }
    // Check if original image exists
    const originalImagePath = path_1.default.join(imagesFolder, filename);
    if (!fs_1.default.existsSync(originalImagePath)) {
        res.status(404).send('Original image does not exist');
        return;
    }
    // Construct resized image path
    const resizedImageName = `${path_1.default.parse(filename).name}_${width}x${height}${path_1.default.extname(filename)}`;
    const resizedImagePath = path_1.default.join(imagesFolder, resizedImageName);
    // If resized image already exists, serve it
    if (fs_1.default.existsSync(resizedImagePath)) {
        res.sendFile(resizedImagePath);
        return;
    }
    try {
        // Resize and save image
        yield (0, imageProcessor_1.resizeImage)(originalImagePath, resizedImagePath, width, height);
        res.sendFile(resizedImagePath);
    }
    catch (error) {
        console.error(error);
        res.status(500).send('Failed to process image');
    }
}));
// POST /api/images/upload
router.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        res.status(400).send('No file uploaded or invalid file type.');
        return;
    }
    // Move the uploaded file to images folder (overwrite if exists)
    const oldPath = path_1.default.join(uploadsFolder, req.file.filename);
    const newPath = path_1.default.join(imagesFolder, req.file.filename);
    fs_1.default.rename(oldPath, newPath, (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error saving the uploaded image');
            return;
        }
        res.status(200).send('Image uploaded successfully');
    });
});
exports.default = router;
