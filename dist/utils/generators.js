"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBlocks = generateBlocks;
exports.generateFindings = generateFindings;
exports.generateReport = generateReport;
const uuid_1 = require("uuid");
const SECTIONS = [
    'Purpose', 'Scope', 'In-Office Requirements', 'Exceptions',
    'Enforcement', 'Definitions', 'Review Cycle', 'Equipment', 'Security'
];
const PHRASES = [
    "Employees are generally expected to check in.",
    "Managers may approve requests as needed.",
    "Work from home is allowed subject to approval.",
    "Data should be secured appropriately.",
    "Failure to comply may result in disciplinary action.",
    "The company provides necessary equipment within reason.",
    "Hybrid work schedules are determined by department heads."
];
function generateBlocks() {
    const count = Math.floor(Math.random() * 21) + 20; // 20-40
    const blocks = [];
    for (let i = 0; i < count; i++) {
        const sectionIndex = Math.floor(i / (count / SECTIONS.length));
        const section = SECTIONS[sectionIndex % SECTIONS.length];
        // Generate some random text
        const phrase = PHRASES[Math.floor(Math.random() * PHRASES.length)];
        const text = `${section}: ${phrase} This applies to all relevant personnel. ensure compliance.`;
        blocks.push({
            id: (0, uuid_1.v4)(),
            text,
            section
        });
    }
    return blocks;
}
function generateFindings(docId, blocks) {
    const count = Math.floor(Math.random() * 8) + 8; // 8-15
    const findings = [];
    for (let i = 0; i < count; i++) {
        const severity = ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)];
        const category = ['completeness', 'ambiguity', 'risk', 'consistency'][Math.floor(Math.random() * 4)];
        // Pick 1-3 distinct blocks as evidence
        const numEvidence = Math.floor(Math.random() * 3) + 1;
        const evidenceIds = new Set();
        while (evidenceIds.size < numEvidence) {
            evidenceIds.add(blocks[Math.floor(Math.random() * blocks.length)].id);
        }
        findings.push({
            id: (0, uuid_1.v4)(),
            docId,
            severity,
            category,
            title: `${severity} Risk in ${category}`,
            description: `Potential issue found regarding ${category}. Please review the referenced sections.`,
            evidenceBlockIds: Array.from(evidenceIds),
            suggestedFix: (severity === 'High' || severity === 'Medium') ? "Clarify the specific requirements and remove ambiguity." : undefined
        });
    }
    return findings;
}
function generateReport(docId, docMeta, findings) {
    // Matching /agents /analyze output schema roughly
    return {
        docId,
        metadata: docMeta,
        analysis: {
            timestamp: new Date().toISOString(),
            findings: findings.map(f => ({
                ...f,
                // In a real report, we might embed snippets, but the findings ref blocks
            })),
            summary: `Analysis complete. Found ${findings.length} issues.`
        }
    };
}
