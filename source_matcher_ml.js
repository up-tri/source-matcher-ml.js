const glob = require("glob");
const fs = require("fs");
const {
  convertArrayToCSV
} = require("convert-array-to-csv");
const args = process.argv;
if (args.length < 2) {
  console.error("Error!");
  process.exit(1);
}

let targetDir = process.cwd();
let extensions = [];
let regex = new RegExp();
let regexMain = new RegExp();
let outFlg = "stdout";
let outFileName = "matcher.out";

const dirNameIdx = args.indexOf("--dir");
if (-1 !== dirNameIdx) {
  targetDir = args[dirNameIdx + 1];
}

const extensionIdx = args.indexOf("--ext");
if (-1 !== extensionIdx) {
  extensions = args[extensionIdx + 1].split(",");
}

const stdoutIdx = args.indexOf("--stdout");
if (-1 !== stdoutIdx) {
  outFlg = "stdout";
}

const csvIdx = args.indexOf("--csv");
if (-1 !== csvIdx) {
  outFlg = "csv";
  outFileName = args[csvIdx + 1] || "matcher.out.csv";
}

const jsonIdx = args.indexOf("--json");
if (-1 !== jsonIdx) {
  outFlg = "json";
  outFileName = args[jsonIdx + 1] || "matcher.out.json";
}

const regexIdx = args.indexOf("--regex");
if (-1 !== regexIdx) {
  regex = new RegExp(args[regexIdx + 1], "g");
  regexMain = new RegExp(args[regexIdx + 1]);
} else {
  console.error("Error!");
  process.exit(1);
}

if (!fs.existsSync(targetDir)) {
  console.error("Error!");
  process.exit(1);
}

let specifiedExtensionString = "";
switch (extensions.length) {
  case 0:
    break;
  case 1:
    specifiedExtensionString = `.${extensions[0]}`;
    break;
  default:
    specifiedExtensionString = `.{${extensions.concat(", ")}}`;
    break;
}

let globTarget = targetDir + `/**/*${specifiedExtensionString}`;
if (fs.lstatSync(targetDir).isFile()) {
  globTarget = targetDir;
}

glob(globTarget, {
  nodir: true
}, (err, res) => {
  if (err) {
    console.log("Error", err);
  } else {
    const out = [];
    for (const path of res) {
      const content = fs.readFileSync(path).toString();
      const results = content.match(regex);
      if (results !== null) {
        for (const hit of results) {
          let match = hit.match(regexMain);
          delete match["index"];
          delete match["input"];
          delete match["groups"];
          match = match.splice(1, match.length);
          out.push(match);
        }
      }
    }
    switch (outFlg) {
      case "stdout":
        console.log(convertArrayToCSV(out));
        break;
      case "csv":
        fs.writeFileSync(outFileName, convertArrayToCSV(out));
        break;
      case "json":
        fs.writeFileSync(outFileName, JSON.stringify(out, {}, 2));
    }
  }
});
