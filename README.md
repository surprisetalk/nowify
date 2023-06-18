![nowify stats](https://taylor.town/nowify-stats.png)

![nowify routines](https://taylor.town/nowify-routines.jpg)

![nowify](https://taylor.town/nowify.png)

# nowify

Nowify is an opinionated time management system based on the following
principles:

- **"don't make me think"**: design your life and let a computer calculate your
  next moves
- **push over pull**: active/annoying systems are better than passive ones
- **active feedback**: use simple stats to see yourself more clearly
- **meta-routines**: humans change -- use a system to update your system
- **bite-sized**: modular without being fancy

## how to use

Download the [latest release](https://github.com/surprisetalk/nowify/releases)
or build with `deno compile -A nowify.ts`;

### configuration

Add a routines config to `~/.config/nowify/routines.csv`.

<details>

<summary>example `routines.csv`</summary>

```
days, start, end, duration, score, event, desc
MTWRFAU, 0400, 1000,  2, 1, review-calendar , Did you review your daily/weekly calendar? Do all calendar events have end-scenarios? Are there any unnecessary plans that need to be cancelled?
MTWRFAU, 0400, 1000, 25, 1, fresh-air       , Did you get 2 minutes of fresh air?
MTWRFAU, 0400, 1000, 25, 2, exercise-1      , Did you exercise and listen to an audiobook? (1)
MTWRFAU, 1000, 1400, 25, 2, exercise-2      , Did you exercise and listen to an audiobook? (2)
MTWRFAU, 1400, 1800, 25, 2, exercise-3      , Did you exercise and listen to an audiobook? (3)
MTWRFAU, 0400, 2000,  2, 1, review-tasks    , Did you review your tasks? Mark all urgent/important tasks in `inbox` and `next-personal` and `next-career`.
MTWRFAU, 0400, 2000, 10, 1, break-down-tasks, What are you avoiding? Did you mark all scary tasks? Break down your tasks into "mindless" ones!
MTWRFAU, 0400, 2000, 25, 1, urgent-important, Are there any urgent/important tasks? Do them now or schedule them on the calendar.
MTWRFAU, 0400, 2000,  2, 1, work-laws       , Did you meditate on your "rules for good work"? Did you use them to refine your task list?
MTWRFAU, 0400, 2000,  2, 1, delegate        , Can any of these tasks be delegated?
MTWRFAU, 0400, 2000,  2, 1, cheat-codes     , Do any of your tasks or projects have "cheat-codes"? Can any of them be solved in creative/unconventional ways?
MTWRFAU, 0400, 2000, 20, 1, meal-prep       , Is all the food prepared? Are all the veggies sliced/steamed? Are all the things cooked? Take 20 minutes to prepare as much food as possible!
MTWRFAU, 1000, 1200, 25, 1, fuel-1          , Did you eat ~650 calories and take supplements? (1)
MTWRFAU, 1200, 1400, 25, 1, fuel-2          , Did you eat ~650 calories and take supplements? (2)
MTWRFAU, 1400, 1600, 25, 1, fuel-3          , Did you eat ~650 calories and take supplements? (3)
MTWRFAU, 1600, 1900, 25, 1, fuel-4          , Did you eat ~650 calories and take supplements? (4)
MTWRFAU, 0400, 2000,  2, 1, reach-out       , Did you reach out to somebody new?
MTWRFAU, 0400, 2000,  5, 1, flash-cards     , Did you do a round of spaced-repetition cards?
MTWRFAU, 0400, 1300, 20, 1, spark-joy       , What parts of the home are unhappy? Create tasks to take everything out and put it in a pile!
MTWRFAU, 0500, 2000, 25, 1, tidy-1          , Is the house tidy? (1)
MTWRFAU, 1300, 2100,  2, 1, time            , What are you wasting your life on? What's friction? What's bullsh*t? Delete bullsh*t tasks! Create tasks to preserve wasted time/energy/money!
MTWRF  , 0400, 2000, 25, 4, career-1        , Work on deep career tasks for 25 minutes (1).
MTWRF  , 0400, 2000, 25, 4, career-2        , Work on deep career tasks for 25 minutes (2).
MTWRF  , 0400, 2000, 25, 4, career-3        , Work on deep career tasks for 25 minutes (3).
MTWRF  , 0400, 2000, 25, 4, career-4        , Work on deep career tasks for 25 minutes (4).
MTWRF  , 0400, 2000, 25, 4, career-5        , Work on deep career tasks for 25 minutes (5).
MTWRF  , 0400, 2000, 25, 4, career-6        , Work on deep career tasks for 25 minutes (6).
MTWRF  , 0400, 2000, 25, 4, career-7        , Work on deep career tasks for 25 minutes (7).
MTWRF  , 0400, 2000, 25, 4, career-8        , Work on deep career tasks for 25 minutes (8).
MTWRF  , 0400, 2000,  5, 1, clear-github    , Spend 5 minutes clearing out GitHub notifications! Create tasks in `next-career.txt`.
MTWRF  , 0400, 2000, 10, 1, clear-slack-c   , Did you spend 10 minutes clearing out Slack channels?
MTWRF  , 0400, 2000, 10, 1, clear-slack-m   , Are Slack mentions at inbox-zero?
MTWRFAU, 0400, 2000,  1, 1, new-tunes       , Are you listening to new tunes?
MTWRFAU, 0400, 2000,  2, 1, fighting        , Where are you fighting Nature? Where are you embracing Nature?
MTWRFAU, 0400, 2000,  2, 1, meaning         , What can I do to find meaning today?
MTWRFAU, 0400, 2000,  2, 1, serendipity     , How can I improve my serendipity? How can I improve my luck surface-area? How can I attune myself to Magic?
MTWRFAU, 0400, 2000,  2, 1, unstuck         , Stop skipping tasks and routines! Create tasks to ask wife for help getting unstuck (or delegate altogether) on `next-personal` and `next-career`.
MTWRFAU, 0400, 2000,  2, 1, invert-goals    , If I want to be happy and successful, what should I avoid?
MTWRFAU, 0400, 2000,  2, 1, excuses         , Where am I practicing "learned helplessness"? Where am I playing a victim? Where am I ceding my locus-of-control? Where am I making excuses?
MTWRFAU, 0400, 2000,  2, 1, fear            , What are you afraid of? Create tasks to tackle fear directly!
MTWRFAU, 0400, 2000,  2, 1, mindlessness    , What are you doing mindlessly? What are you doing half-heartedly? Create tasks to renew your passion and commit!
MTWRFAU, 0400, 2000,  1, 1, review-routines , What tasks are not getting done? What tasks/routines are being skipped? Add tasks to `inbox.txt` that will improve task and routine systems.
MTWRFAU, 0400, 2000,  2, 1, shuffle-routines, What routines are being neglected? Review and re-prioritize `routines.csv`.
MTWRFAU, 0400, 2000,  2, 1, willpower       , Where am I erroneously relying upon willpower rather than systems? How can I build zero-effort habits? Where am I telling myself "just try harder"?
MTWRFAU, 1600, 2100,  2, 1, review-finances , Did you review your last week of purchases on Copilot?
MTWRFAU, 1100, 2100,  2, 1, desire          , What do you want? What are you waiting for? Let go! Decide now is good enough! You have enough time and money and energy! Be grateful!
MTWRFAU, 0400, 2000,  2, 1, pto             , Are `next-personal.txt` and Apple Reminders growing too large? Request a day off!
MTWRFAU, 0400, 2000,  2, 1, retreat         , Do you need to book any vacations or taycations or seasonal retreats or therapeudic trips? You don't need an excuse! Book the next 2 months in advance!
MTWRFAU, 0400, 2000, 10, 1, body            , Listen to your body! Are you tired or unmotivated? Realign your inspiration and values! Who are you becoming?
MTWRFAU, 1000, 2100, 10, 1, clear-texts     , Did you spend 10 minutes cleaning out iMessage and Signal and WhatsApp?
MTWRFAU, 0400, 2000, 10, 1, clear-emails    , Did you spend 10 minutes cleaning out emails?
MTWRFAU, 1500, 2100,  5, 1, clear-phone     , Did you spend 5 minutes clearing out phone notifications?
MTWRFAU, 0400, 1800, 10, 1, clear-tabs      , Did you spend 10 minutes cleaning browser tabs on all devices?
MTWRFAU, 0400, 2100,  5, 1, memes           , Send a meme or short hello to some people!
MTWRFAU, 0400, 2100, 10, 1, clear-task-inbox, Did you spend 10 minutes making all items in `inbox.txt` actionable and time-bounded? Did you clear `inbox.txt`?
MTWRFAU, 0400, 2100,  5, 1, waiting         , Is there anything that needs to be activated from `waiting.txt`?
MTWRFAU, 0400, 2100, 15, 1, bucket-list     , Add bucket-list items to upcoming projects. Don't be a perfectionist -- start simply!
MTWRFAU, 0400, 2000, 25, 3, personal-1      , Do stuff (1)!
MTWRFAU, 0400, 2000, 25, 3, personal-2      , Do stuff (2)!
MTWRFAU, 0400, 2000, 25, 3, personal-3      , Do stuff (3)!
MTWRFAU, 0400, 2000, 25, 3, personal-4      , Do stuff (4)!
MTWRFAU, 0400, 2000, 25, 3, personal-5      , Do stuff (5)!
MTWRFAU, 0400, 2000, 25, 3, personal-6      , Do stuff (6)!
MTWRFAU, 0400, 2000, 25, 3, personal-7      , Do stuff (7)!
MTWRFAU, 0400, 2000, 25, 3, personal-8      , Do stuff (8)!
MTWRFAU, 0400, 2000, 25, 3, personal-9      , Do stuff (9)!
MTWRFAU, 0400, 2000, 25, 3, personal-10     , Do stuff (10)!
MTWRFAU, 0400, 2000, 25, 3, personal-11     , Do stuff (11)!
MTWRFAU, 0400, 2000, 25, 3, personal-12     , Do stuff (12)!
```

</details>

### make it annoying

Use any cron program to make nowify check for overdue items and beep:

```bash
watch -n 5 -c nowify annoy
```

### go for it

Start up the nowify client to mark routines:

```bash
nowify cli
```

Check out your progress over time:

```bash
nowify stats
```

