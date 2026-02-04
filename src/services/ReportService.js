import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { getBaseTemplate } from '../utils/ReportTemplate';
import { executeQuery } from '../database/database';

// Helper de formatação de moeda formatCurrency
const fmt = (v) => v ? v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00';
const fmtData = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '-';

export const generatePDFAgro = async (type, startDate, endDate) => {
    try {
        let title = '';
        let contentHtml = '';
        const period = `${fmtData(startDate)} até ${fmtData(endDate)}`;

        // 1. Relatório de Vendas
        if (type === 'VENDAS') {
            title = 'Relatório de Vendas';
            const res = await executeQuery(
                `SELECT * FROM vendas WHERE data BETWEEN ? AND ? ORDER BY data DESC`,
                [startDate, endDate]
            );

            let total = 0;
            let rows = '';

            for (let i = 0; i < res.rows.length; i++) {
                const item = res.rows.item(i);
                total += item.valor * item.quantidade;
                rows += `
                <tr>
                    <td>${fmtData(item.data)}</td>
                    <td><b>${item.cliente}</b></td>
                    <td>${item.produto}</td>
                    <td>${item.quantidade}</td>
                    <td>${fmt(item.valor)}</td>
                    <td><b>${fmt(item.valor * item.quantidade)}</b></td>
                </tr>`;
            }

            contentHtml = `
                <div class="summary-box">
                    <div class="summary-title">RESUMO DO PERÍODO</div>
                    <div style="font-size: 24px; font-weight: 900; color: #10B981">${fmt(total)}</div>
                    <div style="font-size: 12px; color: #6B7280">${res.rows.length} registros encontrados</div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>DATA</th>
                            <th>CLIENTE</th>
                            <th>PRODUTO</th>
                            <th>QTD</th>
                            <th>UNITÁRIO</th>
                            <th>TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            `;
        }

        // 2. Relatório de Estoque (Snapshot - Data range ignorado nesse caso, é o atual)
        else if (type === 'ESTOQUE') {
            title = 'Posição de Estoque Atual';
            const res = await executeQuery(`SELECT * FROM estoque ORDER BY produto ASC`);

            let rows = '';
            for (let i = 0; i < res.rows.length; i++) {
                const item = res.rows.item(i);
                rows += `
                <tr>
                    <td><b>${item.produto}</b></td>
                    <td>${item.quantidade}</td>
                    <td><span class="badge badge-blue">Disponível</span></td>
                    <td>${fmtData(item.last_updated)}</td>
                </tr>`;
            }

            contentHtml = `
                 <div class="summary-box">
                    <div class="summary-title">ITENS CADASTRADOS</div>
                    <div style="font-size: 24px; font-weight: 900; color: #3B82F6">${res.rows.length}</div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>PRODUTO/INSUMO</th>
                            <th>SALDO ATUAL</th>
                            <th>STATUS</th>
                            <th>ÚLT. MOVIM.</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            `;
        }

        // --- GERAÇÃO FINAL DO PDF ---
        const html = getBaseTemplate(title, period, contentHtml);

        const { uri } = await Print.printToFileAsync({ html });
        console.log('PDF gerado em:', uri);

        // Renomear para ficar bonito
        const safeTitle = title.replace(/ /g, '_');
        const newPath = `${FileSystem.documentDirectory}AgroGB_${safeTitle}_${startDate}.pdf`;

        await FileSystem.moveAsync({
            from: uri,
            to: newPath
        });

        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(newPath);
        } else {
            alert('Compartilhamento não disponível neste dispositivo');
        }

    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        alert('Falha ao gerar relatório');
    }
};
