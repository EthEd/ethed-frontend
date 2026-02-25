import { pinata } from "@/lib/pinata-config";
import { NextResponse } from "next/server";


export const config = {
  api: { bodyParser: false },
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    // Upload file to Pinata
    const upload = await pinata.upload.public.file(file)
      .name(file.name)
      .keyvalues({ project: "0G_simulation" });

    // Build gateway URL for preview/download
const gatewayUrl = "https://gateway.pinata.cloud";
const fileUrl = `${gatewayUrl}/ipfs/${upload.cid}`;


    return NextResponse.json({ cid: upload.cid, url: fileUrl }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error during file upload" },
      { status: 500 }
    );
  }
}

