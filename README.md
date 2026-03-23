# Upti Invoice

A minimal, professional invoicing web application built with React and Vite.  
Features include creating invoices with line items, automatic totals, signature capture, and export to PDF/Excel.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Project Structure

- `/src/components` – React UI components
- `/src/utils` – helper functions for calculations and invoice data
- `/src/styles` – global CSS

## Dependencies

- React
- Vite
- jsPDF (PDF export)
- SheetJS (`xlsx`) for Excel export
- react-signature-canvas for signature capture

## Notes

This application uses localStorage to track invoice count, client emails and industries.  
The UI is intentionally minimal and modern without any third-party UI libraries.

