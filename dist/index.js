"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
require("dotenv/config");
const better_sqlite3_1 = tslib_1.__importDefault(require("better-sqlite3"));
const sqlite_1 = require("@telegraf/session/sqlite");
const telegraf_1 = require("telegraf");
const filters_1 = require("telegraf/filters");
const utils_1 = require("./utils");
const variables_1 = require("./variables");
const db = new better_sqlite3_1.default(process.env.DBPATH, { verbose: console.log });
const defineTableId = (msg) => {
    return msg.chat.id.toString().replace(/^\D*/, '');
};
const createNewTable = (msg) => db
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
const dbUsers = (msg) => db.prepare(`SELECT name, count FROM "${defineTableId(msg)}";`);
const dbUserById = (msg) => db.prepare(`SELECT name, count FROM "${defineTableId(msg)}" WHERE id = :id;`);
const dbUserWrite = (msg) => db.prepare(`INSERT INTO "${defineTableId(msg)}" (user_id, name) VALUES (:user_id, :name);`);
const dbUserUpdate = (msg) => db.prepare(`UPDATE "${defineTableId(msg)}" SET count = count + 1, won_date = :won_date WHERE id = :id;`);
const dbUserIsClone = (msg) => db.prepare(`SELECT id FROM "${defineTableId(msg)}" WHERE user_id = :user_id;`);
const dbTableLength = (tableId) => db.prepare(`SELECT id FROM "${tableId}" ORDER BY id DESC LIMIT 1;`);
const dbUserByWonDate = (msg) => db.prepare(`SELECT user_id FROM "${defineTableId(msg)}" WHERE won_date = :won_date;`);
const dbIsTableExist = () => db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name= :name;`);
const store = (0, sqlite_1.SQLite)({ database: db });
const bot = new telegraf_1.Telegraf(process.env.TG_TOKEN || '');
bot.use((0, telegraf_1.session)({ store }));
bot.command('start', (ctx) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    yield ctx.reply('ЩА Я ВАС РАЗЪИБУ даб даб даб...');
    createNewTable(ctx.message);
}));
bot.command('spisok', (ctx) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { message } = ctx;
    const spisokTitle = `СКОКА КТО ТЕРПЕЛ В ЧАТЕ "${defineTableId(message)}"\n\n`;
    const spisokBody = dbUsers(message)
        .all({})
        .map((item, i) => {
        var _a;
        if (!item || item.count < 1)
            return;
        const labelSymbol = i < 3 ? variables_1.rankedIndication[i] : `${i}:`;
        return `${labelSymbol} ${item === null || item === void 0 ? void 0 : item.name} — ${item === null || item === void 0 ? void 0 : item.count} раз${(0, utils_1.setCountSuffix)((_a = item.count) !== null && _a !== void 0 ? _a : 0)}!`;
    })
        .join('\n');
    yield ctx.reply(`<code>${spisokTitle}${spisokBody}</code>`, { parse_mode: 'HTML' });
}));
bot.on((0, filters_1.message)(), (ctx) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const { message } = ctx;
    const isTableExist = (_a = dbIsTableExist().get({ name: defineTableId(message) })) === null || _a === void 0 ? void 0 : _a.name;
    if (!isTableExist) {
        yield ctx.reply(`ДАЛБАЙОП СКОМАНДУЙ /start@terpilniy_bot`);
        return;
    }
    const todaywon_date = (0, utils_1.defineCurrentwon_date)();
    const isSenderClone = (_b = dbUserIsClone(message).get({ user_id: `${message.from.id}` })) === null || _b === void 0 ? void 0 : _b.id;
    if (!isSenderClone) {
        const { first_name, id } = message.from;
        dbUserWrite(message).run({ name: first_name, user_id: `${id}` });
        yield ctx.reply(`${first_name} - НОВЫЙ УЧАСТНИК ШИЗОЛОТЕРЕИ ТЕРПЕНИЯ, ДАБ ДАБ ДАБ`);
    }
    const dbTodayWinner = dbUserByWonDate(message).get({ won_date: todaywon_date });
    if (!dbTodayWinner) {
        const tableId = defineTableId(message);
        const length = (_c = dbTableLength(tableId).get({})) === null || _c === void 0 ? void 0 : _c.id;
        const luckyId = (0, utils_1.defineRandomInt)(length);
        dbUserUpdate(message).run({ id: luckyId, won_date: todaywon_date });
        const luckyName = (_d = dbUserById(message).get({ id: luckyId })) === null || _d === void 0 ? void 0 : _d.name;
        yield ctx.reply(`${luckyName} - СЕДНЯ ТЕРПИТ ВЕСЬ ДЕНЬ, ТЕРПИ РОДНОЙ`);
    }
    if (dbTodayWinner && `${message.from.id}` === dbTodayWinner.user_id) {
        yield ctx.react(variables_1.clownReaction);
    }
}));
bot.on('poll', console.log);
bot.launch();
process.once('SIGINT', () => {
    bot.stop('SIGINT');
});
process.once('SIGTERM', () => {
    bot.stop('SIGTERM');
});
//# sourceMappingURL=index.js.map