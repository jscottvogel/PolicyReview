"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const client_s3_1 = require("@aws-sdk/client-s3");
const uuid_1 = require("uuid");
const generators_1 = require("../utils/generators");
const router = (0, express_1.Router)();
// Initialize Clients
const region = process.env.AWS_REGION || 'us-east-1';
const ddbClient = new client_dynamodb_1.DynamoDBClient({ region });
const docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(ddbClient);
const s3Client = new client_s3_1.S3Client({ region });
// Access Env Vars for Table/Bucket names
const TABLE_DOCUMENTS = process.env.TABLE_DOCUMENTS || 'Documents';
const TABLE_FINDINGS = process.env.TABLE_FINDINGS || 'Findings';
const BUCKET_DATA = process.env.BUCKET_DATA || 'policy-review-data';
router.post('/create-test-data', async (req, res) => {
    // Requirement: Disabled in production
    if (process.env.NODE_ENV === 'production') {
        res.status(404).send();
        return;
    }
    try {
        const docId = (0, uuid_1.v4)();
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
        await docClient.send(new lib_dynamodb_1.PutCommand({
            TableName: TABLE_DOCUMENTS,
            Item: docItem
        }));
        // 2. Generate and Store Blocks to S3
        const blocks = (0, generators_1.generateBlocks)();
        await s3Client.send(new client_s3_1.PutObjectCommand({
            Bucket: BUCKET_DATA,
            Key: `blocks/${docId}.json`,
            Body: JSON.stringify(blocks),
            ContentType: 'application/json'
        }));
        // 3. Generate and Store Findings to DynamoDB
        const findings = (0, generators_1.generateFindings)(docId, blocks);
        for (const finding of findings) {
            await docClient.send(new lib_dynamodb_1.PutCommand({
                TableName: TABLE_FINDINGS,
                Item: finding
            }));
        }
        // 4. Generate and Store Full Report to S3
        const report = (0, generators_1.generateReport)(docId, docItem, findings);
        await s3Client.send(new client_s3_1.PutObjectCommand({
            Bucket: BUCKET_DATA,
            Key: `reports/${docId}.json`,
            Body: JSON.stringify(report),
            ContentType: 'application/json'
        }));
        // Return the docId
        res.json({ docId });
    }
    catch (error) {
        console.error("Error generating test data:", error);
        res.status(500).json({ error: "Failed to generate test data", details: String(error) });
    }
});
exports.default = router;
