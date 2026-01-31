// Type declaration to fix ng2-charts import issue with Chart.js v4.5.1
declare module 'chart.js/dist/types/utils' {
  export type DeepPartial<T> = T extends object
    ? {
        [P in keyof T]?: DeepPartial<T[P]>;
      }
    : T;
}
