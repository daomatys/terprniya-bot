import 'dotenv/config';

import Database from 'better-sqlite3';

import { SQLite } from "@telegraf/session/sqlite";
import { SessionStore, Telegraf, session } from 'telegraf';
import { Message } from 'telegraf/types';
import { message } from 'telegraf/filters';
import { defineCurrentwon_date, defineRandomInt, setCountSuffix } from './utils';
import { clownReaction, rankedIndication } from './variables';
import { UserHookType, TableHookType, MiscHookType } from './types';

const db = new Database(process.env.DBPATH, { verbose: console.log });

const defineTableId = (msg: Message) => {
  return msg.chat.id.toString().replace(/^\D*/, '');
};

const createNewTable = (msg: Message) => db
  .prepare(`
    CREATE TABLE IF NOT EXISTS "${defineTableId(msg)}" (
      "id"       INTEGER,
      "user_id"  TEXT,
      "name"     TEXT,
      "count"    INTEGER DEFAULT 0,
      "won_date" TEXT,
    PRIMARY KEY("id" AUTOINCREMENT)
    );`)
  .run();

const dbUsers: UserHookType = (msg) => db.prepare(
  `SELECT name, count FROM "${defineTableId(msg)}";`
);

const dbUserById: UserHookType = (msg) => db.prepare(
  `SELECT name, count FROM "${defineTableId(msg)}" WHERE id = :id;`
);

const dbUserWrite: UserHookType = (msg) => db.prepare(
  `INSERT INTO "${defineTableId(msg)}" (user_id, name) VALUES (:user_id, :name);`
);

const dbUserUpdate: UserHookType = (msg) => db.prepare(
  `UPDATE "${defineTableId(msg)}" SET count = count + 1, won_date = :won_date WHERE id = :id;`
);

const dbUserIsClone: UserHookType = (msg) => db.prepare(
  `SELECT id FROM "${defineTableId(msg)}" WHERE user_id = :user_id;`
);

const dbTableLength: TableHookType = (tableId) => db.prepare(
  `SELECT id FROM "${tableId}" ORDER BY id DESC LIMIT 1;`
);

const dbUserByWonDate: UserHookType = (msg) => db.prepare(
  `SELECT user_id FROM "${defineTableId(msg)}" WHERE won_date = :won_date;` 
);

const dbIsTableExist: MiscHookType = () => db.prepare(
 `SELECT name FROM sqlite_master WHERE type='table' AND name= :name;`
);

const store: SessionStore<{}> = SQLite({ database: db });

const bot = new Telegraf(process.env.TG_TOKEN || '');

bot.use(session({ store }));

bot.command('start', async (ctx) => {
  await ctx.reply('ЩА Я ВАС РАЗЪИБУ даб даб даб...');
  
  createNewTable(ctx.message);
});

bot.command('spisok', async (ctx) => {
  const { message } = ctx;

  const spisokTitle = `СКОКА КТО ТЕРПЕЛ В ЧАТЕ "${defineTableId(message)}"\n\n`;
  const spisokBody = dbUsers(message)
    .all({})
    .map((item, i) => {
      if (!item || item.count < 1) return;

      const labelSymbol = i < 3 ? rankedIndication[i] : `${i}:`;

      return `${labelSymbol} ${item?.name} — ${item?.count} раз${setCountSuffix(item.count ?? 0)}!`;
    })
    .join('\n');
  
  await ctx.reply(`<code>${spisokTitle}${spisokBody}</code>`, { parse_mode: 'HTML' });
});

bot.on(message(), async (ctx) => {
  const { message } = ctx;

  const isTableExist = dbIsTableExist().get({ name: defineTableId(message) })?.name;

  if (!isTableExist) {
    await ctx.reply(`ДАЛБАЙОП СКОМАНДУЙ /start@terpilniy_bot`);
    return;
  }

  const todaywon_date = defineCurrentwon_date();

  const isSenderClone = dbUserIsClone(message).get({ user_id: `${message.from.id}` })?.id;

  if (!isSenderClone) {
    const { first_name, id } = message.from
    dbUserWrite(message).run({ name: first_name, user_id: `${id}` });

    await ctx.reply(`${first_name} - НОВЫЙ УЧАСТНИК ШИЗОЛОТЕРЕИ ТЕРПЕНИЯ, ДАБ ДАБ ДАБ`);
  }

  const dbTodayWinner = dbUserByWonDate(message).get({ won_date: todaywon_date });

  if (!dbTodayWinner) {
    const tableId = defineTableId(message);
    const length = dbTableLength(tableId).get({})?.id;

    const luckyId = defineRandomInt(length!);

    dbUserUpdate(message).run({ id: luckyId, won_date: todaywon_date });
    
    const luckyName = dbUserById(message).get({ id: luckyId })?.name;
    
    await ctx.reply(`${luckyName} - СЕДНЯ ТЕРПИТ ВЕСЬ ДЕНЬ, ТЕРПИ РОДНОЙ`);
  }

  if (dbTodayWinner && `${message.from.id}` === dbTodayWinner.user_id) {

    await ctx.react(clownReaction);
  }
});

bot.on('poll', console.log);

bot.launch();

process.once('SIGINT', () => {
  bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
  bot.stop('SIGTERM');
});
