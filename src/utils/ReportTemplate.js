export const getBaseTemplate = (title, period, content, logoUrl = null) => {
    const today = new Date().toLocaleDateString('pt-BR');

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>AgroGB Report</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap');
            
            body {
                font-family: 'Roboto', sans-serif;
                margin: 0;
                padding: 40px;
                color: #333;
                background: #FFF;
            }

            @page {
                margin: 20px;
                @bottom-center {
                    content: "Página " counter(page);
                    font-size: 10px;
                    color: #999;
                }
            }

            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 2px solid #10B981;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }

            .logo-box {
                font-size: 24px;
                font-weight: 900;
                color: #10B981;
                letter-spacing: -1px;
            }

            .report-info {
                text-align: right;
            }

            .report-title {
                font-size: 18px;
                font-weight: 700;
                text-transform: uppercase;
                color: #1F2937;
                margin: 0;
            }

            .report-meta {
                font-size: 12px;
                color: #6B7280;
                margin-top: 5px;
            }

            .summary-box {
                background-color: #F3F4F6;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 30px;
                border-left: 4px solid #10B981;
            }

            .summary-title {
                font-size: 12px;
                font-weight: 700;
                color: #4B5563;
                text-transform: uppercase;
                margin-bottom: 5px;
            }

            table {
                width: 100%;
                border-collapse: collapse;
                font-size: 12px;
                margin-bottom: 20px;
            }

            thead {
                background-color: #10B981;
                color: white;
                display: table-header-group;
            }

            th {
                padding: 12px 8px;
                text-align: left;
                font-weight: 700;
                text-transform: uppercase;
                font-size: 10px;
                letter-spacing: 0.5px;
            }

            td {
                padding: 10px 8px;
                border-bottom: 1px solid #E5E7EB;
                color: #374151;
            }

            tr {
                page-break-inside: avoid;
            }

            tr:nth-child(even) {
                background-color: #F9FAFB;
            }

            .footer {
                position: fixed;
                bottom: 0;
                width: 100%;
                text-align: center;
                font-size: 10px;
                color: #9CA3AF;
                padding-top: 10px;
                border-top: 1px solid #E5E7EB;
            }
            
            .badge {
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 9px;
                font-weight: bold;
            }
            .badge-green { background: #D1FAE5; color: #065F46; }
            .badge-red { background: #FEE2E2; color: #991B1B; }
            .badge-blue { background: #DBEAFE; color: #1E40AF; }

        </style>
    </head>
    <body>
        <div class="header">
            <div class="logo-box">AGRO<span style="color: #1F2937">GB</span></div>
            <div class="report-info">
                <h1 class="report-title">${title}</h1>
                <div class="report-meta">Período: ${period}</div>
                <div class="report-meta">Gerado em: ${today}</div>
            </div>
        </div>

        ${content}

        <div class="footer">
            AgroGB Mobile - Sistema de Gestão Agrícola Profissional
        </div>
    </body>
    </html>
    `;
};
