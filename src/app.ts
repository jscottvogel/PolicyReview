
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import devRouter from './routes/dev';
import documentsRouter from './routes/documents';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api/dev', devRouter);
app.use('/api/documents', documentsRouter);

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

export default app;
