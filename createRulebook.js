(function () {
    "use strict";

    const fs = require("fs"),
        path = require("path");

    let versionFileContents = require("./version.json");

    let rulesVersion;

    rulesVersion = versionFileContents.version;

    let dir = "rules-topics";

    fs.readdir(dir, function (err, files) {
        //let outputContents = `# 00 - Change History\n**Version: ${rulesVersion}**\n\n`;
        let outputContents = `**Rules Version: ${rulesVersion}**\n${new Date().toDateString()}\n\n`;

        if (err) { return console.log('Unable to scan directory: ' + err); }
        for (let i = 0; i < files.length; i++) {
            let filename = files[i];

            // Only match files that fit the format "00-something.md"
            if (filename.search(/^\d.*\.md$/) > -1) {
                let fileContents,
                    headingText;

                fileContents = fs.readFileSync(path.join(dir, filename), "utf-8");
                // Replace all the #'s and ##'s with ##'s and ###'s, etc. (add one # to each set)
                // 2023-07-12 JD: Commented out because files have proper headings
                //fileContents = fileContents.replace(/(#+)/g, "$1#");

                // Github adds horizontal rules after certain headings. This removes the duplicates
                //fileContents = fileContents.replace(/---\n/g, "");

                // Use the file names to generate headings. Ex: 00_some-file.md becomes 00 - some-file
                /*headingText = filename.replace(/^(\d+)_(.*)\.md$/, "$1 - $2");
                // Capitalize the first letter of each word
                headingText = headingText.replace(/(\S)-(\S)/g, "$1 $2");
                headingText = headingText.replace(/\b\w/g, char => char.toUpperCase());*/


                outputContents = `${outputContents}\n${fileContents}`;
                console.log(filename);
            }
        }
        fs.writeFileSync("chronicles-rulebook.md", outputContents, "utf-8");
    });

})();