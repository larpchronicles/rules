## Publish flow
- use `utilities/build-rulebook.js` to generate the compiled .md file of all the chapters
- Drop that file into `chron-manager/src`
TODO: Have a commit hook on the main branch of rules that fires a WebRequest to chron-manager, telling chron-manager that there's a rulebook update to fetch.

## Tags for the build-rulebook.js script

### Table of Contents directives
[!toc-exclude] — omit this heading from the TOC 
[!toc-exclude-recursive] — omit it and its whole subtree  
[!toc-exclude-children-only] — keep it, omit its subtree  
[!toc-collapse] — present but collapsed by default (subtree hidden until expanded)  
[!toc-expand] — present and expanded; force-opens its ancestor chain  


> [!Title]
> Chronicles 

The version tag is automatically populated from the version.json file at build time
> [!Version] 
> vX.Y.Z 

The date tag is automatically populated at build time. Format is: `MonthName Day, FullYear`
> [!Date]  
> The publish date of this version

Credits is the writing credits for the book and system
> [!Credits]  
> credits  
> more credits  


Formatted Copyright line
> [!Copyright]
> © 2023 Justin Doyle  

Thank you message and dedication
> [!Dedication]
> The "thank you players" blurb 