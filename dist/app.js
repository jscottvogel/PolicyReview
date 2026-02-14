"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dev_1 = __importDefault(require("./routes/dev"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Mount the dev routes
// The endpoint requested is POST /api/dev/create-test-data
app.use('/api/dev', dev_1.default);
app.get('/', (req, res) => {
    res.send('PolicyReview API Service');
});
// Only start listening if this file is main, to allow testing/requiring
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
}
exports.default = app;
