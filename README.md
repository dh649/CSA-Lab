# CSA Lab

A study app for AP Computer Science A (Units 1 and 2), built as one HTML file. Open `index.html` in a browser.

## What's inside
- **Step-through debugger**: a small Java interpreter that runs code line by line and shows variables, method frames and console output at each step.
- **Lessons**: 19 topics (1.3 to 1.15, 2.1 to 2.12), each with short cards and runnable examples.
- **Practice**: 114 questions (trace the code, bug hunt, fill the blank, concept checks), weakest topics first.
- **Review pile**: missed questions come back right away, then after 1, 3, 7 and 14 days.
- **Playground**: write and step through your own code.

Progress is saved in your browser (localStorage), so it does not sync between devices.

## How answers are checked
`tools/build.js` compiles and runs every question with real Java (`tools/Harness.java`) and checks that:
- trace answers come from real Java output, and no wrong option matches it
- every fill-in wrong option really fails, and the right one gives the expected output
- every bug-hunt fix works and the buggy version does not
- the in-page interpreter gives the same result as Java for every program

## Building
```
javac tools/Harness.java
node tools/build.js      # verify questions, writes build/data.json
node tools/assemble.js   # writes dist/index.html
```
Source: `src/engine.js` (interpreter), `src/content.js` (lessons and questions), `src/app.js` (UI), `src/shell.html` (page and styles).
