// Prints the plain text of a PDF the way a parser sees it (macOS PDFKit). Used by build.py's ATS check.
import Foundation
import PDFKit

guard CommandLine.arguments.count > 1,
      let doc = PDFDocument(url: URL(fileURLWithPath: CommandLine.arguments[1])) else {
    FileHandle.standardError.write("usage: swift pdftext.swift file.pdf\n".data(using: .utf8)!)
    exit(1)
}
print("PAGES=\(doc.pageCount)")
print(doc.string ?? "")
