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
  try {
    console.log("=== PDF GENERATION START ===");
    const input = storySchema.parse(await req.json());
    const { title, pages } = input as Story;
    
    console.log("PDF Input:", {
      title,
      pagesCount: pages?.length,
      firstPageImageUrl: pages?.[0]?.imageUrl?.substring(0, 100) + "..."
    });
    
    // Check if we have any valid images
    const validImages = pages?.filter(p => {
      const url = (p as { imageUrl?: string })?.imageUrl;
      return url && !url.includes("Image failed to generate");
    }) || [];
    
    console.log(`Found ${validImages.length} valid images out of ${pages?.length} pages`);
    
    if (validImages.length === 0) {
      console.error("No valid images found for PDF generation");
      return NextResponse.json(
        { error: "No valid images available for PDF generation" },
        { status: 400 }
      );
    }

  const doc = new PDFDocument({ size: "LETTER", margin: 36 });
  const stream = doc as unknown as NodeJS.ReadableStream;

  for (let i = 0; i < (pages || []).length; i++) {
    const p = pages[i];
    
    // Add new page for all pages except the first
    if (i > 0) {
      doc.addPage();
    }
    
    // Add title on first page only
    if (i === 0) {
      doc.fontSize(26).text(title || "Story", { align: "center" }).moveDown(2);
    }

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    const margin = 36;
    const imageX = margin;
    const imageY = i === 0 ? margin + 60 : margin; // Extra space for title on first page
    const imageW = pageWidth - margin * 2;
    const imageH = pageHeight - margin * 2 - 120; // More room for text panel

    const url = (p as { imageUrl?: string })?.imageUrl;
    console.log(`Processing image for page ${i + 1}:`, url?.substring(0, 100) + "...");
    if (url && url !== "data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22400%22%20height%3D%22300%22%20viewBox%3D%220%200%20400%20300%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23f3f4f6%22/%3E%3Ctext%20x%3D%22200%22%20y%3D%22150%22%20text-anchor%3D%22middle%22%20font-family%3D%22Arial%22%20font-size%3D%2216%22%20fill%3D%22%236b7280%22%3EImage%20failed%20to%20generate%3C/text%3E%3C/svg%3E") {
      try {
        if (url.startsWith("data:image/png;base64,") || url.startsWith("data:image/jpeg;base64,")) {
          // draw from base64
          drawImageFromDataUrl(doc, url, imageX, imageY, imageW, imageH);
        } else if (url.startsWith("data:image/svg+xml;")) {
          // Handle SVG data URLs (mock images)
          const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${imageW}' height='${imageH}'>
            <rect width='100%' height='100%' fill='#f3f4f6'/>
            <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='24' font-family='sans-serif' fill='#6b7280'>Mock Image</text>
          </svg>`;
          const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
          drawImageFromDataUrl(doc, dataUrl, imageX, imageY, imageW, imageH);
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
        doc.fontSize(12).fillColor("#6b7280").text("Image failed to load", imageX + imageW/2, imageY + imageH/2, { align: "center" });
        doc.fillColor("#000000");
      }
    }

    // Text panel overlay - improved formatting
    const panelX = margin;
    const panelY = imageY + imageH + 16;
    const panelW = imageW;
    const panelH = 100; // Slightly larger panel
    
    // Background panel
    doc.roundedRect(panelX, panelY, panelW, panelH, 8).fillOpacity(0.95).fillAndStroke("#ffffff", "#e5e7eb").fillOpacity(1);
    
    // Text with better formatting
    const text = p?.text || "";
    doc.fontSize(14).fillColor("#374151").text(text, panelX + 16, panelY + 16, { 
      width: panelW - 32, 
      align: "left",
      lineGap: 2,
      ellipsis: false // Prevent text from being cut off
    });

    // Page number
    doc.fontSize(10).fillColor("#6b7280").text(`${i + 1}`, pageWidth - margin - 12, pageHeight - margin - 10);
    doc.fillColor("#000000");
  }

    console.log("=== PDF GENERATION COMPLETE ===");
    doc.end();

    return new NextResponse(stream as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${(title || "story").replace(/[^a-z0-9\-_.]/gi, "_")}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
