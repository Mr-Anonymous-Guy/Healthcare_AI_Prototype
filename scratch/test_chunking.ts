import { cleanText, chunkText } from '../services/pdfService';

const sampleMedicalText = `
--- Page 1 ---
HEALTHCARE DIAGNOSTIC & LAB SERVICES
Patient Name: Rishov Mahapatra    Age: 28    Gender: Male
Date of Collection: 2026-07-24     Report Status: Final Verified

COMPLETE BLOOD COUNT (CBC) LAB REPORT
TEST PARAMETER              RESULT       REFERENCE INTERVAL    UNIT
----------------------------------------------------------------------
Hemoglobin                  14.5         13.0 - 17.0           g/dL
RBC Count                   4.9          4.5 - 5.5             10^6/uL
Packed Cell Volume (PCV)    43.2         40.0 - 50.0           %
Mean Corpuscular Vol (MCV)  88.1         80.0 - 100.0          fL
WBC Total Count             6,800        4,000 - 11,000        /uL
Neutrophils                 62 %         40 - 70               %
Lymphocytes                 30 %         20 - 40               %
Eosinophils                 3 %          1 - 6                 %
Monocytes                   4 %          2 - 8                 %
Platelet Count              245,000      150,000 - 450,000     /uL

CLINICAL IMPRESSION & RECOMMENDATIONS:
1. All hematological parameters fall well within normal physiological reference ranges.
2. No signs of acute infection, anemia, or thrombocytosis detected in current specimen.
3. Patient is advised to maintain adequate hydration and schedule routine annual health screening in 12 months.
`;

const cleaned = cleanText(sampleMedicalText);
const chunks = chunkText(cleaned, { chunkSize: 300, overlap: 60 });

console.log('=== CLEANED TEXT ===');
console.log(cleaned);
console.log('\n=== GENERATED CHUNKS (Total: ' + chunks.length + ') ===');
chunks.forEach((chunk) => {
  console.log(`\n--- CHUNK #${chunk.chunkIndex + 1} (${chunk.charCount} chars, ${chunk.wordCount} words) ---`);
  console.log(chunk.text);
});
