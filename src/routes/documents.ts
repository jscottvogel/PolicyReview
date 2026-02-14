
import { Router, Request, Response } from 'express';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

const router = Router();

// Initialize Clients (Reusing logic would be better, but keeping isolated for now)
const region = process.env.AWS_REGION || 'us-east-1';
const endpoint = process.env.AWS_ENDPOINT;
const clientConfig = { region, ...(endpoint && { endpoint }) };

const ddbClient = new DynamoDBClient(clientConfig);
const docClient = DynamoDBDocumentClient.from(ddbClient);
const s3Client = new S3Client({ ...clientConfig, forcePathStyle: !!endpoint });

const TABLE_DOCUMENTS = process.env.TABLE_DOCUMENTS || 'Documents';
const TABLE_FINDINGS = process.env.TABLE_FINDINGS || 'Findings';
const BUCKET_DATA = process.env.BUCKET_DATA || 'policy-review-data';

// Helper to stream S3 to string
const streamToString = (stream: Readable): Promise<string> =>
    new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    });

// GET /api/documents - List all documents
router.get('/', async (req: Request, res: Response) => {
    try {
        const command = new ScanCommand({
            TableName: TABLE_DOCUMENTS,
        });
        const result = await docClient.send(command);
        res.json(result.Items || []);
    } catch (error) {
        console.error("Error fetching documents:", error);
        res.status(500).json({ error: "Failed to list documents" });
    }
});

// GET /api/documents/:id - Get single document metadata
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const command = new GetCommand({
            TableName: TABLE_DOCUMENTS,
            Key: { id }
        });
        const result = await docClient.send(command);
        if (!result.Item) {
            res.status(404).json({ error: "Document not found" });
            return;
        }
        res.json(result.Item);
    } catch (error) {
        console.error("Error fetching document:", error);
        res.status(500).json({ error: "Failed to fetch document" });
    }
});

// GET /api/documents/:id/findings - Get findings for a document
router.get('/:id/findings', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        // In a real app, you'd likely map over all findings or have a GSI on docId.
        // For this simple setup, we'll scan and filter (inefficient) OR assume GSI exists.
        // Given the setup-localstack.ts didn't make a GSI, we start with Scan with Filter.
        // Production note: MUST switch to Query with Index.

        // Attempting Query if we assume Schema was tailored, otherwise Scan:
        const command = new ScanCommand({
            TableName: TABLE_FINDINGS,
            FilterExpression: "docId = :docId",
            ExpressionAttributeValues: { ":docId": id }
        });

        const result = await docClient.send(command);
        res.json(result.Items || []);
    } catch (error) {
        console.error("Error fetching findings:", error);
        res.status(500).json({ error: "Failed to fetch findings" });
    }
});

// GET /api/documents/:id/blocks | GET /api/documents/:id/report
// Generic S3 file retriever
router.get('/:id/:type', async (req: Request, res: Response) => {
    try {
        const { id, type } = req.params;
        if (type !== 'blocks' && type !== 'report') {
            res.status(400).json({ error: "Invalid resource type. Use 'blocks' or 'report'." });
            return;
        }

        // Get document first to find the key? Or assume standard convention?
        // Using standard convention from dev.ts: blocks/<id>.json, reports/<id>.json
        const key = `${type}s/${id}.json`; // note pluralization match: 'blocks/' 'reports/'

        const command = new GetObjectCommand({
            Bucket: BUCKET_DATA,
            Key: key
        });

        const result = await s3Client.send(command);
        if (result.Body) {
            const body = await streamToString(result.Body as Readable);
            res.json(JSON.parse(body));
        } else {
            res.status(404).json({ error: "Content not found" });
        }
    } catch (error: any) {
        console.error(`Error fetching ${req.params.type}:`, error);
        if (error.name === 'NoSuchKey') {
            res.status(404).json({ error: "File not found" });
        } else {
            res.status(500).json({ error: "Failed to fetch content" });
        }
    }
});

export default router;
