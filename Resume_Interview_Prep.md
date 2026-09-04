# Resume Grilling Questions

Use this to interview yourself out loud before anyone else does. If you can't answer one of these in under 90 seconds without notes, that's the line to go re-learn before an actual interview — especially anywhere the wording on the resume got more technical than the plain version you first described to me.

## Opening / general

- Walk me through your resume in two minutes.
- Which of these five projects are you proudest of, and which one would you cut if you had to?
- Everything here is high school work except leakcheck — how do you talk about that honestly without sounding like you're overselling a class project?
- Which of these were solo and which were team? For the team ones, what specifically did *you* write versus your teammates?
- If I opened your GitHub right now, what would I actually find?

## leakcheck (Python, AST, dataflow analysis)

- Walk me through what your code does when it sees `df['x'].shift(-1)`. What node types is it looking at in the AST?
- What's the actual data structure you use to track a variable's "time offset" as it flows through the program? Is it a dict keyed on variable name, or something smarter that handles reassignment and scope?
- Give me a false positive your analyzer would flag that isn't actually leakage. How would you fix that without breaking real detections?
- Give me a case of real leakage your analyzer would *miss*. Every static analyzer has blind spots — what's yours?
- You said the backtesting engine "blocks forward-looking reads at the data-access level." Show me the actual mechanism — what happens if code tries to read `data[t+1]` at time `t`? Does it throw, return NaN, or something else?
- Walk me through the regression test where a cheating strategy earns nothing. What does the cheating strategy actually do, and how do you know your engine caught it and not something else in the test?
- Why AST analysis instead of just running the code and checking outputs? What can static analysis catch that a runtime check can't, and vice versa?
- What's the time complexity of your dataflow pass on a large file? Have you run it on anything beyond your own test cases?

## Momentum (Scrum Master/PM role + the build)

- You were Scrum Master for a 4-person team — what did a typical sprint actually look like? Who set the sprint goals?
- Give me a sprint that went badly. What did the retrospective actually change afterward?
- You "translated requirements into a sprint backlog" — walk me through one specific requirement and how it became a backlog item, then a task, then code.
- What's a decision your team made in sprint planning that you disagreed with? What happened?
- On the technical side: how does the CO2 calculator actually work — where do the emissions-per-mile numbers come from, and did you validate them against anything?
- Walk me through what happens end-to-end when a user clicks "Get Route" — from the button click to the API call to the map redraw.
- You used Supabase for auth — what's actually stored client-side to keep someone logged in, and what happens if that gets stolen?
- If Momentum had another sprint, what's the next feature you'd build, and why that one?

## Air Trajectory (Fusion 360, CAD, FMEA, airflow simulation)

- Walk me through why you needed 9+ prototypes. What specifically failed or changed between, say, prototype 3 and prototype 4?
- What variable were your airflow simulations actually testing? What would a bad result look like, and what did you change in response to one?
- Explain FMEA to someone who's never heard of it, using an actual failure mode from your build as the example.
- You "processed calibration data into trajectory-prediction graphs" — what tool did you use to do that (Excel, Python, by hand), and what's actually on the axes?
- Walk me through calling a shot live during competition using your graph. What inputs did you read off the target, and what output did that give you?
- What's the difference between the short-tube and long-tube calibration configurations, and why did you need both?
- If you had one more design iteration before Nationals-level competition, what would you change?

## The Heist (C#, custom game engine)

- Walk me through how your collision system decides whether the player hit a wall from the top versus the side.
- Why build collision detection and physics from scratch instead of using an existing engine like Unity or MonoGame's built-ins? What was the actual constraint that forced that?
- Walk me through your CSV level format — what does a single number in that file actually mean, and how does your loader turn it into a tile with the right collision behavior?
- How does your leaderboard system decide someone's rank — what happens if two scores tie?
- What's the trickiest bug you hit in this project, and how did you find it?
- What would break if you added double-height tiles or diagonal collision to your current system?

## Self-Sustaining Garden (Arduino, C/C++)

- Walk me through your firmware's main loop — what does it read, and how often?
- What's the actual threshold logic for turning the pump on? Is it a fixed moisture value, or something more adaptive?
- What happens if a sensor fails or gives a garbage reading — does the pump fail safe (off) or fail open (on)?
- Why Arduino/C/C++ instead of something higher-level like MicroPython or a Raspberry Pi?
- Walk me through what "self-sustaining off natural rainfall and sunlight" actually means mechanically — what's the solar setup charging, and what happens on a cloudy week?
- It's deployed at Marymoor Community Garden — who's maintaining it now that you're at UW, and what happens when something breaks?

## The numbers you claimed — be ready to defend every one of these cold

- $30K annual Science Olympiad budget, across 7 sub-teams and 104 students — where did that money come from, and what's it actually spent on?
- $22K raised for the elementary Science Olympiad camp — raised how, from whom?
- $20K for prom (if you put Senior Class President back on) — same question.
- 9+ prototypes for Air Trajectory — can you actually name what changed in each one if pushed?
- 6 two-week Momentum sprints — what got shipped in sprint 1 vs. sprint 6?
- FBLA: national 7th in Banking & Financial Systems, 2nd at state in Sales Presentation — what was the actual competition format, and what's one specific thing the judges pushed back on?

## Skills section — assume they'll test it

- Pick one language on your skills list at random and be ready to write a short function live: reverse a linked list in C#, parse a CSV in Python, write a basic SQL join.
- For "SQL" specifically — what's the last query you actually wrote, and for which project? (Momentum's Supabase/Postgres backend is your real answer here — know it.)
- For "C/C++" — the honest answer is Arduino firmware, not systems programming. If someone asks "have you done C++ outside embedded work," don't pretend otherwise.

## Behavioral, tied directly to your leadership lines

- Tell me about a time you had to make a budget call as treasurer that someone disagreed with.
- Tell me about a conflict on the Momentum team during a sprint, and how you resolved it as Scrum Master.
- Tell me about a time leading the Garden project when something didn't work and you had to redesign on the fly.
- Tell me about managing up — a time you had to push back on a teacher, coach, or team lead.
- What's a leadership mistake you made across any of these roles, and what would you do differently?

---

**How to actually use this:** don't just read these and nod — say your answers out loud, or better, record yourself. The ones you stumble on are the ones to go rehearse, not skip.
