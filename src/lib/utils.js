// Shared utility functions for the app

/**
 * Generate a slug/ID from a name (e.g., for materials, formulas).
 * @param {string} name - The name to convert
 * @returns {string} Slugified string
 */
export function generateSlug(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Download a file with the specified content and filename.
 * @param {string} content - File content
 * @param {string} filename - Name of the file to download
 * @param {string} mimeType - MIME type of the file
 */
export function downloadFile(content, filename, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  URL.revokeObjectURL(url);
}

/**
 * Export data as JSON file.
 * @param {Object} data - Data to export
 * @param {string} filename - Name of the file (without extension)
 */
export function exportAsJSON(data, filename) {
  const content = JSON.stringify(data, null, 2);
  const fullFilename = `${filename}.json`;
  downloadFile(content, fullFilename, 'application/json');
}

/**
 * Export data as CSV file.
 * @param {string} csvContent - CSV content string
 * @param {string} filename - Name of the file (without extension)
 */
export function exportAsCSV(csvContent, filename) {
  const fullFilename = `${filename}.csv`;
  downloadFile(csvContent, fullFilename, 'text/csv');
}

/**
 * Generate a professional HTML report from formula data.
 * @param {Object} reportData - Report data object
 * @param {string} filename - Name of the file (without extension)
 */
export function exportAsHTML(reportData, filename) {
  // Create a professional HTML report
  const { formulaInfo, financialAnalysis, ingredients, summary } = reportData;
  
  // Validate required data
  if (!formulaInfo || !financialAnalysis || !ingredients || !summary) {
    throw new Error('Missing required data for HTML generation');
  }
  
  // Generate HTML content for report
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Formula Report - ${formulaInfo.name}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin: 20px 0; }
        .section h2 { color: #2c3e50; border-bottom: 1px solid #bdc3c7; padding-bottom: 5px; }
        .financial-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 15px 0; }
        .financial-item { background: #f8f9fa; padding: 15px; border-radius: 5px; }
        .ingredients-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .ingredients-table th, .ingredients-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .ingredients-table th { background-color: #f2f2f2; }
        .highlight { background-color: #e8f5e8; padding: 10px; border-radius: 5px; }
        .warning { background-color: #fff3cd; padding: 10px; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Formula Report</h1>
        <h2>${formulaInfo.name}</h2>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
      </div>

      <div class="section">
        <h2>Executive Summary</h2>
        <p>This report provides a comprehensive analysis of the "${formulaInfo.name}" formula, including financial performance, ingredient analysis, and strategic recommendations.</p>
        
        <div class="financial-grid">
          <div class="financial-item">
            <strong>Total Cost:</strong> $${formulaInfo.totalCost.toFixed(2)}
          </div>
          <div class="financial-item">
            <strong>Drum Price:</strong> $${formulaInfo.finalSalePriceDrum.toFixed(2)}
          </div>
          <div class="financial-item">
            <strong>Tote Price:</strong> $${formulaInfo.finalSalePriceTote.toFixed(2)}
          </div>
          <div class="financial-item">
            <strong>Ingredients:</strong> ${summary.totalIngredients}
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Financial Analysis</h2>
        <div class="financial-grid">
          <div class="financial-item">
            <strong>Drum Profit Margin:</strong> ${financialAnalysis.drumProfitMargin}%
          </div>
          <div class="financial-item">
            <strong>Tote Profit Margin:</strong> ${financialAnalysis.toteProfitMargin}%
          </div>
          <div class="financial-item">
            <strong>Drum Profit:</strong> $${financialAnalysis.drumProfit.toFixed(2)}
          </div>
          <div class="financial-item">
            <strong>Tote Profit:</strong> $${financialAnalysis.toteProfit.toFixed(2)}
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Ingredient Analysis</h2>
        <table class="ingredients-table">
          <thead>
            <tr>
              <th>Ingredient</th>
              <th>Quantity</th>
              <th>Cost</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            ${ingredients.map(ing => `
              <tr>
                <td>${ing.name}</td>
                <td>${ing.quantity}</td>
                <td>$${ing.cost.toFixed(2)}</td>
                <td>${ing.percentage}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="highlight">
          <strong>Key Insights:</strong>
          <ul>
            <li>Average ingredient cost: $${summary.averageIngredientCost}</li>
            <li>Highest cost ingredient: ${summary.highestCostIngredient.name} ($${summary.highestCostIngredient.cost.toFixed(2)})</li>
          </ul>
        </div>
      </div>

      <div class="section">
        <h2>Recommendations</h2>
        <ul>
          <li>${financialAnalysis.drumProfitMargin > 20 ? '✅' : '⚠️'} Drum pricing appears ${financialAnalysis.drumProfitMargin > 20 ? 'profitable' : 'low margin'}</li>
          <li>${financialAnalysis.toteProfitMargin > 20 ? '✅' : '⚠️'} Tote pricing appears ${financialAnalysis.toteProfitMargin > 20 ? 'profitable' : 'low margin'}</li>
          <li>${summary.highestCostIngredient.cost > formulaInfo.totalCost * 0.3 ? '⚠️' : '✅'} Cost concentration is ${summary.highestCostIngredient.cost > formulaInfo.totalCost * 0.3 ? 'high' : 'well distributed'}</li>
        </ul>
      </div>

      <div class="section">
        <h2>Risk Assessment</h2>
        <div class="warning">
          <strong>Considerations:</strong>
          <ul>
            <li>Raw material price volatility</li>
            <li>Supply chain dependencies</li>
            <li>Regulatory compliance requirements</li>
            <li>Quality control measures</li>
          </ul>
        </div>
      </div>
    </body>
    </html>
  `;

  // Create downloadable HTML file
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Generate a Word document report from formula data using docx library.
 * @param {Object} reportData - Report data object
 * @param {string} filename - Name of the file (without extension)
 */
export function exportAsWord(reportData, filename) {
  // Create a professional Word document report
  const { formulaInfo, financialAnalysis, ingredients, summary } = reportData;
  
  // Validate required data
  if (!formulaInfo || !financialAnalysis || !ingredients || !summary) {
    throw new Error('Missing required data for Word generation');
  }

  // Import docx library dynamically
  import('docx').then(({ Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType }) => {
    try {

      // Create document
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            // Title
            new Paragraph({
              text: 'Formula Report',
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: formulaInfo.name,
              heading: HeadingLevel.HEADING_2,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: `Generated on ${new Date().toLocaleDateString()}`,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: '' }), // Spacing

            // Executive Summary
            new Paragraph({
              text: 'Executive Summary',
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              text: `This report provides a comprehensive analysis of the "${formulaInfo.name}" formula, including financial performance, ingredient analysis, and strategic recommendations.`,
            }),
            new Paragraph({ text: '' }), // Spacing

            // Financial Overview
            new Paragraph({
              text: 'Financial Overview',
              heading: HeadingLevel.HEADING_3,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Total Cost: ', bold: true }),
                new TextRun({ text: `$${formulaInfo.totalCost.toFixed(2)}` }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Drum Price: ', bold: true }),
                new TextRun({ text: `$${formulaInfo.finalSalePriceDrum.toFixed(2)}` }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Tote Price: ', bold: true }),
                new TextRun({ text: `$${formulaInfo.finalSalePriceTote.toFixed(2)}` }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Number of Ingredients: ', bold: true }),
                new TextRun({ text: `${summary.totalIngredients}` }),
              ],
            }),
            new Paragraph({ text: '' }), // Spacing

            // Financial Analysis
            new Paragraph({
              text: 'Financial Analysis',
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Drum Profit Margin: ', bold: true }),
                new TextRun({ text: `${financialAnalysis.drumProfitMargin}%` }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Tote Profit Margin: ', bold: true }),
                new TextRun({ text: `${financialAnalysis.toteProfitMargin}%` }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Drum Profit: ', bold: true }),
                new TextRun({ text: `$${financialAnalysis.drumProfit.toFixed(2)}` }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Tote Profit: ', bold: true }),
                new TextRun({ text: `$${financialAnalysis.toteProfit.toFixed(2)}` }),
              ],
            }),
            new Paragraph({ text: '' }), // Spacing

            // Ingredient Analysis
            new Paragraph({
              text: 'Ingredient Analysis',
              heading: HeadingLevel.HEADING_2,
            }),

            // Create ingredients table
            new Table({
              width: {
                size: 100,
                type: WidthType.PERCENTAGE,
              },
              rows: [
                // Header row
                new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ text: 'Ingredient', bold: true })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: 'Quantity', bold: true })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: 'Cost', bold: true })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: 'Percentage', bold: true })],
                    }),
                  ],
                }),
                // Data rows
                ...ingredients.map(ing => new TableRow({
                  children: [
                    new TableCell({
                      children: [new Paragraph({ text: ing.name || 'Unknown' })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: ing.quantity || '0' })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ text: `$${(ing.cost || 0).toFixed(2)}` })],
                    }),
                    new TableCell({
                      children: [new Paragraph({ 
                        text: `${typeof ing.percentage === 'string' ? ing.percentage : (ing.percentage || 0).toFixed(1)}%` 
                      })],
                    }),
                  ],
                })),
              ],
            }),
            new Paragraph({ text: '' }), // Spacing

            // Key Insights
            new Paragraph({
              text: 'Key Insights',
              heading: HeadingLevel.HEADING_3,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '• Average ingredient cost: ', bold: true }),
                new TextRun({ text: `$${summary.averageIngredientCost}` }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '• Highest cost ingredient: ', bold: true }),
                new TextRun({ text: `${summary.highestCostIngredient.name} ($${summary.highestCostIngredient.cost.toFixed(2)})` }),
              ],
            }),
            new Paragraph({ text: '' }), // Spacing

            // Recommendations
            new Paragraph({
              text: 'Recommendations',
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '• ', bold: true }),
                new TextRun({ text: `${financialAnalysis.drumProfitMargin > 20 ? '✅' : '⚠️'} Drum pricing appears ${financialAnalysis.drumProfitMargin > 20 ? 'profitable' : 'low margin'}` }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '• ', bold: true }),
                new TextRun({ text: `${financialAnalysis.toteProfitMargin > 20 ? '✅' : '⚠️'} Tote pricing appears ${financialAnalysis.toteProfitMargin > 20 ? 'profitable' : 'low margin'}` }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '• ', bold: true }),
                new TextRun({ text: `${summary.highestCostIngredient.cost > formulaInfo.totalCost * 0.3 ? '⚠️' : '✅'} Cost concentration is ${summary.highestCostIngredient.cost > formulaInfo.totalCost * 0.3 ? 'high' : 'well distributed'}` }),
              ],
            }),
            new Paragraph({ text: '' }), // Spacing

            // Risk Assessment
            new Paragraph({
              text: 'Risk Assessment',
              heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Considerations:', bold: true }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '• Raw material price volatility' }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '• Supply chain dependencies' }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '• Regulatory compliance requirements' }),
              ],
            }),
            new Paragraph({
              children: [
                new TextRun({ text: '• Quality control measures' }),
              ],
            }),
          ],
        }],
      });

      // Generate and download the document
      Packer.toBlob(doc).then(blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });

         } catch (error) {
       // Fallback to RTF if docx generation fails
       exportAsRTF(reportData, filename);
     }
   }).catch(error => {
     // Fallback to RTF if docx library is not available
     exportAsRTF(reportData, filename);
   });
}

