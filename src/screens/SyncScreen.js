import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView, TextInput } from 'react-native';
import { getDadosPendentes, getConfig, setConfig, marcarItemSincronizado } from '../database/database';
import { syncTable, testConnection } from '../services/supabase';
import { LinearGradient } from 'expo-linear-gradient';

export default function SyncScreen() {
    const [dadosPendentes, setDadosPendentes] = useState({ total: 0 });
    const [loading, setLoading] = useState(false);
    const [statusCloud, setStatusCloud] = useState('checking');

    useEffect(() => {
        verificarPendencias();
        checkCloudConnection();
    }, []);

    const checkCloudConnection = async () => {
        setStatusCloud('checking');
        const connected = await testConnection();
        setStatusCloud(connected ? 'online' : 'offline');
    };

    const verificarPendencias = async () => {
        try {
            const dados = await getDadosPendentes();
            setDadosPendentes(dados);
        } catch (error) { }
    };

    const sincronizarDados = async () => {
        setLoading(true);
        try {
            // 1. Enviar todas as tabelas pendentes
            const tables = ['colheitas', 'vendas', 'compras', 'plantio', 'custos', 'descarte', 'clientes', 'culturas', 'cadastro', 'maquinas', 'manutencao_frota'];

            for (const tab of tables) {
                await syncTable(tab);
            }

            Alert.alert('☁️ Sucesso', 'Sincronização com a Nuvem concluída!');
            verificarPendencias();
            checkCloudConnection();

        } catch (e) {
            Alert.alert('Erro', 'Falha ao sincronizar. Verifique sua conexão com a internet.');
            console.error(e);
        } finally { setLoading(false); }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.header}>
                <Text style={styles.headerTitle}>AgroCloud <Text style={styles.dot}>☁️</Text></Text>
                <Text style={styles.headerSub}>Sincronização Profissional via Internet</Text>
            </LinearGradient>

            <View style={styles.body}>
                <View style={styles.card}>
                    <Text style={styles.label}>STATUS DA NUVEM</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusCloud === 'online' ? '#10B98120' : '#EF444420' }]}>
                        <View style={[styles.statusDot, { backgroundColor: statusCloud === 'online' ? '#10B981' : '#EF4444' }]} />
                        <Text style={[styles.statusText, { color: statusCloud === 'online' ? '#10B981' : '#EF4444' }]}>
                            {statusCloud === 'online' ? 'CONECTADO E SEGURO' : 'DESCONECTADO'}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.testBtn} onPress={checkCloudConnection}>
                        <Text style={styles.testBtnText}>VERIFICAR CONEXÃO</Text>
                    </TouchableOpacity>
                </View>

                <View style={[styles.card, styles.syncCard]}>
                    <View style={styles.syncStatusHeader}>
                        <Text style={styles.syncStatusTitle}>PENDÊNCIAS LOCAIS</Text>
                        <Text style={styles.syncStatusBadge}>{dadosPendentes.total} REGISTROS</Text>
                    </View>

                    <View style={styles.statsGrid}>
                        <View style={styles.stat}>
                            <Text style={styles.statVal}>{dadosPendentes.colheitas?.length || 0}</Text>
                            <Text style={styles.statLab}>COLH.</Text>
                        </View>
                        <View style={styles.stat}>
                            <Text style={styles.statVal}>{dadosPendentes.vendas?.length || 0}</Text>
                            <Text style={styles.statLab}>VENDAS</Text>
                        </View>
                        <View style={styles.stat}>
                            <Text style={styles.statVal}>{dadosPendentes.clientes?.length || 0}</Text>
                            <Text style={styles.statLab}>CLIENTES</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.syncBtn, loading && styles.disabled]}
                        onPress={sincronizarDados}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#FFF" /> : (
                            <Text style={styles.syncBtnText}>SINCRONIZAR NUVEM</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>Tecnologia Segura</Text>
                    <Text style={styles.infoTxt}>
                        Seus dados são criptografados e salvos em servidores globais seguros.
                        Você pode acessar de qualquer lugar.
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: { padding: 40, paddingTop: 60, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
    headerTitle: { fontSize: 26, fontWeight: '900', color: '#FFF' },
    dot: { color: '#FFF' },
    headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 5, letterSpacing: 1, fontWeight: 'bold' },
    body: { padding: 25, marginTop: -20 },
    card: { backgroundColor: '#FFF', borderRadius: 28, padding: 25, marginBottom: 20, elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
    label: { fontSize: 9, fontWeight: '900', color: '#9CA3AF', letterSpacing: 1.5, marginBottom: 12 },
    testBtn: { marginTop: 15, alignSelf: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#3B82F6' },
    testBtnText: { color: '#3B82F6', fontWeight: '900', fontSize: 10, letterSpacing: 1 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 15, borderRadius: 12 },
    statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
    statusText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
    syncCard: { alignItems: 'center' },
    syncStatusHeader: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: 25 },
    syncStatusTitle: { fontSize: 11, fontWeight: '900', color: '#1F2937' },
    syncStatusBadge: { backgroundColor: '#DBEAFE', color: '#1E40AF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, fontSize: 10, fontWeight: '900' },
    statsGrid: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 30, paddingHorizontal: 10 },
    stat: { alignItems: 'center' },
    statVal: { fontSize: 20, fontWeight: '900', color: '#1F2937' },
    statLab: { fontSize: 9, color: '#9CA3AF', fontWeight: '900', marginTop: 4 },
    syncBtn: { backgroundColor: '#2563EB', width: '100%', paddingVertical: 20, borderRadius: 20, alignItems: 'center', shadowColor: '#2563EB', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
    syncBtnText: { color: '#FFF', fontWeight: '900', letterSpacing: 1, fontSize: 14 },
    disabled: { backgroundColor: '#93C5FD', shadowOpacity: 0, elevation: 0 },
    infoBox: { marginTop: 10, padding: 25, backgroundColor: '#FFF', borderRadius: 28, borderWidth: 1, borderColor: '#F3F4F6' },
    infoTitle: { fontWeight: '900', color: '#111827', fontSize: 13, marginBottom: 8 },
    infoTxt: { fontSize: 12, color: '#6B7280', lineHeight: 20 }
});
