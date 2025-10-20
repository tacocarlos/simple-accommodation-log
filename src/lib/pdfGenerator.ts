import { PDFDocument, rgb, StandardFonts, PDFPage } from "pdf-lib";
import {
  StudentWithAccommodationsTracking,
  Class,
  SixWeekPeriod,
} from "./types";
import { formatDate } from "./database";
import { BaseDirectory, readFile } from "@tauri-apps/plugin-fs";
import { resolveResource } from "@tauri-apps/api/path";
import fontkit from "@pdf-lib/fontkit";

export async function generateStudentAccommodationPDF(
  student: StudentWithAccommodationsTracking,
  classData: Class,
  period: SixWeekPeriod | null,
  dates: Date[],
): Promise<Uint8Array> {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  let currentPage = pdfDoc.addPage([612, 792]); // Letter size: 8.5" x 11"

  // load custom font
  const fontBytes = await readFile(await resolveResource("fonts/font.ttf"));

  // Embed fonts
  pdfDoc.registerFontkit(fontkit);
  const extraFont = await pdfDoc.embedFont(fontBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { width, height } = currentPage.getSize();
  const margin = 50;
  let yPosition = height - margin;

  // Title
  currentPage.drawText("Accommodation Services Log", {
    x: margin,
    y: yPosition,
    size: 18,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  yPosition -= 30;

  // Student Information
  currentPage.drawText(
    `Student: ${student.first_name.charAt(0)}. ${student.last_name}`,
    {
      x: margin,
      y: yPosition,
      size: 12,
      font: boldFont,
    },
  );
  yPosition -= 18;

  // currentPage.drawText(`Student ID: ${student.student_id}`, {
  //   x: margin,
  //   y: yPosition,
  //   size: 10,
  //   font: font,
  // });
  // yPosition -= 15;

  // currentPage.drawText(`Plan Type: ${student.plan_type}`, {
  //   x: margin,
  //   y: yPosition,
  //   size: 10,
  //   font: font,
  // });
  // yPosition -= 15;

  currentPage.drawText(
    `Class: ${classData.name} - ${classData.subject} (Period ${classData.period})`,
    {
      x: margin,
      y: yPosition,
      size: 10,
      font: font,
    },
  );
  yPosition -= 15;

  if (period) {
    currentPage.drawText(`Six-Week Period: ${period.name} (${period.year})`, {
      x: margin,
      y: yPosition,
      size: 10,
      font: font,
    });
    yPosition -= 15;
  }

  currentPage.drawText(
    `Date Range: ${dates[0].toLocaleDateString()} - ${dates[dates.length - 1].toLocaleDateString()}`,
    {
      x: margin,
      y: yPosition,
      size: 10,
      font: font,
    },
  );
  yPosition -= 30;

  // If no accommodations, show message
  if (student.accommodations.length === 0) {
    currentPage.drawText("No accommodations defined for this student.", {
      x: margin,
      y: yPosition,
      size: 10,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    });
  } else {
    // Table parameters
    const dataRowHeight = 25;
    const dateColumnWidth = 90;
    const minAccommodationColumnWidth = 60; // Minimum width for accommodation columns
    const availableWidth = width - 2 * margin - dateColumnWidth;

    // Calculate how many accommodations can fit per page
    const maxAccommodationsPerPage = Math.floor(
      availableWidth / minAccommodationColumnWidth,
    );
    const totalAccommodations = student.accommodations.length;

    // Split accommodations into chunks that fit on each page
    const accommodationChunks: (typeof student.accommodations)[] = [];
    for (let i = 0; i < totalAccommodations; i += maxAccommodationsPerPage) {
      accommodationChunks.push(
        student.accommodations.slice(i, i + maxAccommodationsPerPage),
      );
    }

    // For each chunk of accommodations, create a table
    accommodationChunks.forEach((accommodationChunk, chunkIndex) => {
      const accommodationColumnWidth =
        availableWidth / accommodationChunk.length;

      // Add page indicator if there are multiple chunks
      if (accommodationChunks.length > 1) {
        currentPage.drawText(
          `Accommodations ${chunkIndex * maxAccommodationsPerPage + 1}-${Math.min((chunkIndex + 1) * maxAccommodationsPerPage, totalAccommodations)} of ${totalAccommodations}`,
          {
            x: margin,
            y: yPosition - 5,
            size: 9,
            font: font,
            color: rgb(0.4, 0.4, 0.4),
          },
        );
        yPosition -= 15;
      }

      // Calculate header height based on wrapped text
      const headerLineHeight = 10;
      const headerPadding = 10;
      let maxHeaderLines = 1;

      // Pre-calculate wrapped text for all accommodations in this chunk
      const wrappedHeaders = accommodationChunk.map((acc) => {
        const headerText = `${acc.category}: ${acc.description}`;
        const maxWidth = accommodationColumnWidth - 10;
        return wrapText(headerText, maxWidth, 8, font);
      });

      // Find the maximum number of lines in any header
      wrappedHeaders.forEach((lines) => {
        if (lines.length > maxHeaderLines) {
          maxHeaderLines = lines.length;
        }
      });

      // Calculate dynamic header height
      const headerHeight = Math.max(
        25,
        headerPadding + maxHeaderLines * headerLineHeight + headerPadding,
      );

      // Function to draw table header for this chunk
      function drawTableHeader(page: PDFPage, y: number): number {
        // Draw header background
        page.drawRectangle({
          x: margin,
          y: y - headerHeight,
          width: width - 2 * margin,
          height: headerHeight,
          color: rgb(0.9, 0.9, 0.9),
        });

        // Date column header
        page.drawText("Date", {
          x: margin + 5,
          y: y - headerHeight / 2 - 5,
          size: 10,
          font: boldFont,
        });

        // Draw vertical line after date column
        page.drawLine({
          start: { x: margin + dateColumnWidth, y: y },
          end: { x: margin + dateColumnWidth, y: y - headerHeight },
          thickness: 1,
          color: rgb(0, 0, 0),
        });

        // Accommodation column headers for this chunk
        accommodationChunk.forEach((acc, index) => {
          const colX =
            margin + dateColumnWidth + index * accommodationColumnWidth;

          // Draw vertical line
          page.drawLine({
            start: { x: colX, y: y },
            end: { x: colX, y: y - headerHeight },
            thickness: 1,
            color: rgb(0, 0, 0),
          });

          // Draw wrapped text for accommodation
          const wrappedText = wrappedHeaders[index];
          const startY = y - headerPadding;

          wrappedText.forEach((line, lineIndex) => {
            page.drawText(line, {
              x: colX + 5,
              y: startY - lineIndex * headerLineHeight,
              size: 8,
              font: boldFont,
            });
          });
        });

        // Draw right border
        page.drawLine({
          start: { x: width - margin, y: y },
          end: { x: width - margin, y: y - headerHeight },
          thickness: 1,
          color: rgb(0, 0, 0),
        });

        // Draw bottom border of header
        page.drawLine({
          start: { x: margin, y: y - headerHeight },
          end: { x: width - margin, y: y - headerHeight },
          thickness: 1,
          color: rgb(0, 0, 0),
        });

        return y - headerHeight;
      }

      // Draw initial table header for this chunk
      yPosition = drawTableHeader(currentPage, yPosition);

      // Draw data rows for this chunk
      dates.forEach((date, dateIndex) => {
        // Check if we need a new page (accounting for dynamic header height)
        if (yPosition - dataRowHeight < margin + 80) {
          // Add new page
          currentPage = pdfDoc.addPage([612, 792]);
          yPosition = currentPage.getSize().height - margin;

          // Add continuation indicator
          if (accommodationChunks.length > 1) {
            currentPage.drawText(
              `Accommodations ${chunkIndex * maxAccommodationsPerPage + 1}-${Math.min((chunkIndex + 1) * maxAccommodationsPerPage, totalAccommodations)} of ${totalAccommodations} (continued)`,
              {
                x: margin,
                y: yPosition - 5,
                size: 9,
                font: font,
                color: rgb(0.4, 0.4, 0.4),
              },
            );
            yPosition -= 15;
          }

          // Redraw header on new page
          yPosition = drawTableHeader(currentPage, yPosition);
        }

        // Alternate row colors
        if (dateIndex % 2 === 0) {
          currentPage.drawRectangle({
            x: margin,
            y: yPosition - dataRowHeight,
            width: width - 2 * margin,
            height: dataRowHeight,
            color: rgb(0.97, 0.97, 0.97),
          });
        }

        // Draw date
        currentPage.drawText(
          date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "numeric",
            day: "numeric",
            year: "numeric",
          }),
          {
            x: margin + 5,
            y: yPosition - 17,
            size: 9,
            font: font,
          },
        );

        // Draw vertical line after date
        currentPage.drawLine({
          start: { x: margin + dateColumnWidth, y: yPosition },
          end: { x: margin + dateColumnWidth, y: yPosition - dataRowHeight },
          thickness: 1,
          color: rgb(0.8, 0.8, 0.8),
        });

        // Draw checkmarks for accommodations in this chunk
        accommodationChunk.forEach((acc, accIndex) => {
          const colX =
            margin + dateColumnWidth + accIndex * accommodationColumnWidth;

          // Draw vertical line
          currentPage.drawLine({
            start: { x: colX, y: yPosition },
            end: { x: colX, y: yPosition - dataRowHeight },
            thickness: 1,
            color: rgb(0.8, 0.8, 0.8),
          });

          // Check if service was provided
          const dateStr = formatDate(date);
          const isProvided = acc.serviceLogs.get(dateStr) || false;

          if (isProvided) {
            // Draw checkmark
            currentPage.drawText("✔", {
              x: colX + accommodationColumnWidth / 2 - 5,
              y: yPosition - 17,
              size: 14,
              font: extraFont,
              color: rgb(0, 0.5, 0),
            });
          }
        });

        // Draw right border
        currentPage.drawLine({
          start: { x: width - margin, y: yPosition },
          end: { x: width - margin, y: yPosition - dataRowHeight },
          thickness: 1,
          color: rgb(0.8, 0.8, 0.8),
        });

        // Draw bottom border
        currentPage.drawLine({
          start: { x: margin, y: yPosition - dataRowHeight },
          end: { x: width - margin, y: yPosition - dataRowHeight },
          thickness: 1,
          color: rgb(0.8, 0.8, 0.8),
        });

        yPosition -= dataRowHeight;
      });

      // Add space between chunks (only if there's another chunk)
      if (chunkIndex < accommodationChunks.length - 1) {
        // Start a new page for the next chunk
        currentPage = pdfDoc.addPage([612, 792]);
        yPosition = currentPage.getSize().height - margin;

        // Repeat student info header on new chunk page
        currentPage.drawText(
          `${student.first_name} ${student.last_name} - ${classData.name}`,
          {
            x: margin,
            y: yPosition,
            size: 12,
            font: boldFont,
          },
        );
        yPosition -= 25;
      }
    });
  }

  // Add signature line at the bottom of the last page
  const lastPage = pdfDoc.getPages()[pdfDoc.getPageCount() - 1];
  const signatureY = 100;

  lastPage.drawLine({
    start: { x: margin, y: signatureY },
    end: { x: width - margin, y: signatureY },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  lastPage.drawText("Teacher Signature", {
    x: margin,
    y: signatureY - 15,
    size: 9,
    font: font,
    color: rgb(0.3, 0.3, 0.3),
  });

  lastPage.drawText(`Date: ${new Date().toLocaleDateString()}`, {
    x: width - margin - 100,
    y: signatureY - 15,
    size: 9,
    font: font,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Serialize the PDF to bytes
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

// Helper function to wrap text
function wrapText(
  text: string,
  maxWidth: number,
  fontSize: number,
  font: any,
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}
