# 3D Chip-Firing

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This repository contains the code for the paper:
> Martin Skrodzki and Ulrich Reitebuch, "Chip-Firing Revisited: A Peek Into The Third Dimension", Proceedings of Bridges 2022: Mathematics, Art, Music, Architecture, Culture, [https://archive.bridgesmathart.org/2022/bridges2022-221.html](https://archive.bridgesmathart.org/2022/bridges2022-221.html).

![teaser of the paper](teaser.png)

If you use our code in your publications please consider citing:
```
@inproceedings{skrodzki2022Chip-Firing,
  author      = {Skrodzki, Martin and Reitebuch, Ulrich},
  title       = {Chip-Firing Revisited: A Peek into the Third Dimension},
  pages       = {221--228},
  booktitle   = {Proceedings of Bridges 2022: Mathematics, Art, Music, Architecture, Culture},
  year        = {2022},
  editor      = {Reimann, David and Norton, Douglas and Torrence, Eve},
  isbn        = {978-1-938664-42-7},
  issn        = {1099-6702},
  publisher   = {Tessellations Publishing},
  address     = {Phoenix, Arizona},
  url         = {http://archive.bridgesmathart.org/2022/bridges2022-221.html}
}
```
Whenever using this repository please also attribute the code to Robert Kirsten-Cumming and Martin Skrodzki.

Find the published version of the paper [here](https://archive.bridgesmathart.org/2022/bridges2022-221.html).

## License and third-party software
The source code in this repository is released under the MIT License. However, all third-party software libraries that are used are governed by their respective licenses. Without the following libraries, this project would have been considerably harder: 
[three.js](https://threejs.org/)
[math.js](https://mathjs.org/)
[node.js](https://nodejs.org/en)
[parcel.js](https://parceljs.org/)

## Project Setup
- Make sure you have Node.js installed on your device. If you are uncertain whether you already have node installed, run the command `node -v` in your terminal.
- Navigate to the `CF3D` folder and in the folder, run the command `npm install` to install all necessary packages for the project.

To run CF3D: 
- In the folder `CF3D`, run the command `npx parcel ./src/index.html` in your terminal.
- Open the subsequent link (e.g. http://localhost:1234) once the project has been built.

## Notes:
- The chip-firing visualiser and the neighbourhood editor cannot render simultaneously in order to avoid performance issues. Hovering over one of the editors with the mouse will cause the other to freeze.
- Disabling rendering while firing has no performance benefits in the current version of CF3D.

## Troubleshooting
Deleting the folders `node_modules`, `.parcel-cache`, and `dist` and running the command `npm install` again should solve most issues.


