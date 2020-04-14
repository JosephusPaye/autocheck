# Autocheck

✅ Run automated pattern matches against a set of files and executables, and generate a neat report of the results. A useful aid when marking programming assignments.

<!-- ![Promotional image showing an autocheck report](./promo.png) -->

This project is part of [#CreateWeekly](https://dev.to/josephuspaye/createweekly-create-something-new-publicly-every-week-in-2020-1nh9), my attempt to create something new publicly every week in 2020.

## How it works

<!-- Describe the general approach -->

## What's Next

<!-- - [ ] Add ... -->

## Licence

[MIT](LICENCE)

<details>
<summary>Notes</summary>

Runs the checks configured in checks.json and outputs the results in a single-file HTML page, for viewing in the browser.
Each check is a section on the page, with sections laid out top to bottom (e.g. scroll to get to next).

Shell checks show the exit status and output

Match checks show the match status and a diff

Search checks show the path of every file searched, the number of matches and for each match (in a carousel with next/previous): - Shows the match highlighted in context (three lines before, three lines after), with line numbers, and the ability to expand the context up or down (shows 10 lines before, 10 lines after)

Variable expansions

`output:Functions` expands to the output of the check with label Functions - only makes sense for shell checks

Dependencies and conditional checks
"if" prop on a check only runs that check if the check with the label it references passed
otherwise - shows "Skipped because X check was unsuccessful"

</details>
