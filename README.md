# source matcher multiline

## How to use

`node source_matcher_ml.js --dir <target dir> --regex "regular expressions" <out flag <file name> >`

- target dir
  - target directory
- regex
  - Regular expression to get a string (must use grouping)
- out flags
  - `--stdout` ... The result is displayed on standard output.
  - `--json` ... The result is saved in JSON.
  - `--csv` ... The result is saved in CSV.
- filename
  - If you set A or B Flag, you can set the output file name.  
    ex.) `--csv "/path/to/savedir/testcase.csv"`

## developer

- [up-tri](https://up-tri.me)
