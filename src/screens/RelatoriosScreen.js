import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, TextInput, Alert } from 'react-native';
import { executeQuery } from '../database/database';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { generatePDFAgro } from '../services/ReportService';

const { width } = Dimensions.get('window');

export default function RelatoriosScreen() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ prod: 0, vendas: 0, custos: 0, perdas: 0 });

    const loadData = async () => {
        setLoading(true);
        try {
            const rProd = await executeQuery('SELECT SUM(quantidade) as total FROM colheitas');
            const rVendas = await executeQuery('SELECT SUM(valor * quantidade) as total FROM vendas');
            const rCustos = await executeQuery('SELECT SUM(valor_total) as total FROM custos');
            const rPerdas = await executeQuery('SELECT SUM(quantidade_kg) as total FROM descarte');

            setData({
                prod: rProd.rows.item(0).total || 0,
                vendas: rVendas.rows.item(0).total || 0,
                custos: rCustos.rows.item(0).total || 0,
                perdas: rPerdas.rows.item(0).total || 0
            });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(useCallback(() => { loadData(); }, []));

    const StatCard = ({ title, value, unit, color, icon }) => (
        <View style={styles.card}>
            <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
                <Text style={styles.icon}>{icon}</Text>
            </View>
            <View style={styles.cardInfo}>
                <Text style={styles.cardLabel}>{title}</Text>
                <View style={styles.valueRow}>
                    <Text style={styles.cardValue}>{value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
                    <Text style={styles.cardUnit}>{unit}</Text>
                </View>
            </View>
        </View>
    );

    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    const handlePreset = (days) => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - days);
        setEndDate(end.toISOString().split('T')[0]);
        setStartDate(start.toISOString().split('T')[0]);
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.title}>BI RURAL PERFORMANCE</Text>
                <Text style={styles.sub}>Análise de Resultados e Produtividade</Text>
            </View>

            {loading ? <ActivityIndicator size="large" color="#F59E0B" style={{ marginTop: 100 }} /> : (
                <View style={styles.content}>
                    <StatCard title="PRODUÇÃO TOTAL" value={data.prod} unit="KG" color="#10B981" icon="🌾" />
                    <StatCard title="FATURAMENTO" value={data.vendas} unit="R$" color="#3B82F6" icon="💰" />
                    <StatCard title="CUSTOS OPERACIONAIS" value={data.custos} unit="R$" color="#EF4444" icon="💸" />
                    <StatCard title="QUEBRAS / PERDAS" value={data.perdas} unit="KG" color="#7F1D1D" icon="📉" />

                    <View style={styles.insightBox}>
                        <LinearGradient colors={['#F59E0B', '#D97706']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.insightHeader}>
                            <Text style={styles.insightTitle}>INSIGHT DO DIA</Text>
                        </LinearGradient>
                        <View style={styles.insightBody}>
                            <Text style={styles.insightTxt}>
                                {data.vendas > data.custos
                                    ? 'LUCRATIVIDADE OPERACIONAL POSITIVA EM R$ ' + (data.vendas - data.custos).toFixed(2)
                                    : 'ATENÇÃO: CUSTOS EXCEDENDO FATURAMENTO. REVISE SUAS ENTRADAS.'}
                            </Text>
                        </View>
                    </View>

                    {/* PDF REPORTS SECTION */}
                    <View style={styles.pdfSection}>
                        <Text style={styles.sectionTitle}>RELATÓRIOS OFICIAIS (PDF)</Text>

                        <View style={styles.presetRow}>
                            <TouchableOpacity style={styles.presetBtn} onPress={() => handlePreset(0)}><Text style={styles.presetText}>Hoje</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.presetBtn} onPress={() => handlePreset(7)}><Text style={styles.presetText}>7 Dias</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.presetBtn} onPress={() => handlePreset(30)}><Text style={styles.presetText}>30 Dias</Text></TouchableOpacity>
                        </View>

                        <View style={styles.dateRow}>
                            <TextInput style={styles.dateInput} value={startDate} onChangeText={setStartDate} placeholder="AAAA-MM-DD" keyboardType="numeric" />
                            <Text style={{ alignSelf: 'center', fontWeight: 'bold', color: '#9CA3AF' }}>ATÉ</Text>
                            <TextInput style={styles.dateInput} value={endDate} onChangeText={setEndDate} placeholder="AAAA-MM-DD" keyboardType="numeric" />
                        </View>

                        <TouchableOpacity style={styles.pdfBtn} onPress={() => generatePDFAgro('VENDAS', startDate, endDate)}>
                            <Text style={{ fontSize: 20 }}>📄</Text>
                            <Text style={styles.pdfBtnText}>GERAR RELATÓRIO DE VENDAS</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.pdfBtn, styles.stockBtn]} onPress={() => generatePDFAgro('ESTOQUE', startDate, endDate)}>
                            <Text style={{ fontSize: 20 }}>📦</Text>
                            <Text style={styles.pdfBtnText}>POSIÇÃO DE ESTOQUE ATUAL</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: { padding: 30, paddingTop: 50 },
    title: { fontSize: 22, fontWeight: '900', color: '#1F2937' },
    sub: { fontSize: 11, color: '#9CA3AF', letterSpacing: 1, marginTop: 5 },
    content: { padding: 25 },
    card: { backgroundColor: '#FFF', borderRadius: 28, padding: 25, marginBottom: 20, flexDirection: 'row', alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
    iconBox: { width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 20 },
    icon: { fontSize: 28 },
    cardInfo: { flex: 1 },
    cardLabel: { fontSize: 9, fontWeight: '900', color: '#9CA3AF', letterSpacing: 1.5, marginBottom: 8 },
    valueRow: { flexDirection: 'row', alignItems: 'baseline' },
    cardValue: { fontSize: 22, fontWeight: '800', color: '#1F2937' },
    cardUnit: { fontSize: 10, fontWeight: 'bold', color: '#9CA3AF', marginLeft: 8 },
    insightBox: { backgroundColor: '#FFF', borderRadius: 28, overflow: 'hidden', marginTop: 10, elevation: 4 },
    insightHeader: { padding: 15, alignItems: 'center' },
    insightTitle: { fontSize: 10, fontWeight: '900', color: '#FFF', letterSpacing: 2 },
    insightBody: { padding: 25, alignItems: 'center' },
    insightTxt: { fontSize: 13, fontWeight: '800', color: '#4B5563', textAlign: 'center', lineHeight: 22 },

    // PDF Section Styles
    pdfSection: { marginTop: 30, marginBottom: 50 },
    sectionTitle: { fontSize: 14, fontWeight: '900', color: '#374151', marginBottom: 15, letterSpacing: 1 },
    dateRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
    dateInput: { flex: 1, backgroundColor: '#FFF', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#E5E7EB', textAlign: 'center' },
    pdfBtn: { backgroundColor: '#10B981', padding: 16, borderRadius: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10, elevation: 2, marginBottom: 10 },
    pdfBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
    stockBtn: { backgroundColor: '#3B82F6' },
    presetRow: { flexDirection: 'row', gap: 8, marginBottom: 15, justifyContent: 'center' },
    presetBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#E5E7EB', borderRadius: 20 },
    presetText: { fontSize: 10, fontWeight: 'bold', color: '#4B5563' }
});
