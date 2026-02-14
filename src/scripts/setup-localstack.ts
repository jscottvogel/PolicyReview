
import { DynamoDBClient, CreateTableCommand } from '@aws-sdk/client-dynamodb';
import { S3Client, CreateBucketCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const region = process.env.AWS_REGION || 'us-east-1';
const endpoint = process.env.AWS_ENDPOINT;

if (!endpoint) {
    console.log("No AWS_ENDPOINT defined. Skipping LocalStack setup.");
    process.exit(0);
}

console.log(`Using endpoint: ${endpoint}`);

const ddbClient = new DynamoDBClient({ region, endpoint });
const s3Client = new S3Client({ region, endpoint, forcePathStyle: true });

const TABLE_DOCUMENTS = process.env.TABLE_DOCUMENTS || 'Documents';
const TABLE_FINDINGS = process.env.TABLE_FINDINGS || 'Findings';
const BUCKET_DATA = process.env.BUCKET_DATA || 'policy-review-data';

async function setup() {
    try {
        // Create Documents Table
        console.log(`Creating Table: ${TABLE_DOCUMENTS}...`);
        try {
            await ddbClient.send(new CreateTableCommand({
                TableName: TABLE_DOCUMENTS,
                KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
                AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
                ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
            }));
            console.log("Documents Table created.");
        } catch (e: any) {
            if (e.name === 'ResourceInUseException') console.log("Documents Table already exists.");
            else throw e;
        }

        // Create Findings Table
        console.log(`Creating Table: ${TABLE_FINDINGS}...`);
        try {
            await ddbClient.send(new CreateTableCommand({
                TableName: TABLE_FINDINGS,
                KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
                AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
                ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
            }));
            console.log("Findings Table created.");
        } catch (e: any) {
            if (e.name === 'ResourceInUseException') console.log("Findings Table already exists.");
            else throw e;
        }

        // Create S3 Bucket
        console.log(`Creating Bucket: ${BUCKET_DATA}...`);
        try {
            await s3Client.send(new CreateBucketCommand({
                Bucket: BUCKET_DATA
            }));
            console.log("Bucket created.");
        } catch (e: any) {
            if (e.name === 'BucketAlreadyOwnedByYou' || e.name === 'BucketAlreadyExists') console.log("Bucket already exists.");
            else throw e;
        }

        console.log("Setup complete.");
    } catch (err) {
        console.error("Setup failed:", err);
    }
}

setup();
