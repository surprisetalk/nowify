////////////////////////////////////////////////////////////////////////////////

import { parse as parseArgs } from "https://deno.land/std/flags/mod.ts";

import { DB } from "https://deno.land/x/sqlite/mod.ts";

import { readKeypress } from "https://deno.land/x/keypress@0.0.11/mod.ts";

////////////////////////////////////////////////////////////////////////////////

// TODO: rendering options
// TODO: routine-specific hooks (execute bash)
// TODO: routines (.config)
// TODO: allow for different frontends (esp. webapp/localhost)
// TODO: remap keys
// TODO: if you want to use envvars, pass them into the cli via --config $NOWIFY_CONFIG

const { _: args, help } = parseArgs(
  Deno.args,
  {
    default: {
      help: false,
      config: `TODO`,
    },
    boolean: ["help"],
    string: ["config"],
    alias: { h: "help", c: "config" },
  },
);

const command = args.join(` `).trim();

////////////////////////////////////////////////////////////////////////////////

// TODO: what to do if nowify db is not found? ask where to create new?
const db = new DB(`nowify.db`);

db.execute(`
  create table if not exists log
  ( created_at timestamp not null default current_timestamp
  , event text not null check (event <> '')
  , action text not null check (action in ('start','skip','more','done'))
  )
`);
db.execute(`
  create index if not exists log_idx on log
  ( created_at
  , action
  )
`);

// TODO: parse .config/routine.csv
const routines = [
  {
    event: "exercise-1",
    desc: "Did you exercise and listen to an audiobook? (1)",
    duration: 25,
    days: "MTWRFAU",
    start: 4,
    end: 10,
  },
  {
    event: "exercise-2",
    desc: "Did you exercise and listen to an audiobook? (2)",
    duration: 25,
    days: "MTWRFAU",
    start: 10,
    end: 14,
  },
];

const routinesKeys = ["id", ...Object.keys(routines?.[0] ?? {})]; // TODO: kludge
const routinesVals = routines.map(
  (o: Record<string, unknown>, id) =>
    routinesKeys.map((k) => `'${{ id, ...o }[k]}'`),
);

const next = () => {
  const routinesVals_ = routinesVals.map((x) => `(${x.join(",")})`).join(",");
  const [[event, desc] = []] = db.query(`
    with r (${routinesKeys.join(",")}) as (values ${routinesVals_})
    select r.event, r.desc
    from r
    left join log l on l.event = r.event and l.action = 'start'
    where cast(strftime('%H', datetime(current_timestamp,'localtime')) as integer) between r.start and r.end
      and 0 < instr(days, case strftime('%w',datetime(current_timestamp,'localtime')) when '0' then 'U' when '1' then 'M' when '2' then 'T' when '3' then 'W' when '4' then 'R' when '5' then 'F' when '6' then 'A' end)
      and r.event not in (
        select event
        from log
        where created_at > datetime(current_timestamp, 'start of day', 'localtime') 
          and (action = 'done' or action = 'skip' and created_at > datetime(current_timestamp,'-40 minutes'))
      )
    order by l.created_at asc nulls last, r.id asc
    limit 1
  `) ?? [];
  if (!event || !desc) return null;
  db.query(
    `insert into log (event, action) values (?, 'start')`,
    [event as string],
  );
  return { event, desc };
};

switch (help ? `help` : command) {
  case "cli": {
    let row = next();
    console.log(row);
    for await (const keypress of readKeypress()) {
      if (keypress.ctrlKey && keypress.key === "c") break;
      if (!row) break;
      const keymap = {
        d: `done`,
        s: `skip`,
        n: `more`,
      };
      // TODO: make sure that start of day is current timezone
      switch (keypress.key) {
        case "done":
          // TODO
          break;
        case "skip":
          // TODO
          break;
        case "more":
          // TODO
          break;
        default:
          // TODO
          console.log(keypress);
          break;
      }
      row = next();
      console.log(row);
    }
    break;
  }

  case "stats":
    // TODO
    break;

  case "annoy": {
    // TODO: create docs for how to run this inline like `watch -n 2 -c deno annoy.ts`
    // TODO: don't beep if something has been started and its routine still might be active or more time was allottedd
    const [t, event, action] = db.query(
      `select created_at, event, action from log order by created_at desc limit 1`,
    ) ?? [];
    console.log(t, event, action);
    // TODO: do something more extreme than a beep if nowify hasn't been run lately
    await Deno.run({
      cmd: `afplay -v 5 /System/Library/Sounds/Morse.aiff`.split(` `),
    }).status();
    break;
  }

  case "export":
    // TODO
    break;

  case "server":
    // TODO
    break;

  default:
    console.log(`invalid command: '${command}'`);
    // falls through
  case "":
  case "help":
    console.log([
      "usage blah blah blah",
      "TODO",
      "TODO",
    ].join(`\n`));
    break;
}

db.close();
