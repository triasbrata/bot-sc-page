import Router from "@koa/router";
import { Response } from "koa";
import { getBrowser } from "./browser";
import { Logger } from "./logger";
import sharp from "sharp";
type Res = Response & {
  body: any;
};
interface View {
  width: number,
  height: number
}
interface ClipType extends View {
  "y": number,
  "x": number,
  
}
interface ResizeType extends View {
}
type MyBe<T> = T|undefined;

export function mappingRouting(router: Router<any, {}>) {
  router.post("/", async ctx => {
    const url = ctx.request.body?.url;
    const clip = ctx.request.body?.clip;

    await renderImg(ctx.response, getViewPort(ctx),url, clip );
  })
  router.get('/render.png', async (ctx) => {
    const url = ctx.query?.url as string
    const clip:ClipType|undefined = ctx.query?.useClip !== "true" ?undefined: {
      "y": Number(ctx.query.clipY) || 0,
      "x": Number(ctx.query.clipX) || 0,
      "width": Number(ctx.query.clipW) || 1280,
      "height": Number(ctx.query.clipH) || 720
    }
    const resize: MyBe<ResizeType> = ctx.query?.rH && ctx.query?.rW ? { width: Number(ctx.query.rW), height: Number(ctx.query.rH)} : undefined;
    const viewPort = getViewPort(ctx);
    await renderImg(ctx.response, viewPort, url, clip, resize);
  })

}
async function renderImg(res: Res,viewPort:View, url?: string, clip?: ClipType, resize?:ResizeType) {
  const browser = getBrowser();
  if (browser) {
    Logger.debug(`new job ${url}`);
    if (url) {
      try {
        const page = await browser.newPage();
        Logger.debug(`set viewport browser ${viewPort.width}x${viewPort.height}`);
        page.setViewportSize(viewPort);
        Logger.debug(`create new page`);
        await page.goto(url);
        await new Promise(res => setTimeout(res, 5 * 1000));
        Logger.debug(`loaded ${url}`);
        let image = await page.screenshot({ type: "png", fullPage: true, omitBackground:true, clip });
        Logger.debug(`screnshoot page ${url} is done`);
        await page.close();
        if(resize){
          Logger.debug(`resize image to ${resize.width}x${resize.height}`)
          image = await sharp(image).resize(resize.width, resize.height).toBuffer();
        }
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

function getViewPort(ctx: any): View {
  return {
    width: Number(ctx.query.vW) || 1280,
    height: Number(ctx.query.vH) || 720,
  }
}