/**
 * Fallback function to generate RTF file if docx fails.
 * @param {Object} reportData - Report data object
 * @param {string} filename - Name of the file (without extension)
 */
function exportAsRTF(reportData, filename) {
  const { formulaInfo, financialAnalysis, ingredients, summary } = reportData;
  
  // Generate RTF content
  const rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}
\\f0\\fs24

{\\b Formula Report: ${formulaInfo.name}}\\par
Generated on ${new Date().toLocaleDateString()}\\par\\par

{\\b Executive Summary}\\par
This report provides a comprehensive analysis of the "${formulaInfo.name}" formula, including financial performance, ingredient analysis, and strategic recommendations.\\par\\par

{\\b Financial Overview}\\par
Total Cost: $${formulaInfo.totalCost.toFixed(2)}\\par
Drum Price: $${formulaInfo.finalSalePriceDrum.toFixed(2)}\\par
Tote Price: $${formulaInfo.finalSalePriceTote.toFixed(2)}\\par
Number of Ingredients: ${summary.totalIngredients}\\par\\par

{\\b Financial Analysis}\\par
Drum Profit Margin: ${financialAnalysis.drumProfitMargin}%\\par
Tote Profit Margin: ${financialAnalysis.toteProfitMargin}%\\par
Drum Profit: $${financialAnalysis.drumProfit.toFixed(2)}\\par
Tote Profit: $${financialAnalysis.toteProfit.toFixed(2)}\\par\\par

