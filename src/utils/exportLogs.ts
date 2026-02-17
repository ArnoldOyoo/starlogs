import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { LogSession } from "@/components/NewSessionDialog";

export function exportToCSV(logs: LogSession[], filename = "observation-logs.csv") {
  const headers = ["Date", "Time", "Location", "Bortle Class", "Seeing", "Objects Observed", "Notes"];
  
  const rows = logs.map(log => [
    log.date,
    log.time,
    log.location,
    log.bortle,
    log.seeing,
    log.objects.join("; "),
    log.notes.replace(/"/g, '""') // Escape quotes
  ]);
  
  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
  ].join("\n");
  
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPDF(logs: LogSession[], filename = "observation-logs.pdf") {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.setTextColor(100, 100, 255);
  doc.text("StarLogs - Observation Journal", 14, 20);
  
  // Subtitle
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 28);
  
  // Summary stats
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text(`Total Sessions: ${logs.length}`, 14, 40);
  
  const allObjects = logs.flatMap(l => l.objects);
  const uniqueObjects = [...new Set(allObjects)];
  doc.text(`Unique Objects Logged: ${uniqueObjects.length}`, 14, 48);
  
  const uniqueLocations = [...new Set(logs.map(l => l.location))];
  doc.text(`Locations Visited: ${uniqueLocations.length}`, 14, 56);
  
  // Table
  const tableData = logs.map(log => [
    log.date,
    log.time,
    log.location,
    log.bortle,
    log.seeing,
    log.objects.join(", "),
    log.notes.length > 50 ? log.notes.substring(0, 50) + "..." : log.notes
  ]);
  
  autoTable(doc, {
    startY: 65,
    head: [["Date", "Time", "Location", "Bortle", "Seeing", "Objects", "Notes"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [100, 100, 255],
      textColor: 255,
      fontStyle: "bold"
    },
    styles: {
      fontSize: 8,
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 22 },
      2: { cellWidth: 28 },
      3: { cellWidth: 18 },
      4: { cellWidth: 15 },
      5: { cellWidth: 40 },
      6: { cellWidth: 35 }
    }
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount} | StarLogs Observation Journal`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }
  
  doc.save(filename);
}
