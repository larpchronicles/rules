(function () {
    "use strict";

    const fs = require("fs");

    let versionFileContents = require("./version.json");

    let rulesVersion;

    rulesVersion = versionFileContents.version;



    fs.readdir(".", function (err, files) {
        let outputContents = `# 00 - Change History\n**Version: ${rulesVersion}**\n\n`;

        if (err) { return console.log('Unable to scan directory: ' + err); }
        for (let i = 0; i < files.length; i++) {
            let filename = files[i];

            // Only match files that fit the format "00-something.md"
            if (filename.search(/^\d.*\.md$/) > -1) {
                let fileContents,
                    headingText;

                fileContents = fs.readFileSync(filename, "utf-8");
                // Replace all the #'s and ##'s with ##'s and ###'s, etc. (add one # to each set)
                fileContents = fileContents.replace(/(#+)/g, "$1#");
                fileContents = fileContents.replace(/---\n/g, "");

                // Use the file names to generate headings. Ex: 00_some-file.md becomes 00 - some-file
                headingText = filename.replace(/^(\d+)_(.*)\.md$/, "$1 - $2");
                // Capitalize the first letter of each word
                headingText = headingText.replace(/(\S)-(\S)/g, "$1 $2");
                headingText = headingText.replace(/\b\w/g, char => char.toUpperCase());


                outputContents = `${outputContents}\n# ${headingText}\n${fileContents}`;
                console.log(filename);
            }
        }
        fs.writeFileSync("allrules.md", outputContents, "utf-8");
    });

})();