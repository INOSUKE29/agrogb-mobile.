import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, StatusBar as RNStatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { executeQuery, getConfig, getDashboardStats } from '../database/database';
import { syncTable } from '../services/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');


// --- TEMA PROFISSIONAL V6 ---
const THEME = {
    bg: '#F3F4F6',
    headerBg: ['#064E3B', '#111827'], // Deep Forest to Dark
    cardBg: '#FFFFFF',
    textMain: '#1F2937',
    textSub: '#6B7280',
    primary: '#059669',
    accent: '#10B981',
    alert: '#F59E0B'
};

export default function HomeScreen({ navigation }) {
    const [stats, setStats] = useState({
        saldo: 0,
        colheitaHoje: 0,
        vendasHoje: 0,
        plantioAtivo: 0,
        maquinasAlert: 0,
        pendentes: 0
    });

    const loadStats = async () => {
        const data = await getDashboardStats();
        setStats(data);
    };

    const autoSync = async () => {
        const tables = ['colheitas', 'vendas', 'compras', 'plantio', 'custos', 'descarte', 'clientes', 'culturas', 'cadastro', 'maquinas', 'manutencao_frota', 'monitoramento_entidade', 'analise_ia', 'monitoramento_media'];
        for (const tab of tables) {
            syncTable(tab).catch(err => console.log('Background sync error', tab, err));
        }
    };

    useFocusEffect(useCallback(() => { loadStats(); autoSync(); }, []));

    const menuItems = [
        { id: '1', title: 'COLHEITA', icon: 'leaf-outline', color: '#059669', screen: 'Colheita', cat: 'OPERAÇÃO' },
        { id: '2', title: 'VENDAS', icon: 'cash-outline', color: '#10B981', screen: 'Vendas', cat: 'OPERAÇÃO' },
        { id: '3', title: 'ESTOQUE', icon: 'cube-outline', color: '#3B82F6', screen: 'Estoque', cat: 'GESTÃO' },
        { id: '4', title: 'MONITORAMENTO', icon: 'camera-outline', color: '#EC4899', screen: 'Monitoramento', cat: 'TÉCNICO' },
        { id: '5', title: 'ADUBAÇÃO', icon: 'flask-outline', color: '#7C3AED', screen: 'AdubacaoList', cat: 'TÉCNICO' },
        { id: '6', title: 'COMPRAS', icon: 'cart-outline', color: '#F59E0B', screen: 'Compras', cat: 'GESTÃO' },
        { id: '7', title: 'PLANTIO', icon: 'nutrition-outline', color: '#8B5CF6', screen: 'Plantio', cat: 'OPERAÇÃO' },
        { id: '8', title: 'FROTA', icon: 'car-sport-outline', color: '#2563EB', screen: 'Frota', cat: 'GESTÃO' },
        { id: '9', title: 'NOTAS I.A.', icon: 'scan-outline', color: '#14B8A6', screen: 'Ocr', cat: 'FERRAMENTAS' },
        { id: '10', title: 'RELATÓRIOS', icon: 'pie-chart-outline', color: '#374151', screen: 'Relatorios', cat: 'GESTÃO' },
        { id: '11', title: 'CADASTROS', icon: 'create-outline', color: '#374151', screen: 'Cadastro', cat: 'SISTEMA' },
        { id: '12', title: 'CLIENTES', icon: 'people-outline', color: '#374151', screen: 'Clientes', cat: 'SISTEMA' },
        { id: '13', title: 'ÁREAS', icon: 'map-outline', color: '#374151', screen: 'Culturas', cat: 'SISTEMA' },
        { id: '14', title: 'SYNC', icon: 'cloud-upload-outline', color: '#6366F1', screen: 'Sync', badge: stats.pendentes, cat: 'SISTEMA' },
    ];

    const formatBRL = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <View style={styles.container}>
            <RNStatusBar barStyle="light-content" backgroundColor={THEME.headerBg[0]} />

            <LinearGradient colors={THEME.headerBg} style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.brand}>AgroGB <Text style={styles.brandPro}>SYSTEM</Text></Text>
                        <Text style={styles.salutation}>Painel Gerencial</Text>
                    </View>
                    <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.profileBtn}>
                        <Ionicons name="person" size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>

                {/* MINI KPIs REDESIGN */}
                <View style={styles.kpiRow}>
                    <View style={styles.kpiItem}>
                        <Text style={styles.kpiLabel}>COLHEITA (HOJE)</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <Ionicons name="leaf" size={14} color="#34D399" />
                            <Text style={styles.kpiValue}>{stats.colheitaHoje} <Text style={styles.unit}>kg</Text></Text>
                        </View>
                    </View>

                    <View style={styles.vr} />

                    <View style={styles.kpiItem}>
                        <Text style={styles.kpiLabel}>VENDAS (HOJE)</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                            <Ionicons name="cash" size={14} color="#34D399" />
                            <Text style={styles.kpiValue}>{stats.vendasHoje.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text>
                        </View>
                    </View>

                    <View style={styles.vr} />

                    <View style={styles.kpiItem}>
                        <Text style={styles.kpiLabel}>RESULTADO (MÊS)</Text>
                        <Text style={[styles.kpiValue, { color: stats.saldo >= 0 ? '#34D399' : '#F87171' }]}>
                            {formatBRL(stats.saldo)}
                        </Text>
                    </View>
                </View>
            </LinearGradient>

            <View style={styles.content}>
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                    {stats.maquinasAlert > 0 && (
                        <TouchableOpacity style={styles.alertBar} onPress={() => navigation.navigate('Frota')}>
                            <Ionicons name="warning" size={20} color="#B45309" />
                            <Text style={styles.alertText}>{stats.maquinasAlert} MÁQUINAS PRECISAM DE REVISÃO</Text>
                            <Ionicons name="chevron-forward" size={20} color="#B45309" />
                        </TouchableOpacity>
                    )}

                    <Text style={styles.sectionTitle}>ACESSO RÁPIDO</Text>
                    <View style={styles.grid}>
                        {menuItems.map(item => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.card}
                                onPress={() => navigation.navigate(item.screen)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.iconCircle, { backgroundColor: item.color + '15' }]}>
                                    <Ionicons name={item.icon} size={24} color={item.color} />
                                </View>
                                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                                {item.badge > 0 && (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{item.badge}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.version}>AgroGB Mobile v6.0 • Premium</Text>
                    </View>
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: THEME.bg },
    header: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 30, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
    brand: { fontSize: 22, fontWeight: '900', color: '#FFF', letterSpacing: 0.5 },
    brandPro: { fontSize: 10, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden', color: '#A7F3D0' },
    salutation: { fontSize: 12, color: '#9CA3AF', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 },
    profileBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12 },

    kpiRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', padding: 15, borderRadius: 16 },
    kpiItem: { flex: 1, alignItems: 'center' },
    kpiLabel: { fontSize: 9, color: '#9CA3AF', fontWeight: '900', marginBottom: 4, letterSpacing: 0.5 },
    kpiValue: { fontSize: 14, color: '#FFF', fontWeight: 'bold' },
    unit: { fontSize: 10, color: '#6B7280' },
    vr: { width: 1, height: 25, backgroundColor: 'rgba(255,255,255,0.1)' },

    content: { flex: 1, marginTop: -10 },
    scroll: { padding: 20 },

    alertBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7', padding: 12, borderRadius: 12, marginBottom: 20, gap: 10, borderLeftWidth: 4, borderLeftColor: '#F59E0B' },
    alertText: { flex: 1, fontSize: 11, fontWeight: 'bold', color: '#92400E' },

    sectionTitle: { fontSize: 12, fontWeight: '900', color: '#6B7280', marginBottom: 15, letterSpacing: 1 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    card: { width: (width - 52) / 3, backgroundColor: '#FFF', borderRadius: 16, padding: 15, alignItems: 'center', justifyContent: 'center', elevation: 2, borderWidth: 1, borderColor: 'rgba(0,0,0,0.02)' },
    iconCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    cardTitle: { fontSize: 10, fontWeight: 'bold', color: '#374151', textAlign: 'center' },

    badge: { position: 'absolute', top: 5, right: 5, backgroundColor: '#EF4444', minWidth: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
    badgeText: { color: '#FFF', fontSize: 9, fontWeight: 'bold' },

    footer: { marginTop: 40, alignItems: 'center' },
    version: { color: '#D1D5DB', fontSize: 10, fontWeight: 'bold' }
});
