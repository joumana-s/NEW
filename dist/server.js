"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const imageRoutes_1 = __importDefault(require("./routes/imageRoutes"));
const app = (0, express_1.default)();
const port = 3000;
// Serve frontend static files (adjust path to your frontend folder)
app.use(express_1.default.static(path_1.default.join(__dirname, '../../frontend')));
// Serve images folder for cached and uploaded images
app.use('/images', express_1.default.static(path_1.default.join(__dirname, '../images')));
// Parse JSON and urlencoded requests
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Image processing and upload routes
app.use('/api/images', imageRoutes_1.default);
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
