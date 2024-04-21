import { Context, Schema } from "koishi";
import { z } from "zod";

export const name = "mainet";
export const inject = ["http"];

export interface Config {}

export const Config: Schema<Config> = Schema.object({});

const webDetailSchema = z.object({
  uptime: z.number(),
});
const webDataSchema = z.object({
  details: z.object({
    "maimai DX CN": webDetailSchema,
    "maimai DX CN DXNet": webDetailSchema,
    "maimai DX CN Main": webDetailSchema,
    "maimai DX CN NetLogin": webDetailSchema,
    "maimai DX CN Title": webDetailSchema,
    "maimai DX CN Update": webDetailSchema,
  }),
  status: z.boolean(),
});
const zlibDetailSchema = z.object({
  10: z.number(),
  30: z.number(),
  60: z.number(),
});
const zlibDataSchema = z.object({
  full: zlibDetailSchema,
  full_Error: zlibDetailSchema,
  zlib_Error: zlibDetailSchema,
});

function convertZlib(value: number, total: number): string {
  if (total === 0) return "0.000";
  return `${((value / total) * 100).toFixed(3)}`;
}

export function apply(ctx: Context) {
  // Register i18n
  ctx.i18n.define("zh-CN", require("./locales/zh-CN"));

  ctx.command("mainet").action(async (_) => {
    const webData = webDataSchema.parse(
      await ctx.http.get("https://maihook.lemonkoi.one/api/ping")
    );
    const zlibData = zlibDataSchema.parse(
      await ctx.http.get("https://maihook.lemonkoi.one/api/zlib")
    );

    return (
      <>
        <i18n path=".descriptions" />
        <br />
        <i18n path=".zlib">
          <>{convertZlib(zlibData.zlib_Error["10"], zlibData.full["10"])}%</>
          <>{convertZlib(zlibData.zlib_Error["30"], zlibData.full["30"])}%</>
          <>{convertZlib(zlibData.zlib_Error["60"], zlibData.full["60"])}%</>
        </i18n>
        <br />
        <i18n path=".web">
          <>{(webData.details["maimai DX CN"].uptime * 100).toFixed(3)}%</>
          <>{(webData.details["maimai DX CN Main"].uptime * 100).toFixed(3)}%</>
          <>
            {(webData.details["maimai DX CN Title"].uptime * 100).toFixed(3)}%
          </>
          <>
            {(webData.details["maimai DX CN Update"].uptime * 100).toFixed(3)}%
          </>
          <>
            {(webData.details["maimai DX CN NetLogin"].uptime * 100).toFixed(3)}
            %
          </>
          <>
            {(webData.details["maimai DX CN DXNet"].uptime * 100).toFixed(3)}%
          </>
        </i18n>
        <br />
        <i18n path=".tips" />
      </>
    );
  });
}
