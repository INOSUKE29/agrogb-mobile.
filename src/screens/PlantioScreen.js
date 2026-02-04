import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, FlatList, ActivityIndicator } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { useFocusEffect } from '@react-navigation/native';
import { insertPlantio, getCadastro, updatePlantio, deletePlantio, executeQuery } from '../database/database'; // Assuming these exist or using queries direct
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const up = (t, setter) => setter(t.toUpperCase());

export default function PlantioScreen({ navigation }) {
    const [talhao, setTalhao] = useState(''); // Stores Name of Area
    const [quantidade, setQuantidade] = useState('');
    const [variedade, setVariedade] = useState('');
    const [previsao, setPrevisao] = useState('');
    const [observacao, setObservacao] = useState('');
    const [history, setHistory] = useState([]);

    // Selection Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState(null); // 'AREA' or 'CULTURA'
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState('PÉS');

    useFocusEffect(useCallback(() => { loadHistory(); }, []));

    const loadHistory = async () => {
        try {
            const res = await executeQuery('SELECT * FROM plantio ORDER BY data DESC LIMIT 20');
            const rows = [];
            for (let i = 0; i < res.rows.length; i++) rows.push(res.rows.item(i));
            setHistory(rows);
        } catch (e) { console.error(e); }
    };

    const openSelector = async (type) => {
        setModalType(type);
        setLoading(true);
        setModalVisible(true);
        try {
            const all = await getCadastro();
            // Filter by Type
            const filtered = all.filter(i => i.tipo === type);
            setItems(filtered);
        } catch (e) { } finally { setLoading(false); }
    };

    const handleSelect = (item) => {
        if (modalType === 'AREA') {
            setTalhao(item.nome);
        } else {
            setVariedade(item.nome);
            setSelectedUnit(item.unidade || 'PÉS');
        }
        setModalVisible(false);
    };

    const salvar = async () => {
        if (!talhao || !quantidade || !variedade) {
            Alert.alert('Atenção', 'Área, Cultura e Quantidade são obrigatórios.');
            return;
        }

        const dados = {
            uuid: uuidv4(),
            cultura: talhao.toUpperCase(), // Using "cultura" field to store Area temporarily or logic needs update? 
            // WAIT: Database schema for Plantio has 'cultura' (text). User wants Relation.
            // For now, I will store the AREA NAME in specific field or append? 
            // Standard approach without breaking DB schema: Use 'cultura' column for CROP NAME, and we need a place for AREA.
            // DB Schema: cultura, quantidade_pes, tipo_plantio, data...
            // MAPPING: cultura = Crop Name (e.g. ALFACE), tipo_plantio = Variedade?? 
            // User requirement: "Campo Cultura atualizado", "Campo Área atualizado".
            // Let's use 'observacao' to store structured data regarding Area if column missing, OR assumed 'tipo_plantio' is used, OR add column.
            // BEST: Using the new approach, I'll update the insert.

            // CORRECTION: 'cultura' in DB likely refers to the Crop. 
            // We need to store Area. Checking DB Schema again...
            // Table plantio: uuid, cultura, quantidade_pes, tipo_plantio, data...
            // I will Assume: cultura = CROP (e.g. Alface), tipo_plantio = VARIETY + AREA??
            // Better: Store Area in 'observacao' or verify if I can add column quickly. 
            // User allowed DB changes. I will add 'area_local' column to plantio if possible, but for stability, let's look at schema.
            // Schema has 'cultura' (TEXT) and 'tipo_plantio' (TEXT).
            // Let's map: cultura = CROP NAME. tipo_plantio = AREA NAME.

            cultura: variedade.toUpperCase(),       // The Crop (Alface)
            tipo_plantio: talhao.toUpperCase(),     // The Area (Estufa 1) - Hijacking this field effectively
            quantidade_pes: parseInt(quantidade) || 0,
            data: new Date().toISOString().split('T')[0],
            observacao: `PREV: ${previsao} | ${observacao}`.toUpperCase()
        };

        try {
            await insertPlantio(dados);
            Alert.alert('Sucesso', 'Plantio registrado!');
            setTalhao(''); setQuantidade(''); setVariedade(''); setPrevisao(''); setObservacao('');
            loadHistory();
        } catch (error) {
            Alert.alert('Erro', 'Falha ao registrar.');
        }
    };

    const handleLongPress = (item) => {
        Alert.alert('Gerenciar Plantio', `Ação para: ${item.cultura} em ${item.tipo_plantio}`, [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'EXCLUIR',
                style: 'destructive',
                onPress: async () => {
                    await executeQuery('DELETE FROM plantio WHERE uuid = ?', [item.uuid]);
                    loadHistory();
                }
            }
        ]);
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
                <LinearGradient colors={['#16A34A', '#15803D']} style={styles.cardHeader}>
                    <Text style={styles.headerTitle}>NOVO PLANTIO</Text>
                    <Text style={styles.headerSub}>Preencha os dados do ciclo</Text>
                </LinearGradient>

                <View style={styles.form}>
                    <View style={styles.field}>
                        <Text style={styles.label}>ÁREA DE PLANTIO (ONDE?)</Text>
                        <TouchableOpacity style={styles.selectBtn} onPress={() => openSelector('AREA')}>
                            <Text style={[styles.selectText, !talhao && { color: '#9CA3AF' }]}>
                                {talhao || "SELECIONAR ÁREA..."}
                            </Text>
                            <Ionicons name="map-outline" size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>CULTURA (O QUE?)</Text>
                        <TouchableOpacity style={styles.selectBtn} onPress={() => openSelector('CULTURA')}>
                            <Text style={[styles.selectText, !variedade && { color: '#9CA3AF' }]}>
                                {variedade || "SELECIONAR CULTURA..."}
                            </Text>
                            <Ionicons name="leaf-outline" size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.field, { flex: 1, marginRight: 10 }]}>
                            <Text style={styles.label}>QTD ({selectedUnit})</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0"
                                value={quantidade}
                                onChangeText={setQuantidade}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={[styles.field, { flex: 1 }]}>
                            <Text style={styles.label}>PREVISÃO COLHEITA</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="MÊS/ANO"
                                value={previsao}
                                onChangeText={(t) => up(t, setPrevisao)}
                            />
                        </View>
                    </View>

                    <TouchableOpacity style={styles.btn} onPress={salvar}>
                        <Text style={styles.btnText}>CONFIRMAR PLANTIO</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Text style={styles.histTitle}>PLANTIOS RECENTES (TOQUE LONGO P/ OPÇÕES)</Text>
            {history.map(item => (
                <TouchableOpacity key={item.uuid} style={styles.histCard} onLongPress={() => handleLongPress(item)}>
                    <View style={styles.histIcon}>
                        <Ionicons name="leaf" size={24} color="#FFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.histCultura}>{item.cultura}</Text>
                        <Text style={styles.histLocal}>{item.tipo_plantio} • {item.quantidade_pes} mudas</Text>
                    </View>
                    <Text style={styles.histDate}>{item.data.split('-').reverse().slice(0, 2).join('/')}</Text>
                </TouchableOpacity>
            ))}

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.overlay}>
                    <View style={styles.modalBg}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>SELECIONAR {modalType}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#374151" />
                            </TouchableOpacity>
                        </View>

                        {loading ? <ActivityIndicator color="#16A34A" /> :
                            <FlatList
                                data={items}
                                keyExtractor={i => i.uuid || i.id.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity style={styles.itemRow} onPress={() => handleSelect(item)}>
                                        <Text style={styles.itemText}>{item.nome}</Text>
                                        <Text style={styles.itemSub}>{item.unidade || 'UN'}</Text>
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={
                                    <Text style={styles.empty}>
                                        Nenhum item cadastrado como {modalType}.
                                        Vá em CADASTROS para adicionar.
                                    </Text>
                                }
                            />
                        }
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB', padding: 20 },
    card: { backgroundColor: '#FFF', borderRadius: 24, overflow: 'hidden', elevation: 4, marginBottom: 25 },
    cardHeader: { padding: 25 },
    headerTitle: { fontSize: 18, fontWeight: '900', color: '#FFF' },
    headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.9)' },
    form: { padding: 20 },
    field: { marginBottom: 15 },
    row: { flexDirection: 'row' },
    label: { fontSize: 10, fontWeight: '900', color: '#6B7280', marginBottom: 5, letterSpacing: 0.5 },
    input: { backgroundColor: '#F3F4F6', borderRadius: 12, padding: 14, fontSize: 15, borderWidth: 1, borderColor: '#E5E7EB' },
    selectBtn: { backgroundColor: '#F3F4F6', borderRadius: 12, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
    selectText: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
    btn: { backgroundColor: '#15803D', padding: 18, borderRadius: 14, alignItems: 'center', marginTop: 10 },
    btnText: { color: '#FFF', fontWeight: '900' },

    // History Styles
    histTitle: { fontSize: 12, fontWeight: '900', color: '#9CA3AF', marginBottom: 15, letterSpacing: 1 },
    histCard: { backgroundColor: '#FFF', padding: 15, borderRadius: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 10, elevation: 2 },
    histIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    histCultura: { fontSize: 16, fontWeight: '800', color: '#111827' },
    histLocal: { fontSize: 12, color: '#6B7280', fontWeight: 'bold' },
    histDate: { fontSize: 12, fontWeight: '900', color: '#9CA3AF' },

    // Modal
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalBg: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '70%', padding: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 16, fontWeight: '900', color: '#1F2937' },
    itemRow: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    itemText: { fontSize: 15, fontWeight: 'bold', color: '#374151' },
    itemSub: { fontSize: 11, color: '#9CA3AF' },
    empty: { textAlign: 'center', marginTop: 50, color: '#9CA3AF', paddingHorizontal: 40 }
});
