import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const workspaceRoot = process.cwd();
const iconSource = "C:/Users/rmpdr/Downloads/1000209749(7).png";
const lockupSource = "C:/Users/rmpdr/Downloads/1000209750(4).png";
const publicDir = path.join(workspaceRoot, "public");
const brandDir = path.join(publicDir, "brand");

async function makeTransparentPng(source, output, options = {}) {
  const image = sharp(source).rotate().ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const threshold = options.threshold ?? 244;

  for (let index = 0; index < data.length; index += 4) {
    if (
      data[index] >= threshold &&
      data[index + 1] >= threshold &&
      data[index + 2] >= threshold
    ) {
      data[index + 3] = 0;
    }
  }

  let pipeline = sharp(data, { raw: info }).png();

  if (options.trim !== false) {
    pipeline = pipeline.trim({
      background: { r: 255, g: 255, b: 255, alpha: 0 },
      threshold: 10
    });
  }

  await pipeline.toFile(output);
}

async function makeWordmark() {
  const metadata = await sharp(lockupSource).metadata();
  const width = metadata.width ?? 1536;
  const height = metadata.height ?? 768;

  const crop = {
    left: Math.round(width * 0.36),
    top: Math.round(height * 0.24),
    width: Math.round(width * 0.58),
    height: Math.round(height * 0.54)
  };

  const image = sharp(lockupSource).rotate().extract(crop).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });

  for (let index = 0; index < data.length; index += 4) {
    if (data[index] >= 244 && data[index + 1] >= 244 && data[index + 2] >= 244) {
      data[index + 3] = 0;
    }
  }

  await sharp(data, { raw: info })
    .trim({ background: { r: 255, g: 255, b: 255, alpha: 0 }, threshold: 10 })
    .png()
    .toFile(path.join(brandDir, "party-network-wordmark.png"));
}

async function makeOgImage() {
  const lockup = await sharp(lockupSource)
    .rotate()
    .resize(980, 360, { fit: "contain", background: "#f8fafc" })
    .png()
    .toBuffer();

  const frame = Buffer.from(`
    <svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="#f8fafc"/>
      <rect width="1200" height="14" fill="#002b5c"/>
      <rect y="616" width="1200" height="14" fill="#20c4bd"/>
    </svg>
  `);

  await sharp(frame)
    .composite([{ input: lockup, left: 110, top: 135 }])
    .png()
    .toFile(path.join(brandDir, "party-network-og.png"));
}

async function sampleBrandColors() {
  const { data } = await sharp(lockupSource)
    .rotate()
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const navyPixels = [];
  const tealPixels = [];

  for (let index = 0; index < data.length; index += 3) {
    const pixel = [data[index], data[index + 1], data[index + 2]];
    const [red, green, blue] = pixel;

    if (blue > green && blue > red && red < 45 && green < 95) {
      navyPixels.push(pixel);
    }

    if (green > 120 && blue > 120 && red < 90) {
      tealPixels.push(pixel);
    }
  }

  return {
    navy: toHex(averageColor(navyPixels)),
    teal: toHex(averageColor(tealPixels))
  };
}

function averageColor(pixels) {
  const total = pixels.reduce(
    (sum, [red, green, blue]) => [
      sum[0] + red,
      sum[1] + green,
      sum[2] + blue
    ],
    [0, 0, 0]
  );

  return total.map((value) => Math.round(value / Math.max(pixels.length, 1)));
}

function toHex(color) {
  return `#${color
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase()}`;
}

await fs.mkdir(brandDir, { recursive: true });

await makeTransparentPng(iconSource, path.join(brandDir, "party-network-icon.png"));
await makeTransparentPng(lockupSource, path.join(brandDir, "party-network-lockup.png"));
await makeWordmark();

const iconBase = sharp(path.join(brandDir, "party-network-icon.png"));

for (const size of [16, 32, 48, 180, 512]) {
  await iconBase
    .clone()
    .resize(size, size, { fit: "contain" })
    .png()
    .toFile(path.join(brandDir, `party-network-icon-${size}.png`));
}

await iconBase
  .clone()
  .resize(32, 32, { fit: "contain" })
  .png()
  .toFile(path.join(publicDir, "favicon.png"));

await iconBase
  .clone()
  .resize(180, 180, { fit: "contain" })
  .png()
  .toFile(path.join(publicDir, "apple-touch-icon.png"));

await iconBase
  .clone()
  .resize(512, 512, { fit: "contain" })
  .png()
  .toFile(path.join(publicDir, "icon.png"));

await makeOgImage();

const colors = await sampleBrandColors();
const files = await fs.readdir(brandDir);

console.log(JSON.stringify({ colors, files }, null, 2));
