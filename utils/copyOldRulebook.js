(function () {
    "use strict";

    const fs = require("fs");

    let versionFileContents,
        rulesVersion,
        newPath;

    versionFileContents = require("../version.json");
    rulesVersion = versionFileContents.previousVersion;
    newPath = `./previous-versions/chronicles-rulebook_${rulesVersion}.md`;

    // Check if the rulebook has been generated.  If it has, then rename it and move it.
    if (!fs.existsSync('chronicles-rulebook.md')) {
        console.log("STOP RIGHT THERE CRIMINAL SCUM!  The file 'chronicles-rulebook.md' does not exist.  You must run 'node .\\utils\\createRulebook.js' first.");
    } else {
        console.log('Confirmed chronicles-rulebook.md exists.');
        if (!fs.existsSync(newPath)) {
            fs.renameSync('chronicles-rulebook.md', newPath);
            console.log(`File successfully renamed and moved to ${newPath}`);
        } else {
            console.log(`File ${newPath} already exists!`);
        }
    }

})();