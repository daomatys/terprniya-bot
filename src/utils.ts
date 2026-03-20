import dayjs from "dayjs";

export const setCountSuffix = (a: number) => (
  ( Math.floor(a / 10) == 1 ) ||
  ( a % 10 < 2 ) ||
  ( a % 10 > 4 )
    ? ''
    : 'а' 
);

export const defineRandomInt = (max: number) => (
  1 + Math.floor(Math.random() * Math.floor(max))
);

export const defineCurrentwon_date = () => {
  const format = 'DD-MM-YYYY';

  return dayjs().format(format);
};
