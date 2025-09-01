import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import type { Story } from "@/lib/schema";
import { storySchema } from "@/lib/schema";

export const runtime = "nodejs";

function drawImageFromDataUrl(doc: PDFKit.PDFDocument, dataUrl: string, x: number, y: number, w: number, h: number) {
  try {
    const commaIdx = dataUrl.indexOf(",");
    const base64 = dataUrl.slice(commaIdx + 1);
    const buffer = Buffer.from(base64, "base64");
    doc.image(buffer, x, y, { width: w, height: h, align: "center", valign: "center" });
  } catch {
    // ignore decode failure
  }
}

export async function POST(req: NextRequest) {
  const input = storySchema.parse(await req.json());
  const { title, pages } = input as Story;

  const doc = new PDFDocument({ size: "LETTER", margin: 36 });
  const stream = doc as unknown as NodeJS.ReadableStream;

  for (let i = 0; i < (pages || []).length; i++) {
    const p = pages[i];
    if (i > 0) doc.addPage();
    
    // Add title on first page only
    if (i === 0) {
      doc.fontSize(26).text(title || "Story", { align: "center" }).moveDown(2);
    }

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 36;
    const imageX = margin;
    const imageY = margin;
    const imageW = pageWidth - margin * 2;
    const imageH = pageHeight - margin * 2 - 110; // room for text panel

    const url = (p as any)?.imageUrl as string | undefined;
    if (url) {
      try {
        if (url.startsWith("data:image/png;base64,") || url.startsWith("data:image/jpeg;base64,")) {
          // draw from base64
          drawImageFromDataUrl(doc as any, url, imageX, imageY, imageW, imageH);
        } else if (url.startsWith("data:image/svg+xml;")) {
          // Handle SVG data URLs (mock images)
          const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${imageW}' height='${imageH}'>
            <rect width='100%' height='100%' fill='#f3f4f6'/>
            <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='24' font-family='sans-serif' fill='#6b7280'>Mock Image</text>
          </svg>`;
          const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
          drawImageFromDataUrl(doc as any, dataUrl, imageX, imageY, imageW, imageH);
        } else if (url.startsWith("http")) {
          // Fetch remote image and convert to buffer
          const response = await fetch(url);
          if (response.ok) {
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            doc.image(buffer, imageX, imageY, { width: imageW, height: imageH, align: "center", valign: "center" });
          } else {
            console.error(`Failed to fetch image from ${url}: ${response.status}`);
          }
        } else {
          // Try direct URL (fallback)
          doc.image(url, imageX, imageY, { width: imageW, height: imageH, align: "center", valign: "center" });
        }
      } catch (error) {
        console.error(`Failed to embed image for page ${i + 1}:`, error);
        // Draw a placeholder rectangle
        doc.rect(imageX, imageY, imageW, imageH).fill("#f3f4f6");
        doc.fontSize(12).fillColor("#6b7280").text("Image failed to load", imageX + imageW/2, imageY + imageH/2, { align: "center", valign: "middle" });
        doc.fillColor("#000000");
      }
    }

    // Text panel overlay
    const panelX = margin;
    const panelY = imageY + imageH + 16;
    const panelW = imageW;
    const panelH = 90;
    doc.roundedRect(panelX, panelY, panelW, panelH, 8).fillOpacity(0.06).fillAndStroke("#000000", "#e5e7eb").fillOpacity(1);
    doc.text(p?.text || "", panelX + 12, panelY + 12, { width: panelW - 24, align: "left" });

    // Page number
    doc.fontSize(10).fillColor("#6b7280").text(`${i + 1}`, pageWidth - margin - 12, pageHeight - margin - 10);
    doc.fillColor("#000000");
  }

  doc.end();

  return new NextResponse(stream as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${(title || "story").replace(/[^a-z0-9\-_.]/gi, "_")}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
