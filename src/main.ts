// Ini dipanggil saat pejet tombol extension or something...

import * as stringAlgo from './algorithms/string-matching'
import * as keywordUtils from './utils/keyword'
import { MatchMethod } from './algorithms/string-match-result'

document.addEventListener('DOMContentLoaded', () => {
    console.log("Before: 𝕊lot 5lot g4cor sL0T");
    console.log("After: " + keywordUtils.normalizeString("𝕊lot 5lot g4cor sL0T"));
    console.log(stringAlgo.exactMatching("𝕊lot 5lot g4cor sL0T", MatchMethod.AC));
    console.log(stringAlgo.exactMatching("𝕊lot 5lot g4cor sL0T", MatchMethod.KMP));
    console.log(stringAlgo.fuzzyMacthing("𝕊elot 5lop g4cor sL0T gcor"));
});