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
  , action text not null check (action in ('start','skip','wait','done'))
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
    score: 3,
  },
  {
    event: "exercise-2",
    desc: "Did you exercise and listen to an audiobook? (2)",
    duration: 25,
    days: "MTWRFAU",
    start: 10,
    end: 14,
    score: 2,
  },
  {
    event: Math.random() + "",
    desc: "Did you take a dump?",
    duration: 25,
    days: "MTWRFAU",
    start: 0,
    end: 23,
    score: Math.random() * 4,
  },
];

const routinesKeys = ["id", ...Object.keys(routines?.[0] ?? {})]; // TODO: kludge
const routinesVals = routines.map(
  (o: Record<string, unknown>, id) =>
    routinesKeys.map((k) => `'${{ id, ...o }[k]}'`),
);
const routinesVals_ = routinesVals.map((x) => `(${x.join(",")})`).join(",");

const next = () => {
  const [[event, desc, isStart] = []] = db.query(`
    with r (${routinesKeys.join(",")}) as (values ${routinesVals_})
    select r.event, r.desc, l.action is not null
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
  if (!isStart) {
    db.query(
      `insert into log (event, action) values (?, 'start')`,
      [event as string],
    );
  }
  return { event, desc };
};

const colors = {
  red: (s: string | null) => s && `\u001b[31m${s ?? ``}\u001b[39m`,
  green: (s: string | null) => s && `\u001b[32m${s ?? ``}\u001b[39m`,
  yellow: (s: string | null) => s && `\u001b[33m${s ?? ``}\u001b[39m`,
};

switch (help ? `help` : command) {
  case "cli": {
    const t = () =>
      "" + new Date().getHours() +
      ":" + new Date().getMinutes() +
      ":" + new Date().getSeconds();
    const keymap: Record<string, string> = {
      d: `done`,
      s: `skip`,
      w: `wait`,
    };
    let row = next();
    if (!row) break;
    console.log(`${colors.yellow(t())} ${row.desc}`);
    for await (const keypress of readKeypress()) {
      if (keypress.ctrlKey && keypress.key === "c") break;
      if (keymap[keypress.key as string]) {
        console.log(`${colors.green(keymap[keypress.key as string])}`);
        db.query(`insert into log (event, action) values (?, ?)`, [
          row.event as string,
          keymap[keypress.key as string],
        ]);
      } else {
        console.log(colors.red(`usage: d (done), s (skip), w (wait)`));
      }
      row = next();
      if (!row) break;
      console.log(`\n${colors.yellow(t())} ${row.desc}`);
    }
    break;
  }

  case "stats": {
    console.log();
    const times = db.query(`
      with recursive times(t) as (
        values('04:00:00')
        union all
        select time(t, '+30 minutes')
        from times
        where t < '23:00:00'
      )
      select * from times
    `).map((x) => x?.[0]) as string[];
    const now = "15:00:00"; // TODO
    for (const t of times) {
      const stats = Object.fromEntries(
        db.query(`
          with r (${routinesKeys.join(",")}) as (values ${routinesVals_})
          select 
            cast(julianday('now') - julianday(datetime(l.created_at,'localtime')) as integer) as days_ago
            , max(coalesce(score,1)) as score
          from log l
          left join r on l.event = r.event
          where l.action = 'done'
            and time(datetime(l.created_at,'localtime')) between '${t}' and time('${t}', '+29 minutes', '+59 seconds')
        `).filter((row) => row?.[0] !== null),
      );
      console.log(
        t.match(/^([0-9]{2}):00:00$/)?.[1] ?? `  `,
        ` `,
        Array(61).fill(0)
          .map((_, i) =>
            null ??
              (t === now ? colors.red : colors.green)(
                [null, `░`, `▒`, `▓`, `█`][stats[i] ?? 0],
              ) ??
              (i % 7 === 0 ? colors.yellow(`┊`) : ` `)
          )
          .join(``),
      );
    }
    console.log();
    break;
  }

  case "annoy": {
    // TODO: create docs for how to run this inline like `watch -n 2 -c deno annoy.ts`
    // TODO: don't beep if something has been started and its routine still might be active or more time was allottedd
    const { event } = next() ?? {};
    if (!event) break;
    const [[overdue_at] = []]: string[][] = db.query(`
      with r (${routinesKeys.join(",")}) as (values ${routinesVals_})
      select max(datetime(l.created_at,'+'||coalesce(r.duration,25)||' minutes'))
      from log l
      left join r on l.event = r.event
      where l.event = '${event}'
      and l.action in ('start','wait')
    `);
    if (new Date().getTime() < new Date(overdue_at).getTime()) break;
    // TODO: automatically start things if nothing is going?
    // TODO: do something more extreme than a beep if nowify has been ignored for a long time
    // TODO: kludge
    await Deno.run({
      cmd: `afplay -v 5 /System/Library/Sounds/Morse.aiff`.split(` `),
    }).status();
    break;
  }

  case "dump":
    console.log("created_at, event, action");
    for (const row of db.query(`select * from log`)) {
      // TODO: this doesn't escape quotes or commas
      console.log(row.join(`, `));
    }
    break;

  case "server":
    // TODO
    break;

  default:
    console.log(colors.red(`invalid command: "${command}"`));
    // falls through
  case "":
  case "help":
    // TODO
    console.log([
      "usage blah blah blah",
      "TODO",
      "TODO",
    ].join(`\n`));
    break;
}

db.close();
