class ExportSystem {
    constructor() {
        this.init();
    }

    init() {
        // Initialize export system
    }

    async exportToPDF(title, content, filename = 'export.pdf') {
        try {
            if (window.toast) {
                toast.info('PDF export requires a library. Creating downloadable content...');
            }
            
            const htmlContent = `
                <html>
                    <head>
                        <title>${title}</title>
                        <style>
                            body { font-family: Arial, sans-serif; padding: 20px; }
                            h1 { color: #333; }
                            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                            th { background-color: #4a90e2; color: white; }
                        </style>
                    </head>
                    <body>
                        <h1>${title}</h1>
                        ${content}
                    </body>
                </html>
            `;

            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename.replace('.pdf', '.html');
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            if (window.analytics) {
                analytics.track('export', { format: 'pdf', title });
            }

            if (window.toast) {
                toast.success('Export downloaded');
            }
        } catch (error) {
            console.error('Error exporting to PDF:', error);
            if (window.toast) {
                toast.error('Failed to export to PDF');
            }
        }
    }

    exportToCSV(data, filename = 'export.csv') {
        try {
            if (!Array.isArray(data) || data.length === 0) {
                throw new Error('No data to export');
            }

            const headers = Object.keys(data[0]);
            const csvRows = [
                headers.join(','),
                ...data.map(row => 
                    headers.map(header => {
                        const value = row[header];
                        return typeof value === 'string' && value.includes(',') 
                            ? `"${value}"` 
                            : value;
                    }).join(',')
                )
            ];

            const csvContent = csvRows.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            if (window.analytics) {
                analytics.track('export', { format: 'csv', filename, rows: data.length });
            }

            if (window.toast) {
                toast.success(`Exported ${data.length} rows to CSV`);
            }
        } catch (error) {
            console.error('Error exporting to CSV:', error);
            if (window.toast) {
                toast.error('Failed to export to CSV');
            }
        }
    }

    exportToJSON(data, filename = 'export.json') {
        try {
            const jsonContent = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonContent], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            if (window.analytics) {
                analytics.track('export', { format: 'json', filename });
            }

            if (window.toast) {
                toast.success('Exported to JSON');
            }
        } catch (error) {
            console.error('Error exporting to JSON:', error);
            if (window.toast) {
                toast.error('Failed to export to JSON');
            }
        }
    }

    exportToExcel(data, filename = 'export.xlsx') {
        return this.exportToCSV(data, filename.replace('.xlsx', '.csv'));
    }

    exportTableToCSV(tableId, filename = 'table-export.csv') {
        try {
            const table = document.getElementById(tableId) || document.querySelector(tableId);
            if (!table) {
                throw new Error('Table not found');
            }

            const rows = Array.from(table.querySelectorAll('tr'));
            const csvRows = rows.map(row => {
                const cols = Array.from(row.querySelectorAll('th, td'));
                return cols.map(col => {
                    let text = col.textContent.trim();
                    if (text.includes(',') || text.includes('"')) {
                        text = `"${text.replace(/"/g, '""')}"`;
                    }
                    return text;
                }).join(',');
            });

            const csvContent = csvRows.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            if (window.analytics) {
                analytics.track('export', { format: 'csv', type: 'table', tableId });
            }

            if (window.toast) {
                toast.success('Table exported to CSV');
            }
        } catch (error) {
            console.error('Error exporting table:', error);
            if (window.toast) {
                toast.error('Failed to export table');
            }
        }
    }
}

const exportSystem = new ExportSystem();
window.exportSystem = exportSystem;