{\\b Ingredient Analysis}\\par
${ingredients.map((ing, index) => 
  `${index + 1}. ${ing.name} - ${ing.quantity} - $${ing.cost.toFixed(2)} (${ing.percentage}%)`
).join('\\par')}\\par\\par

{\\b Key Insights}\\par
- Average ingredient cost: $${summary.averageIngredientCost}\\par
- Highest cost ingredient: ${summary.highestCostIngredient.name} ($${summary.highestCostIngredient.cost.toFixed(2)})\\par\\par

{\\b Recommendations}\\par
- ${financialAnalysis.drumProfitMargin > 20 ? '✅' : '⚠️'} Drum pricing appears ${financialAnalysis.drumProfitMargin > 20 ? 'profitable' : 'low margin'}\\par
- ${financialAnalysis.toteProfitMargin > 20 ? '✅' : '⚠️'} Tote pricing appears ${financialAnalysis.toteProfitMargin > 20 ? 'profitable' : 'low margin'}\\par
- ${summary.highestCostIngredient.cost > formulaInfo.totalCost * 0.3 ? '⚠️' : '✅'} Cost concentration is ${summary.highestCostIngredient.cost > formulaInfo.totalCost * 0.3 ? 'high' : 'well distributed'}\\par\\par

{\\b Risk Assessment}\\par
Considerations:\\par
- Raw material price volatility\\par
- Supply chain dependencies\\par
- Regulatory compliance requirements\\par
- Quality control measures\\par
}`;

  // Create downloadable RTF file
  const blob = new Blob([rtfContent], { type: 'application/rtf' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.rtf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Generate a professional PDF report from formula data using jsPDF.
 * @param {Object} reportData - Report data object
 * @param {string} filename - Name of the file (without extension)
 */
export function exportAsPDF(reportData, filename) {
  // Create a professional PDF report
  const { formulaInfo, financialAnalysis, ingredients, summary } = reportData;
  
  // Validate required data
  if (!formulaInfo || !financialAnalysis || !ingredients || !summary) {
    throw new Error('Missing required data for PDF generation');
  }

  // Import jsPDF dynamically to avoid SSR issues
  import('jspdf').then(({ default: jsPDF }) => {
    try {
      // Create new PDF document
      const doc = new jsPDF();
      
      // Set initial position
      let yPos = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      // Helper function to add text with word wrapping
      const addText = (text, y, fontSize = 12, isBold = false) => {
        doc.setFontSize(fontSize);
        if (isBold) doc.setFont(undefined, 'bold');
        else doc.setFont(undefined, 'normal');
        
        const lines = doc.splitTextToSize(text, contentWidth);
        doc.text(lines, margin, y);
        return y + (lines.length * fontSize * 0.4);
      };
      
      // Helper function to add section header
      const addSectionHeader = (text, y) => {
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(44, 62, 80); // Dark blue color
        doc.text(text, margin, y);
        return y + 10;
      };
      
             // Helper function to add financial grid
       const addFinancialGrid = (data, startY) => {
         let currentY = startY;
         const gridWidth = contentWidth / 2;
         
         Object.entries(data).forEach(([key, value], index) => {
           const x = margin + (index % 2) * gridWidth;
           const y = currentY + (Math.floor(index / 2) * 8);
           
           doc.setFontSize(10);
           doc.setFont(undefined, 'normal');
           doc.setTextColor(0, 0, 0);
           
           const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
           const displayValue = typeof value === 'number' ? value.toFixed(2) : String(value || '');
           
           // Ensure we have valid text to display
           const textToDisplay = `${displayKey}: ${displayValue}`;
           
           if (textToDisplay && textToDisplay.trim()) {
             doc.text(textToDisplay, x, y);
           }
           
           if (index % 2 === 1) currentY += 8;
         });
         
         return currentY + 10;
       };
      
      // Title
      yPos = addText('Formula Report', yPos, 20, true);
      yPos = addText(formulaInfo.name, yPos, 16, true);
      yPos = addText(`Generated on ${new Date().toLocaleDateString()}`, yPos, 10);
      yPos += 10;
      
      // Executive Summary
      yPos = addSectionHeader('Executive Summary', yPos);
      yPos = addText(`This report provides a comprehensive analysis of the "${formulaInfo.name}" formula, including financial performance, ingredient analysis, and strategic recommendations.`, yPos);
      yPos += 5;
      
      // Financial Overview
      const financialOverview = {
        'Total Cost': `$${formulaInfo.totalCost.toFixed(2)}`,
        'Drum Price': `$${formulaInfo.finalSalePriceDrum.toFixed(2)}`,
        'Tote Price': `$${formulaInfo.finalSalePriceTote.toFixed(2)}`,
        'Ingredients': summary.totalIngredients
      };
      yPos = addFinancialGrid(financialOverview, yPos);
      
      // Financial Analysis
      yPos = addSectionHeader('Financial Analysis', yPos);
      const financialAnalysisData = {
        'Drum Profit Margin': `${financialAnalysis.drumProfitMargin}%`,
        'Tote Profit Margin': `${financialAnalysis.toteProfitMargin}%`,
        'Drum Profit': `$${financialAnalysis.drumProfit.toFixed(2)}`,
        'Tote Profit': `$${financialAnalysis.toteProfit.toFixed(2)}`
      };
      yPos = addFinancialGrid(financialAnalysisData, yPos);
      
      // Ingredient Analysis
      yPos = addSectionHeader('Ingredient Analysis', yPos);
      
             // Add ingredients table
       const tableHeaders = ['Ingredient', 'Quantity', 'Cost', '%'];
       const tableData = ingredients.map(ing => [
         ing.name || 'Unknown',
         ing.quantity || '0',
         `$${(ing.cost || 0).toFixed(2)}`,
         `${typeof ing.percentage === 'string' ? ing.percentage : (ing.percentage || 0).toFixed(1)}%`
       ]);
       
       // Simple table implementation
       const colWidths = [60, 30, 30, 20];
       let tableY = yPos;
       
       // Headers
       doc.setFontSize(10);
       doc.setFont(undefined, 'bold');
       let xPos = margin;
       tableHeaders.forEach((header, i) => {
         if (header && header.trim()) {
           doc.text(header, xPos, tableY);
         }
         xPos += colWidths[i];
       });
       tableY += 5;
       
       // Data rows
       doc.setFont(undefined, 'normal');
       tableData.forEach(row => {
         xPos = margin;
         row.forEach((cell, i) => {
           if (cell && cell.trim()) {
             doc.text(String(cell), xPos, tableY);
           }
           xPos += colWidths[i];
         });
         tableY += 5;
       });
      
      yPos = tableY + 10;
      
      // Key Insights
      yPos = addSectionHeader('Key Insights', yPos);
      yPos = addText(`• Average ingredient cost: $${summary.averageIngredientCost}`, yPos);
      yPos = addText(`• Highest cost ingredient: ${summary.highestCostIngredient.name} ($${summary.highestCostIngredient.cost.toFixed(2)})`, yPos);
      yPos += 5;
      
      // Recommendations
      yPos = addSectionHeader('Recommendations', yPos);
      yPos = addText(`• ${financialAnalysis.drumProfitMargin > 20 ? '✅' : '⚠️'} Drum pricing appears ${financialAnalysis.drumProfitMargin > 20 ? 'profitable' : 'low margin'}`, yPos);
      yPos = addText(`• ${financialAnalysis.toteProfitMargin > 20 ? '✅' : '⚠️'} Tote pricing appears ${financialAnalysis.toteProfitMargin > 20 ? 'profitable' : 'low margin'}`, yPos);
      yPos = addText(`• ${summary.highestCostIngredient.cost > formulaInfo.totalCost * 0.3 ? '⚠️' : '✅'} Cost concentration is ${summary.highestCostIngredient.cost > formulaInfo.totalCost * 0.3 ? 'high' : 'well distributed'}`, yPos);
      yPos += 5;
      
      // Risk Assessment
      yPos = addSectionHeader('Risk Assessment', yPos);
      yPos = addText('Considerations:', yPos);
      yPos = addText('• Raw material price volatility', yPos);
      yPos = addText('• Supply chain dependencies', yPos);
      yPos = addText('• Regulatory compliance requirements', yPos);
      yPos = addText('• Quality control measures', yPos);
      
      // Save the PDF
      doc.save(`${filename}.pdf`);
      
         } catch (error) {
       // Fallback to HTML if PDF generation fails
       exportAsHTML(reportData, filename);
     }
   }).catch(error => {
     // Fallback to HTML if jsPDF is not available
     exportAsHTML(reportData, filename);
   });
}

/**
 * Show a success notification.
 * @param {string} message - Success message
 */
export function showSuccessNotification(message) {
  // Simple alert for now - can be enhanced with a proper notification system
  alert(`✅ ${message}`);
}

/**
 * Show an error notification.
 * @param {string} message - Error message
 */
export function showErrorNotification(message) {
  // Simple alert for now - can be enhanced with a proper notification system
  alert(`❌ ${message}`);
} 