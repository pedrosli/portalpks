import { NextResponse } from "next/server";
import JSZip from "jszip";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/format";
import { PropertySheetDocument } from "@/lib/pdf/propertySheet";
import type { Property, PropertyPhoto } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();

  if (!property) {
    return NextResponse.json({ error: "Imóvel não encontrado." }, { status: 404 });
  }

  const typedProperty = property as Property;

  const { data: photoRows } = await supabase
    .from("property_photos")
    .select("*")
    .eq("property_id", id)
    .order("position", { ascending: true });

  const photos = (photoRows ?? []) as PropertyPhoto[];

  const zip = new JSZip();
  const photosFolder = zip.folder("fotos");

  for (let i = 0; i < photos.length; i++) {
    const photo = photos[i];
    const { data: blob } = await supabase.storage
      .from("property-photos")
      .download(photo.path);

    if (!blob) continue;

    const ext = photo.path.split(".").pop() || "jpg";
    const buffer = Buffer.from(await blob.arrayBuffer());
    photosFolder?.file(`${String(i + 1).padStart(2, "0")}.${ext}`, buffer);
  }

  const pdfBuffer = await renderToBuffer(
    PropertySheetDocument({ property: typedProperty })
  );
  zip.file("ficha.pdf", pdfBuffer);

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
  const filename = `${slugify(typedProperty.title)}.zip`;

  return new NextResponse(new Uint8Array(zipBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
