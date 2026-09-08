const fs = require('fs');
const filePath = '_astro/MorphingParticlesComponent.astro_astro_type_script_index_0_lang.B4r3VvfF.js';
let content = fs.readFileSync(filePath, 'utf8');

// The worker blob string is inside a template literal in the Blob constructor.
// The bug: there's a NESTED self.onmessage structure:
//   self.onmessage = function(e) {   <-- OUTER (16 spaces) - consumes the message
//       (function(f){...PoissonDiskSampling IIFE...})();
//       
//       self.onmessage = function(e) {  <-- INNER (20 spaces) - never reached
//           // actual processing code
//       };
//   };   <-- was already removed by previous edit
//
// Fix: Remove the OUTER self.onmessage wrapper line so the IIFE runs at
// worker start and the INNER handler becomes the only handler.

// The outer handler line is exactly this (16 spaces):
const outerHandler = '\n                self.onmessage = function(e) {\n';
// Replace with just a newline
const replacement = '\n';

if (content.includes(outerHandler)) {
    // Only replace the FIRST occurrence (the outer wrapper)
    content = content.replace(outerHandler, replacement);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('SUCCESS: Removed outer self.onmessage wrapper');

    // Verify
    const verify = fs.readFileSync(filePath, 'utf8');
    const lines = verify.split('\n');
    console.log('New total lines:', lines.length);
    console.log('New line 2:', JSON.stringify(lines[1].slice(0, 60)));
} else {
    console.log('Pattern not found - checking file structure...');
    const lines = content.split('\n');
    console.log('Total lines:', lines.length);
    for (let i = 0; i < 6; i++) {
        console.log(`Line ${i + 1}: ${JSON.stringify(lines[i].slice(0, 60))}`);
    }
}
