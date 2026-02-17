import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { PinataSDK } from "pinata";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseArgs(argv) {
  // default to the canonical OG PNG (no GIFs by default)
  const args = { image: "public/og-image.png", write: true };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--image") args.image = argv[++i];
    else if (a === "--no-write") args.write = false;
  }
  return args;
}

function guessMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".gif") return "image/gif";
  if (ext === ".webp") return "image/webp";
  return "application/octet-stream";
}

function stripTrailingSlash(url) {
  return url.replace(/\/$/, "");
}

async function main() {
  const { image, write } = parseArgs(process.argv);

  const pinataJwt = process.env.PINATA_JWT;
  const pinataGateway = process.env.PINATA_GATEWAY_URL;

  if (!pinataJwt) {
    console.error("Missing PINATA_JWT in environment.");
    process.exit(1);
  }

  const pinata = new PinataSDK({
    pinataJwt,
    pinataGateway,
  });

  const absoluteImagePath = path.isAbsolute(image)
    ? image
    : path.join(process.cwd(), image);

  if (!fs.existsSync(absoluteImagePath)) {
    console.error(`Image not found: ${absoluteImagePath}`);
    process.exit(1);
  }

  const imageBuffer = fs.readFileSync(absoluteImagePath);
  const mime = guessMimeType(absoluteImagePath);
  const blob = new Blob([imageBuffer], { type: mime });
  const filename = path.basename(absoluteImagePath);
  const file = new File([blob], filename, { type: mime });

  console.log(`Uploading Genesis image: ${image}`);
  const imageUpload = await pinata.upload.file(file);
  const imageCid = imageUpload.IpfsHash;
  const imageUri = `ipfs://${imageCid}`;

  const metadata = {
    name: "eth.ed Pioneer NFT",
    description:
      "Commemorates being an early eth.ed pioneer and completing the onboarding journey.",
    image: imageUri,
    attributes: [
      { trait_type: "Type", value: "Genesis Scholar" },
      { trait_type: "Edition", value: "Pioneer" },
      { trait_type: "Rarity", value: "Founder" },
    ],
    external_url: "https://ethed.app",
  };

  console.log("Uploading Genesis metadata template");
  const metadataUpload = await pinata.upload.json(metadata);
  const metadataCid = metadataUpload.IpfsHash;
  const metadataUri = `ipfs://${metadataCid}`;

  console.log("\nPinned:");
  console.log(`- image:    ${imageUri}`);
  console.log(`- metadata: ${metadataUri}`);

  if (write) {
    const outPath = path.join(process.cwd(), "src", "lib", "genesis-assets.ts");
    const content = `export const GENESIS_PIONEER_IMAGE_URI = "${imageUri}";\n\n// Optional: if you pre-pin the Genesis metadata template (without per-user ENS traits),\n// set this to that CID. If empty, the app will upload metadata at mint time.\nexport const GENESIS_PIONEER_METADATA_URI = "${metadataUri}";\n`;
    fs.writeFileSync(outPath, content, "utf8");
    console.log(`\nWrote: ${path.relative(process.cwd(), outPath)}`);

    if (pinataGateway) {
      const gateway = stripTrailingSlash(pinataGateway);
      console.log("\nGateway preview:");
      console.log(`- ${gateway}/ipfs/${imageCid}`);
      console.log(`- ${gateway}/ipfs/${metadataCid}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
