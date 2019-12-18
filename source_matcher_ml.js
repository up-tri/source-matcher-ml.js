const figlet = require("figlet");
const chalk = require("chalk");
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

const convertArrayToTSV = (lines) => {
  let outStr = "";
  for (const line of lines) {
    const tabRemovedLine = line.map(item => item.replace(/\t/g, " "));
    tabRemovedLine.concat("\t");
    outStr += (tabRemovedLine + "\n");
  }
  return outStr;
};

let targetDir = process.cwd();
let extensions = [];
let regex = new RegExp();
let regexMain = new RegExp();
let outFlg = "stdout";
let outFileName = "matcher.out";

const helpIdx = args.indexOf("--help");
if (-1 !== helpIdx) {
  figlet("Matcher ML", function (err, data) {
    console.log(data);
    console.log("delevoper: " + chalk.bold.yellow("up-tri") + " " + chalk.underline("https://up-tri.me"));
    console.log();
    console.log(chalk.blue("How to use"));
    console.log();
    console.log("`" + chalk.yellow("node source_matcher_ml.js --dir <target dir> --regex \"regular expressions\" <out flag <file name> >") + "`");
    console.log();
    console.log(chalk.green("[regex]"));
    console.log("Regular expression to get a string (must use grouping)");
    console.log(chalk.green("[out flags]"));
    console.log("--stdout\t...The result is displayed on standard output.");
    console.log("--json\t...The result is saved in JSON.");
    console.log("--csv\t...The result is saved in CSV.");
    console.log(chalk.green("[filename]"));
    console.log("If you set A or B Flag, you can set the output file name.");
    console.log("ex.) " + chalk.yellow("`--csv \"/path/to/savedir/testcase.csv\"`"));
    process.exit(0);
  });
} else {

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
          console.log(convertArrayToTSV(out));
          break;
        case "csv":
          fs.writeFileSync(outFileName, convertArrayToCSV(out));
          break;
        case "json":
          fs.writeFileSync(outFileName, JSON.stringify(out, {}, 2));
      }
    }
  });
}
