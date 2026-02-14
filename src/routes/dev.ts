
import { Router, Request, Response } from 'express';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { generateBlocks, generateFindings, generateReport } from '../utils/generators';

const router = Router();

// Initialize Clients
const region = process.env.AWS_REGION || 'us-east-1';
const endpoint = process.env.AWS_ENDPOINT; // Support for LocalStack or custom endpoints

const clientConfig = {
    region,
    ...(endpoint && { endpoint })
};

const ddbClient = new DynamoDBClient(clientConfig);
const docClient = DynamoDBDocumentClient.from(ddbClient);
const s3Client = new S3Client({ ...clientConfig, forcePathStyle: !!endpoint });

// Access Env Vars for Table/Bucket names
const TABLE_DOCUMENTS = process.env.TABLE_DOCUMENTS || 'Documents';
const TABLE_FINDINGS = process.env.TABLE_FINDINGS || 'Findings';
const BUCKET_DATA = process.env.BUCKET_DATA || 'policy-review-data';

router.post('/create-test-data', async (req: Request, res: Response): Promise<void> => {
    // Requirement: Disabled in production
    if (process.env.NODE_ENV === 'production') {
        res.status(404).send();
        return;
    }

    try {
        const docId = uuidv4();
        const now = new Date().toISOString();

        // 1. Create Document META
        const docItem = {
            id: docId,
            filename: "Sample Hybrid Work Policy (Synthetic).docx",
            status: "complete",
            policyType: "hybrid_work",
            riskLevel: "medium",
            uploadedAtISO: now,
            summaryTopFindings: [
                "Policy lacks specific retention periods.",
                "Ambiguous definitions for 'remote' roles.",
                "Inconsistent enforcement procedures listed."
            ],
            s3BlocksKey: `blocks/${docId}.json`,
            s3ReportKey: `reports/${docId}.json`
        };

        // Write to DynamoDB Documents Table
        await docClient.send(new PutCommand({
            TableName: TABLE_DOCUMENTS,
            Item: docItem
        }));

        // 2. Generate and Store Blocks to S3
        const blocks = generateBlocks();
        await s3Client.send(new PutObjectCommand({
            Bucket: BUCKET_DATA,
            Key: `blocks/${docId}.json`,
            Body: JSON.stringify(blocks),
            ContentType: 'application/json'
        }));

        // 3. Generate and Store Findings to DynamoDB
        const findings = generateFindings(docId, blocks);
        for (const finding of findings) {
            await docClient.send(new PutCommand({
                TableName: TABLE_FINDINGS,
                Item: finding
            }));
        }

        // 4. Generate and Store Full Report to S3
        const report = generateReport(docId, docItem, findings);
        await s3Client.send(new PutObjectCommand({
            Bucket: BUCKET_DATA,
            Key: `reports/${docId}.json`,
            Body: JSON.stringify(report),
            ContentType: 'application/json'
        }));

        // Return the docId
        res.json({ docId });

    } catch (error) {
        console.error("Error generating test data:", error);
        res.status(500).json({ error: "Failed to generate test data", details: String(error) });
    }
});

export default router;
