import html2canvas from 'html2canvas'
import html2pdf from 'html2pdf.js'
import { createReportPdfExporter } from '@link/warning-feature/report-pdf-export'

const { exportToPDF } = createReportPdfExporter({ html2canvas, html2pdf })

export { exportToPDF }
