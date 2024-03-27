(function () {
    "use strict";

    const fs = require("fs"),
        path = require("path");

    let dir = "../data";

    let glossary = [];
    let incants = [];

    glossary.spells = [];


    fs.readdir(dir, function (err, files) {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }

        let markdown = [];


        for (let i = 0; i < files.length; i++) {
            let filename = files[i];

            // Only match files that fit the format "00-something.md"
            if (filename.search(/\.json$/) > -1) {
                /*let fileContents,
                    headingText;

                fileContents = fs.readFileSync(path.join(dir, filename), "utf-8");*/
                let skills;
                //skills = require("../data/fighter-skills.json");
                skills = require(path.join(dir, filename));

                markdown.push("\n ------------------------------------------------ \n");
                markdown.push(`# ${filename}\n`);
                if (filename.search("skills") > -1) {
                    markdown = markdown.concat(generateSkillFile(skills));
                } else if (filename.search("abilities") > -1) {
                    markdown = markdown.concat(generateAbilityFile(skills));
                } else if (filename.search("spells") > -1) {
                    markdown = markdown.concat(generateSpellFile(skills));
                }
            }
        }

        console.log(markdown.join("\n"));
        console.log(glossary.join("\n"));
        console.log("\n## Incants");
        incants = incants.sort();
        console.log(incants.join("\n"));

    });

    console.log(JSON.stringify(glossary.spells, null, 4));

    function titleCase(string){
        return string[0].toUpperCase() + string.slice(1).toLowerCase();
    }


    let generateAbilityFile = function (skills) {
        let markdown = [];
        markdown.push("| Level | Abilities |");
        markdown.push("|---|---|");
        for (let i = 0; i < skills.length; i++) {
            markdown.push(`| ${skills[i].level} | ${skills[i].name} |`);
        }
        markdown.push("");

        glossary.push("");
        glossary = glossary.concat(markdown);

        for (let i = 0; i < skills.length; i++) {
            markdown.push(`| | **${skills[i].name}** |`)
            markdown.push("|:---|---|");
            //markdown.push(`| **Pool** | ${skills[i].pool} |`);
            markdown.push(`| **Level** | ${skills[i].level} |`);
            markdown.push(`| **Duration** | ${skills[i].duration} |`);
            if (skills[i].verbal) {
                skills[i].verbal = skills[i].verbal.replace(/\</, "\\<");
            }
            markdown.push(`| **Verbal** | "${skills[i].verbal}" |`);
            markdown.push(`| **Description** | ${skills[i].description} |`);
            markdown.push("");
        }
        return markdown;
    };



    let generateSkillFile = function (skills) {
        let markdown = [];
        markdown.push("| Skill | Primary | Secondary | Tertiary |");
        markdown.push("|---|---|---|---|");
        for (let i = 0; i < skills.length; i++) {
            if (skills[i].spCosts) {
                let line = [],
                    costs = {
                        primary: "",
                        secondary: "",
                        tertiary: ""
                    };

                // If there are no costs specified for certain attributes, set them to the default of 0 (so we don't get undefined properties later
                if (!skills[i].spCosts.base) {
                    skills[i].spCosts.base = {"primary": 0, "secondary": 0, "tertiary": 0};
                }
                if (!skills[i].spCosts.increment) {
                    skills[i].spCosts.increment = {"primary": 0, "secondary": 0, "tertiary": 0};
                }

                // costs is the object we're using to build the actual strings
                costs.primary = skills[i].spCosts.base.primary;

                // Some skills[i]s don't have increment costs, so don't include the +x part
                if (skills[i].spCosts.increment.primary > 0) {
                    costs.primary = `${costs.primary}+${skills[i].spCosts.increment.primary}`;
                }

                //Some skills[i]s don't have separate secondary/tertiary costs, so set them to the same as primary
                if (skills[i].spCosts.base.secondary === 0) {
                    costs.secondary = costs.primary;
                } else {
                    costs.secondary = skills[i].spCosts.base.secondary;
                    // Some skills[i]s don't have increment costs, so don't include the +x part
                    if (skills[i].spCosts.increment.secondary > 0) {
                        costs.secondary = `${costs.secondary}+${skills[i].spCosts.increment.secondary}`;
                    }
                }

                //Some skills[i]s don't have separate secondary/tertiary costs, so set them to the same as primary
                if (skills[i].spCosts.base.tertiary === 0) {
                    costs.tertiary = costs.primary;
                } else {
                    costs.tertiary = skills[i].spCosts.base.tertiary;
                    // Some skills[i]s don't have increment costs, so don't include the +x part
                    if (skills[i].spCosts.increment.tertiary > 0) {
                        costs.tertiary = `${costs.tertiary}+${skills[i].spCosts.increment.tertiary}`;
                    }
                }

                line.push(skills[i].name);
                line.push(costs.primary);
                line.push(costs.secondary);
                line.push(costs.tertiary);
                markdown.push("|" + line.join("|") + "|");
            }
        }

        glossary.push("");
        glossary = glossary.concat(markdown);

        for (let i = 0; i < skills.length; i++) {
            markdown.push("");
            markdown.push(`## ${skills[i].name}  `);
            markdown.push(skills[i].description);
        }
        return markdown;
    };

    let generateSpellFile = function (skills) {
        let markdown = [];
        markdown.push("| Level | Spell | Incant |");
        markdown.push("|---:|---|:---|");
        for (let i = 0; i < skills.length; i++) {
            if (skills[i].incant) {
                skills[i].incant = skills[i].incant.replace(/</, "\\<");
            }
            markdown.push(`| ${skills[i].level} | ${skills[i].name} | _${skills[i].incant}_ |`);
            if (!Array.isArray(glossary.spells)) { glossary.spells = []; }
            if (!Array.isArray(glossary.spells[skills[i].level])) {glossary.spells[skills[i].level] = []; }
            glossary.spells[skills[i].level] = glossary.spells[skills[i].level] || [];
            glossary.spells[skills[i].level].push({"name": skills[i].name, "school": skills[i].school, "incant": skills[i].incant});
            //console.log(JSON.stringify(glossary.spells, null, 4));
        }
        markdown.push("");

        glossary.push("");
        glossary = glossary.concat(markdown);

        for (let i = 0; i < skills.length; i++) {
            markdown.push(`| | **${skills[i].name}** |`)
            markdown.push("|:---|---|");
            //markdown.push(`| **School** | ${skills[i].school} |`);
            markdown.push(`| **Level** | ${skills[i].level} |`);
            markdown.push(`| **Duration** | ${skills[i].duration} |`);
            markdown.push(`| **Incant** | _${skills[i].incant}_ |`);
            markdown.push(`| **Description** | ${skills[i].description} |`);
            markdown.push("");
            incants.push(skills[i].incant);
        }
        return markdown;
    };

})();