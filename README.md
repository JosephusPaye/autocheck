# Autocheck

✅ Autocheck is a command-line tool that allows you to automatically check for patterns against a set of files and executables, and generate a neat report to quickly examine the results. It can be a very useful aid when marking programming assignments.

Autocheck is not an auto-grader or auto-marker, and has no special understanding of the files it processes, or the commands it runs. Instead, it provides a simple framework for automating many of the manual checks that are involved with marking programming assignments. You use it by configuring a series of checks in a JSON file, and then running those checks against one or more target directories. The results are automatically consolidated into neat reports that are optimised for scanning, to save you time.

With Autocheck, you can automatically run checks that:

- Look for specific files (text files, code files, PDFs, and images), and embed them in the report. Use this to check for READMEs, assignment cover sheets, etc.
- Execute commands (with an input file for stdin), and embed the output in the report. Use this to compile and run code. It even supports running commands in [Cygwin](https://cygwin.com/) on Windows.
- Compare files or output from commands against an expected result, and show any differences in the report. Use this to compare the output of student code to some expected standard.

---

This project is part of [#CreateWeekly](https://twitter.com/JosephusPaye/status/1214853295023411200), my attempt to create something new publicly every week in 2020.

## Installation

Autocheck is a Node.js package, so you'll need [Node](https://nodejs.org/en/) and npm installed (npm comes with node).

Run the following to install Autocheck:

```
npm install -g autocheck
```

## Tutorial

Learn how to use Autocheck to mark a programming assignment:

<a href="https://www.youtube.com/watch?v=lsQ4lIbZk-Y" target="_blank">
  <img alt="Autocheck tutorial video thumbnail" src="./tutorial-thumbnail.png" width="380px">
</a>

## Usage

Create a JSON file with the checks you want to run, like the following example (see below for details on available checks):

<details>
<summary> Show example </summary>

```json
[
  {
    "type": "file",
    "label": "Cover Sheet and Readme",
    "patterns": ["**/*.pdf", "**/*.{jpg,jpeg,png}", "**/*.{txt,md}"]
  },
  {
    "type": "file",
    "label": "Code Files",
    "patterns": ["**/Node.h", "**/Node.cpp", "**/LinkedList.h", "**/LinkedList.cpp"]
  },
  {
    "type": "command",
    "label": "Compiles",
    "command": "make clean && make",
    "runInCygwin": true,
    "cygwinBin": "C:\\path\\to\\cygwin\\root\\bin\\"
  },
  {
    "type": "command",
    "label": "Runs",
    "if": "Compiles",
    "command": "./assignment1.exe",
    "runInCygwin": true,
    "cygwinBin": "C:\\path\\to\\cygwin\\root\\bin\\"
  },
  {
    "type": "match",
    "label": "Matches Expected Output",
    "if": "Runs",
    "expected": "file:C:\\path\\to\\file\\with\\expected-output.txt",
    "actual": "output:Runs"
  }
]
```

</details>

### Run checks against a directory

Use the following to run Autocheck against a target directory:

```sh
autocheck ./checks.json "C:\\path\\to\\submissions\\JohnDoe\\"
```

Autocheck will run the checks and save the report to an HTML file (`JohnDoe.html` in this case) in an `autocheck-reports` folder in the directory where it was run. Open the report file in a browser to view.

### Run checks against multiple directories

Use the following to run Autocheck against multiple target directories at the same time:

```sh
autocheck ./checks.json "C:\\path\\to\\submissions\\" --subfolders
```

That will run Autocheck against every subfolder in `C:\path\to\submissions\`, e.g. `C:\path\to\submissions\JohnDoe\`, `C:\path\to\submissions\JaneDoe\`, etc.

## Example

Given the following files in `C:\code\JosephusPaye\SENG1120-Assignment-1`:

<details>
<summary>Show files</summary>

```
C:\code\JosephusPaye\SENG1120-Assignment-1\
|-- Assignment Cover Sheet.pdf
|-- DeckOfCards.cpp
|-- DeckOfCards.h
|-- DeckOfCardsDemo.cpp
|-- LinkedList.cpp
|-- LinkedList.h
|-- Makefile
|-- Node.cpp
|-- Node.h
`-- readme.txt
```

</details>

And the following `checks.json` file:

<details>
<summary>Show checks.json</summary>

```json
[
  {
    "type": "file",
    "label": "Cover Sheet and Readme",
    "patterns": ["**/*.pdf", "**/*.{jpg,jpeg,png}", "**/*.{txt,md}"]
  },
  {
    "type": "file",
    "label": "Code Files",
    "patterns": ["**/*.h", "**/*.cpp", "**/makefile"]
  },
  {
    "type": "command",
    "label": "Compiles",
    "command": "make clean && make",
    "runInCygwin": true,
    "cygwinBin": "C:\\Users\\jpaye\\AppData\\Local\\scoop\\apps\\cygwin\\current\\root\\bin\\"
  },
  {
    "type": "command",
    "label": "Runs",
    "if": "Compiles",
    "command": "./test.exe my-random-seed",
    "runInCygwin": true,
    "cygwinBin": "C:\\Users\\jpaye\\AppData\\Local\\scoop\\apps\\cygwin\\current\\root\\bin\\"
  },
  {
    "type": "match",
    "label": "Matches Expected Output",
    "if": "Runs",
    "expected": "file:C:\\code\\JosephusPaye\\autocheck\\example\\expected.txt",
    "actual": "output:Runs"
  }
]
```

</details>

Running Autocheck as follows:

```sh
autocheck checks.json "C:\\code\\JosephusPaye\\SENG1120-Assignment-1"
```

Produces the following output:

<details>
<summary>Show output</summary>

```
C:\code\JosephusPaye\autocheck\example
> autocheck checks.json "C:\\code\\JosephusPaye\\SENG1120-Assignment-1"
running checks from C:\code\JosephusPaye\autocheck\example\checks.json

checking directory (1/1): C:\code\JosephusPaye\SENG1120-Assignment-1
  running check (1/5): Cover Sheet and Readme
    check passed
  running check (2/5): Code Files
    check passed
  running check (3/5): Compiles
    check passed
  running check (4/5): Runs
    check passed
  running check (5/5): Matches Expected Output
    check failed
generated report: C:\code\JosephusPaye\autocheck\example\autocheck-reports\SENG1120-Assignment-1.html

done
```

</details>

And [this report (screenshot)](https://github.com/JosephusPaye/autocheck/raw/master/screenshot.png).

## Available Checks

### Common options

The following options are common to all checks:

| Option  | Type   | Presence | Description                                                                                                                        |
| ------- | ------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `type`  | String | Required | The type of check, one of `"file"`, `"command"`, or `"match"`                                                                      |
| `label` | String | Required | The label of the check to show in the report                                                                                       |
| `if`    | String | Optional | The name of another check to wait for before running the check. If set, the check will only be run if the referenced check passes. |

### File check

Use this check to look for specific files in the target directory, and embed them in the report. Not every file type can be embedded in the report (see below for embeddable files).

This check supports the following configuration options (in additional to the common options described above):

| Option     | Type            | Presence | Description                                                                                                                                                                                                                |
| ---------- | --------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `patterns` | List of Strings | Required | A list of file path patterns ([globs](<https://en.wikipedia.org/wiki/Glob_(programming)>)), relative to the target directory. For example, `["**/*.{pdf,txt}"]` will match all PDF and text files in the target directory. |

Files with the following extensions can be embedded. Files marked as **highlighted** will be syntax highlighted in the report:

- `.pdf`
- `.jpg` and `.jpeg`
- `.png`
- `.txt`
- `md` (highlighted)
- `c` (highlighted)
- `cpp` (highlighted)
- `cs` (highlighted)
- `h` (highlighted)
- `hpp` (highlighted)
- `makefile` (highlighted)
- `java` (highlighted)
- `py` (highlighted)
- `html` (highlighted)
- `css` (highlighted)
- `js` (highlighted)
- `json` (highlighted)
- `xml` (highlighted)
- `svg` (highlighted)

### Command check

Use this check to run a command, capture its output, and embed it in the report. On Windows, checks can be run in [Cygwin](https://cygwin.com/).

This check supports the following configuration options:

| Option        | Type    | Presence | Description                                                                                                                                                                           |
| ------------- | ------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `command`     | String  | Required | The command to run. For example: `pwd && ls`                                                                                                                                          |
| `directory`   | String  | Optional | The path to use as the command's working directory. Defaults to the target directory.                                                                                                 |
| `input`       | String  | Optional | The path to a file to use as the command's standard input. Useful for commands that read from `stdin`.                                                                                |
| `runInCygwin` | Boolean | Optional | Windows only. When `true`, the command will be ran in a Cygwin shell. Cygwin must be installed, and the path to the Cygwin `bin` folder must be provided with the `cygwinBin` option. |
| `cygwinBin`   | String  | Optional | Windows only. The path to your Cygwin installation's `bin` folder. Used together with the `runInCygwin` option. E.g. `C:\cygwin\bin` or `C:\cygwin\root\bin`.                         |

Some notes:

- Double quotes anywhere in a command should be escaped like so: `\"something\"`.
- Commands that run longer than 10 seconds will be cancelled and marked as failed.
- The output of commands (successful or failed) are automatically captured and can be compared to an expected output (see match check below).

### Match check

Use this check to compare two pieces of text for similarity. The texts can be provided as a string, read from a file, or read from a previous command check's output.

This check supports the following configuration options:

| Option     | Type   | Presence | Description                                                                                                                                                             |
| ---------- | ------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `expected` | String | Required | The expected text. Could be a string (e.g. `"abc"`), file reference (e.g. `"file:C:\path\to\expected.txt"`), or output capture (e.g. `"output:LabelOfMyCommandCheck"`). |
| `actual`   | String | Required | The actual text. Could be a string (e.g. `"abc"`), file reference (e.g. `"file:C:\path\to\expected.txt"`), or output capture (e.g. `"output:LabelOfMyCommandCheck"`).   |

Some notes:

- Both pieces of text will be be trimmed and compared
- If they're the same, the actual text will be shown in the report. Otherwise, a diff will be shown with the differences.

## What's next

- [ ] Record a tutorial video
- [x] Add screenshots to this README showing example results of each check
- [ ] Add colors to the CLI output
- [ ] Warn when commands block for stdin if there's no `input` specified
- [ ] Add search check
- [ ] Add support for user-defined checks (bring your own checks)
- [ ] Improve check navigation - add collapse/expand all checks button to header, scroll to next (arrow down icon), and scroll to previous (arrow up icon) buttons, with smooth scrolling

## Licence

[MIT](LICENCE)
