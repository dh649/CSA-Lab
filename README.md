# CSA Lab

A study app for AP Computer Science A (Units 1 and 2), built as one HTML file. Open `index.html` in a browser.

## What's inside
- **Step-through debugger**: a small Java interpreter that runs code line by line and shows variables, method frames and console output at each step.
- **Lessons**: 19 topics (1.3 to 1.15, 2.1 to 2.12), each with short cards and runnable examples.
- **Practice**: 114 questions (trace the code, bug hunt, fill the blank, concept checks), weakest topics first.
- **Review pile**: missed questions come back right away, then after 1, 3, 7 and 14 days.
- **Write code**: 29 free-response style problems. Write the method, run it against test cases, step through your own code on any failing test, get hints, or ask Claude to review it (Claude review works in the claude.ai version only).
- **Playground**: write and step through your own code.
- **Sound**: retro 8-bit and keyboard-click sound effects, synthesized in the browser (no audio files), with a mute button that remembers your choice.

Progress is saved in your browser (localStorage), so it does not sync between devices.

## How answers are checked
`tools/build.js` compiles and runs every question with real Java (`tools/Harness.java`) and checks that:
- trace answers come from real Java output, and no wrong option matches it
- every fill-in wrong option really fails, and the right one gives the expected output
- every bug-hunt fix works and the buggy version does not
- every Write code reference solution passes its tests, and every common wrong solution fails at least one
- the in-page interpreter gives the same result as Java for every program

## Building
```
javac tools/Harness.java
node tools/build.js      # verify questions, writes build/data.json
node tools/assemble.js   # writes dist/index.html
```
Source: `src/engine.js` (interpreter), `src/content.js` (lessons and questions), `src/problems.js` (Write code problems), `src/app.js` (UI), `src/shell.html` (page and styles).
