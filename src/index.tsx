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

function convertZlib(
  data: z.infer<typeof zlibDataSchema>,
  level: "10" | "30" | "60"
): string {
  if (data.full[level] === 0) return "0.000";
  return ((data.zlib_Error[level] / data.full[level]) * 100).toFixed(3);
}

function convertWeb(
  data: z.infer<typeof webDataSchema>,
  server:
    | "maimai DX CN"
    | "maimai DX CN DXNet"
    | "maimai DX CN Main"
    | "maimai DX CN NetLogin"
    | "maimai DX CN Title"
    | "maimai DX CN Update"
): string {
  return (data.details[server].uptime * 100).toFixed(3);
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
          <>{convertZlib(zlibData, "10")}%</>
          <>{convertZlib(zlibData, "30")}%</>
          <>{convertZlib(zlibData, "60")}%</>
        </i18n>
        <br />
        <i18n path=".web">
          <>{convertWeb(webData, "maimai DX CN")}%</>
          <>{convertWeb(webData, "maimai DX CN Main")}%</>
          <>{convertWeb(webData, "maimai DX CN Title")}%</>
          <>{convertWeb(webData, "maimai DX CN Update")}%</>
          <>{convertWeb(webData, "maimai DX CN NetLogin")}%</>
          <>{convertWeb(webData, "maimai DX CN DXNet")}%</>
        </i18n>
        <br />
        <i18n path=".tips" />
      </>
    );
  });
}
