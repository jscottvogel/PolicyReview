# PolicyReview API

This is the backend API for the PolicyReview application.

## Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run locally:
   ```bash
   npm run dev
   ```

## Configuration

The following environment variables are used (defaults provided for dev):
- `AWS_REGION`: Defaults to `us-east-1`
- `TABLE_DOCUMENTS`: DynamoDB table for documents.
- `TABLE_FINDINGS`: DynamoDB table for findings.
- `BUCKET_DATA`: S3 bucket for blocks and reports.

## Endpoints

### POST /api/dev/create-test-data
Generates synthetic data for UI testing.
- Only available when `NODE_ENV !== 'production'`
- Creates a Document, S3 blocks, Findings, and S3 Report.
- Returns `{ "docId": "..." }`