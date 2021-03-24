import Router from "@koa/router";
import { Response } from "koa";
import { getBrowser } from "./browser";
import { Logger } from "./logger";
type Res = Response & {
  body: any;
};
type ClipType = {
  "y": number,
  "x": number,
  "width": number,
  "height": number
}
export function mappingRouting(router: Router<any, {}>) {
  router.post("/", async ctx => {
    const url = ctx.request.body?.url;
    const clip = ctx.request.body?.clip;
    await renderImg(ctx.response,url, clip );
  })
  router.get('/render.png', async ctx => {
    const url = ctx.query?.url as string
    const clip:ClipType|undefined = ctx.query?.useClip !== "true" ?undefined: {
      "y": Number(ctx.query.clipY) || 0,
      "x": Number(ctx.query.clipX) || 0,
      "width": Number(ctx.query.clipW) || 1280,
      "height": Number(ctx.query.clipH) || 720
    }
    Logger.debug({clip})
    await renderImg(ctx.response, url, clip);
  })

}
async function renderImg(res: Res, url?: string, clip?: ClipType | undefined) {
  const browser = getBrowser();
  if (browser) {
    Logger.debug(`new job ${url}`);
    if (url) {
      try {
        const page = await browser.newPage();
        page.setViewportSize({ width: 1280, height: 720 });
        Logger.debug(`create new page`);
        await page.goto(url);
        await new Promise(res => setTimeout(res, 5 * 1000));
        Logger.debug(`loaded ${url}`);
        const image = await page.screenshot({ type: "png", fullPage: true, omitBackground:true, clip });
        Logger.debug(`screnshoot page ${url} is done`);
        await page.close();
        res.type = "image/png";
        res.body = image;
      } catch (error) {
        res.body = error.message;
        res.status = 500
      }
    }else{
      res.body = "url not found"
    }
  }
}