"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineCurrentwon_date = exports.defineRandomInt = exports.setCountSuffix = void 0;
const tslib_1 = require("tslib");
const dayjs_1 = tslib_1.__importDefault(require("dayjs"));
const setCountSuffix = (a) => ((Math.floor(a / 10) == 1) ||
    (a % 10 < 2) ||
    (a % 10 > 4)
    ? ''
    : 'а');
exports.setCountSuffix = setCountSuffix;
const defineRandomInt = (max) => (1 + Math.floor(Math.random() * Math.floor(max)));
exports.defineRandomInt = defineRandomInt;
const defineCurrentwon_date = () => {
    const format = 'DD-MM-YYYY';
    return (0, dayjs_1.default)().format(format);
};
exports.defineCurrentwon_date = defineCurrentwon_date;
//# sourceMappingURL=utils.js.map