(function () {
    "use strict";

    const fs = require("fs"),
        path = require("path");

    let dir = "../data";

    let glossary = {};
    let incants = [];

    glossary.spells = {};
    glossary.abilities = {};
    glossary.markdown = [];
    for (let i = 1; i < 11; i++) {
        glossary.spells[i] = {
            arcane: [],
            nature: [],
            spirit: [],
            universal: []
        };
        glossary.abilities[i] = [];
    }


    fs.readdir(dir, function (err, files) {
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        }

        let markdown = [];


        for (let i = 0; i < files.length; i++) {
            let filename = files[i];

            // Only match files that fit the format "00-something.md"
            if (filename.search(/\.json$/) > -1) {
                let fileMd;
                let skills;
                skills = require(path.join(dir, filename));

                markdown.push("\n ------------------------------------------------ \n");
                markdown.push(`# ${filename}\n`);
                if (filename.search("skills") > -1) {
                    fileMd = generateSkillFile(skills);
                    fs.writeFileSync(`out/${filename}.md`, fileMd.join("\n"), "utf-8");
                    markdown = markdown.concat(fileMd);
                } else if (filename.search("abilities") > -1) {
                    fileMd = generateAbilityFile(skills);
                    fs.writeFileSync(`out/${filename}.md`, fileMd.join("\n"), "utf-8");
                    markdown = markdown.concat(fileMd);
                } else if (filename.search("spells") > -1) {
                    fileMd = generateSpellFile(skills);
                    fs.writeFileSync(`out/${filename}.md`, fileMd.join("\n"), "utf-8");
                    markdown = markdown.concat(fileMd);
                }
            }
        }

        fs.writeFileSync(`out/glossary.md`, glossary.markdown.join("\n"), "utf-8");




        let spellsTable = [];
        spellsTable.push("| Level | Arcane | Nature | Spirit | Universal |");
        spellsTable.push("|---|---|---|---|---|");
        for (let i = 1; i < 11; i++) {
            let line = `| ${i} |`;
            line = line + glossary.spells[i].arcane.join("<br>") + "|";
            line = line + glossary.spells[i].nature.join("<br>") + "|";
            line = line + glossary.spells[i].spirit.join("<br>") + "|";
            line = line + glossary.spells[i].universal.join("<br>") + "|";
            spellsTable.push(line);
        }
        //console.log(spellsTable.join("\n"));
        glossary.markdown.push("");
        glossary.markdown = glossary.markdown.concat(spellsTable)

        console.log(markdown.join("\n"));
        console.log(glossary.markdown.join("\n"));
        console.log("\n## Incants");
        incants = incants.sort();
        console.log(incants.join("\n"));

    });



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

        glossary.markdown.push("");
        glossary.markdown = glossary.markdown.concat(markdown);

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

        glossary.markdown.push("");
        glossary.markdown = glossary.markdown.concat(markdown);

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
            /*console.log(skills[i].level + " " + skills[i].school.toLowerCase());
            console.log(glossary.spells[skills[i].level][skills[i].school.toLowerCase()]);*/
            glossary.spells[skills[i].level][skills[i].school.toLowerCase().trim()].push(skills[i].name);
            //glossary.spells[parseInt(skills[i].level, 10)].push({"name": skills[i].name, "school": skills[i].school, "incant": skills[i].incant});

        }
        markdown.push("");

        glossary.markdown.push("");
        glossary.markdown = glossary.markdown.concat(markdown);

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