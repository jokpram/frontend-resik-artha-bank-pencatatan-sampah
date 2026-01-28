---
description: How to generate and download PDF reports
---

# Generating Reports

The application supports generating PDF reports for both Waste Records and Withdrawals.

## Waste Records Report

1.  **Endpoint**: `GET /api/reports/pdf`
2.  **Access**: Officer only.
3.  **Function**: `reportController.downloadReport` -> `reportService.generateWasteReport`
4.  **Frontend**: "Unduh Laporan PDF" button in the "Catatan Sampah" tab of `DashboardOfficer`.

## Withdrawals Report

1.  **Endpoint**: `GET /api/reports/withdrawals-pdf`
2.  **Access**: Officer only.
3.  **Function**: `reportController.downloadWithdrawalReport` -> `reportService.generateWithdrawalReport`
4.  **Frontend**: "Unduh Laporan PDF" button in the "Penarikan Saldo" tab of `DashboardOfficer`.

## Implementation Details

-   Uses `pdfkit` for PDF generation.
-   Streams output directly to the response (`res`).
-   Sets `Content-Type: application/pdf` and `Content-Disposition: attachment`.
