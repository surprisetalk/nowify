////////////////////////////////////////////////////////////////////////////////

import { parse as parseArgs } from "https://deno.land/std@0.191.0/flags/mod.ts";

import { DB } from "https://deno.land/x/sqlite@v3.7.2/mod.ts";

import { readKeypress } from "https://deno.land/x/keypress@0.0.11/mod.ts";

import { serve } from "https://deno.land/std@0.191.0/http/server.ts";

import { readCSVObjects } from "https://deno.land/x/csv@v0.8.0/mod.ts";

////////////////////////////////////////////////////////////////////////////////

const { _: args, help, routines: csv, db: sqliteFile } = parseArgs(
  Deno.args,
  {
    default: {
      help: false,
      routines: `~/.config/nowify/routines.csv`,
      db: `nowify.db`, // TODO: Where is the best place to store this by default?
    },
    boolean: ["help"],
    string: ["routines", "db"],
    alias: { h: "help" },
  },
);

const command = args.join(` `).trim();

////////////////////////////////////////////////////////////////////////////////

const db = new DB(sqliteFile);

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

const routines = [];
const f = await Deno.open(csv.replace(`~`, Deno.env.get("HOME") ?? `~`));
for await (const routine of readCSVObjects(f)) {
  routines.push(routine);
}
f.close();

const routinesKeys = ["id", ...Object.keys(routines?.[0] ?? {})]; // TODO: kludge
const routinesVals = routines.map(
  (o: Record<string, unknown>, id) =>
    routinesKeys.map((k) => `'${{ id, ...o }[k]}'`),
);
const routinesVals_ = routinesVals.map((x) => `(${x.join(",")})`).join(",");

const start = (): { event: string; desc: string } | null => {
  const [[event, desc, isStart] = []]: [string?, string?, boolean?][] =
    db.query(`
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
      [new Date().getHours(), new Date().getMinutes(), new Date().getSeconds()]
        .join(":");
    const keymap: Record<string, string> = {
      d: `done`,
      s: `skip`,
      w: `wait`,
    };
    let row = start();
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
      row = start();
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
    const now = [
      new Date().getHours(),
      new Date().getMinutes() <= 30 ? "00" : "30",
      "00",
    ].join(":");
    for (const t of times) {
      // TODO: Rework this so that the daily wraparound can be adjusted, i.e. "midnight" can be moved around.
      const stats = Object.fromEntries(
        db.query(`
          with r (${routinesKeys.join(",")}) as (values ${routinesVals_})
          select 
            cast(julianday('now') as integer) - cast(julianday(l.created_at) as integer) as days_ago
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
    const { event } = start() ?? {};
    if (!event) break;
    // TODO: make a different sound if there's nothing started or waited but there's available routines that can be started
    const [[overdue_at] = []]: string[][] = db.query(`
      with r (${routinesKeys.join(",")}) as (values ${routinesVals_})
      select max(datetime(l.created_at,case l.action when 'start' then '+'||coalesce(r.duration,25)||' minutes' when 'wait' then '+10 minutes' end))
      from log l
      left join r on l.event = r.event
      where l.event = '${event}'
      and l.action in ('start','wait')
    `);
    if (new Date().getTime() < new Date(overdue_at).getTime()) break;
    // TODO: do something more extreme than a beep if nowify has been ignored for a long time
    // TODO: kludge
    await Deno.run({
      cmd: `afplay -v 5 /System/Library/Sounds/Morse.aiff`.split(` `),
    }).status();
    break;
  }

  // TODO: change name to "export" and add import option
  case "dump":
    console.log("created_at, event, action");
    for (const row of db.query(`select * from log`)) {
      // TODO: this doesn't escape quotes or commas
      console.log(row.join(`, `));
    }
    break;

  case "server": {
    await serve(
      (req: Request): Response => {
        const route = new URLPattern({ pathname: "/:route" }).exec(req.url)
          ?.pathname?.groups?.route ?? "";
        if (route === "event") {
          return Response.json(start(), { status: 200 });
        }
        if (["done", "skip", "wait"].includes(route)) {
          const { event } = start() ?? {};
          if (event) {
            db.query(
              `insert into log (event, action) values (?, ?)`,
              [event, route],
            );
          }
          return new Response(null, { status: 201 });
        }
        return new Response(`not found`, { status: 404 });
      },
      { port: 8000 },
    );
    break;
  }

  default:
    console.log(colors.red(`invalid command: "${command}"`));
    // falls through
  case "":
  case "help":
    // TODO
    // TODO: create docs for how to run annoy inline like `watch -n 2 -c deno annoy.ts`
    console.log([
      "usage blah blah blah",
    ].join(`\n`));
    break;
}

db.close();
