
import { v4 as uuidv4 } from 'uuid';

export interface Block {
    id: string;
    text: string;
    section?: string;
}

export interface Finding {
    id: string;
    docId: string;
    severity: 'High' | 'Medium' | 'Low';
    category: 'completeness' | 'ambiguity' | 'risk' | 'consistency';
    title: string;
    description: string;
    evidenceBlockIds: string[];
    suggestedFix?: string;
}

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

export function generateBlocks(): Block[] {
    const count = Math.floor(Math.random() * 21) + 20; // 20-40
    const blocks: Block[] = [];

    for (let i = 0; i < count; i++) {
        const sectionIndex = Math.floor(i / (count / SECTIONS.length));
        const section = SECTIONS[sectionIndex % SECTIONS.length];

        // Generate some random text
        const phrase = PHRASES[Math.floor(Math.random() * PHRASES.length)];
        const text = `${section}: ${phrase} This applies to all relevant personnel. ensure compliance.`;

        blocks.push({
            id: uuidv4(),
            text,
            section
        });
    }
    return blocks;
}

export function generateFindings(docId: string, blocks: Block[]): Finding[] {
    const count = Math.floor(Math.random() * 8) + 8; // 8-15
    const findings: Finding[] = [];

    for (let i = 0; i < count; i++) {
        const severity = ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)] as any;
        const category = ['completeness', 'ambiguity', 'risk', 'consistency'][Math.floor(Math.random() * 4)] as any;

        // Pick 1-3 distinct blocks as evidence
        const numEvidence = Math.floor(Math.random() * 3) + 1;
        const evidenceIds = new Set<string>();
        while (evidenceIds.size < numEvidence) {
            evidenceIds.add(blocks[Math.floor(Math.random() * blocks.length)].id);
        }

        findings.push({
            id: uuidv4(),
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

export function generateReport(docId: string, docMeta: any, findings: Finding[]) {
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
