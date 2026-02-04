import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { insertMaquina, getMaquinas, updateMaquinaRevisao, deleteMaquina, insertManutencaoFrota, getHistoricoManutencoes } from '../database/database';
import { LinearGradient } from 'expo-linear-gradient';

export default function FrotaScreen() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modals
    const [modalVisible, setModalVisible] = useState(false);
    const [serviceModalVisible, setServiceModalVisible] = useState(false);
    const [updateModalVisible, setUpdateModalVisible] = useState(false);

    // Form States
    const [nome, setNome] = useState('');
    const [placa, setPlaca] = useState('');
    const [tipo, setTipo] = useState('TRATOR');
    const [horimetro, setHorimetro] = useState('');
    const [revisao, setRevisao] = useState('');

    const [selectedId, setSelectedId] = useState(null); // For actions
    const [servicoDesc, setServicoDesc] = useState('');
    const [servicoValor, setServicoValor] = useState('');
    const [novoHorimetro, setNovoHorimetro] = useState('');

    useEffect(() => { loadData(); }, []);

    const up = (t, setter) => setter(t.toUpperCase());

    const loadData = async () => {
        setLoading(true);
        try { const data = await getMaquinas(); setItems(data); } catch (e) { } finally { setLoading(false); }
    };

    const handleSave = async () => {
        if (!nome.trim()) return Alert.alert('Ops!', 'Nome é obrigatório.');
        try {
            await insertMaquina({
                uuid: uuidv4(),
                nome,
                tipo,
                placa,
                horimetro_atual: parseFloat(horimetro || 0),
                intervalo_revisao: parseFloat(revisao || 0)
            });
            setModalVisible(false); cleanForms(); loadData();
        } catch (e) { Alert.alert('Erro', 'Falha ao salvar veículo.'); }
    };

    const handleUpdateKM = async () => {
        if (!novoHorimetro.trim()) return;
        try {
            // Find current revisao interval
            const currentItem = items.find(i => i.uuid === selectedId);
            await updateMaquinaRevisao(selectedId, parseFloat(novoHorimetro), currentItem ? currentItem.intervalo_revisao : 10000);
            setUpdateModalVisible(false); setNovoHorimetro(''); loadData();
        } catch (e) { Alert.alert('Erro', 'Falha ao atualizar.'); }
    };

    const handleSaveService = async () => {
        if (!servicoDesc.trim()) return;
        try {
            await insertManutencaoFrota({
                uuid: uuidv4(),
                maquina_uuid: selectedId,
                data: new Date().toLocaleDateString('pt-BR'),
                descricao: servicoDesc,
                valor: parseFloat(servicoValor.replace(',', '.') || 0)
            });
            setServiceModalVisible(false); setServicoDesc(''); setServicoValor(''); Alert.alert('Sucesso', 'Manutenção registrada!');
        } catch (e) { Alert.alert('Erro', 'Falha ao registrar serviço.'); }
    };

    const deleteItem = (uuid) => {
        Alert.alert('Excluir', 'Confirmar exclusão?', [
            { text: 'Não' }, { text: 'Sim', onPress: async () => { await deleteMaquina(uuid); loadData(); } }
        ]);
    };

    const cleanForms = () => {
        setNome(''); setPlaca(''); setTipo('TRATOR'); setHorimetro(''); setRevisao('');
    };

    const getStatusColor = (h, r) => {
        const diff = r - h;
        if (diff < 0) return { bg: '#FEF2F2', text: '#DC2626', label: 'ATRASADO', bar: '#EF4444' };
        if (diff < (r * 0.1)) return { bg: '#FFFBEB', text: '#D97706', label: 'ATENÇÃO', bar: '#F59E0B' };
        return { bg: '#ECFDF5', text: '#059669', label: 'EM DIA', bar: '#10B981' };
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>GESTÃO DE FROTA</Text>
                <Text style={styles.sub}>Controle de Veículos e Máquinas</Text>
            </View>

            {loading ? <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 50 }} /> :
                <FlatList
                    data={items}
                    keyExtractor={item => item.uuid}
                    renderItem={({ item }) => {
                        const isCar = ['CARRO', 'CAMINHAO', 'UTILITARIO'].includes(item.tipo);
                        const unit = isCar ? 'KM' : 'H';
                        const st = getStatusColor(item.horimetro_atual, item.intervalo_revisao);
                        const pct = Math.min(1, Math.max(0, item.horimetro_atual / (item.intervalo_revisao || 1)));
                        const remaining = item.intervalo_revisao - item.horimetro_atual;

                        return (
                            <View style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.iconBox}>
                                        <Text style={{ fontSize: 24 }}>{isCar ? '🚘' : '🚜'}</Text>
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={styles.cardTitle}>{item.nome}</Text>
                                        <Text style={styles.cardSub}>{item.tipo} {item.placa ? `• ${item.placa}` : ''}</Text>
                                    </View>
                                    <View style={[styles.badge, { backgroundColor: st.bg }]}>
                                        <Text style={[styles.badgeText, { color: st.text }]}>{st.label}</Text>
                                    </View>
                                </View>

                                <View style={styles.stats}>
                                    <Text style={styles.statVal}>{item.horimetro_atual} <Text style={styles.statUnit}>{unit}</Text></Text>
                                    <Text style={styles.statLabel}>Próx. Revisão: {item.intervalo_revisao} {unit}</Text>
                                </View>

                                <View style={styles.barBg}>
                                    <View style={[styles.barFill, { flex: pct, backgroundColor: st.bar }]} />
                                </View>
                                <Text style={styles.remainText}>{remaining >= 0 ? `Faltam ${remaining} ${unit}` : `Passou ${Math.abs(remaining)} ${unit}`}</Text>

                                <View style={styles.actions}>
                                    <TouchableOpacity style={[styles.actBtn, { backgroundColor: '#EFF6FF' }]} onPress={() => { setSelectedId(item.uuid); setUpdateModalVisible(true); }}>
                                        <Text style={[styles.actText, { color: '#3B82F6' }]}>ATUALIZAR {unit}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.actBtn, { backgroundColor: '#F0FDF4' }]} onPress={() => { setSelectedId(item.uuid); setServiceModalVisible(true); }}>
                                        <Text style={[styles.actText, { color: '#16A34A' }]}>SERVIÇO</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.actBtn, { backgroundColor: '#FEF2F2', width: 40 }]} onPress={() => deleteItem(item.uuid)}>
                                        <Text style={[styles.actText, { color: '#DC2626' }]}>✕</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    }}
                    contentContainerStyle={{ padding: 20 }}
                    ListEmptyComponent={<Text style={styles.empty}>Nenhum veículo cadastrado.</Text>}
                />}

            <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>

            {/* MODAL NOVOS */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <Text style={styles.modalTitle}>NOVO VEÍCULO</Text>
                        <Text style={styles.label}>NOME DO VEÍCULO</Text>
                        <TextInput style={styles.input} value={nome} onChangeText={t => up(t, setNome)} autoCapitalize="characters" />

                        <Text style={styles.label}>TIPO</Text>
                        <View style={styles.row}>
                            {['TRATOR', 'CARRO', 'CAMINHAO', 'OUTRO'].map(t => (
                                <TouchableOpacity key={t} onPress={() => setTipo(t)} style={[styles.chip, tipo === t && styles.chipActive]}>
                                    <Text style={[styles.chipText, tipo === t && { color: '#FFF' }]}>{t}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={[styles.label, { marginTop: 15, fontSize: 9, fontWeight: '900', color: '#9CA3AF' }]}>PLACA (OPCIONAL)</Text>
                        <TextInput style={styles.input} value={placa} onChangeText={t => up(t, setPlaca)} autoCapitalize="characters" />

                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 10 }}>
                                <Text style={styles.label}>ATUAL (KM/H)</Text>
                                <TextInput style={styles.input} keyboardType="numeric" value={horimetro} onChangeText={setHorimetro} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.label}>PRÓX. REVISÃO</Text>
                                <TextInput style={styles.input} keyboardType="numeric" value={revisao} onChangeText={setRevisao} placeholder="Ex: 10000" />
                            </View>
                        </View>

                        <View style={styles.modalBtns}>
                            <TouchableOpacity style={[styles.btn, styles.btnBack]} onPress={() => setModalVisible(false)}><Text style={styles.btnText}>CANCELAR</Text></TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={handleSave}><Text style={[styles.btnText, { color: '#FFF' }]}>SALVAR</Text></TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* MODAL UPDATE KM */}
            <Modal visible={updateModalVisible} transparent animationType="fade">
                <View style={styles.overlay}>
                    <View style={[styles.modal, { padding: 25 }]}>
                        <Text style={styles.modalTitle}>ATUALIZAR HORÍMETRO/KM</Text>
                        <TextInput style={styles.input} keyboardType="numeric" value={novoHorimetro} onChangeText={setNovoHorimetro} placeholder="Novo valor total..." autoFocus />
                        <View style={styles.modalBtns}>
                            <TouchableOpacity style={[styles.btn, styles.btnBack]} onPress={() => setUpdateModalVisible(false)}><Text style={styles.btnText}>CANCELAR</Text></TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={handleUpdateKM}><Text style={[styles.btnText, { color: '#FFF' }]}>ATUALIZAR</Text></TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* MODAL SERVICO */}
            <Modal visible={serviceModalVisible} transparent animationType="slide">
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <Text style={styles.modalTitle}>REGISTRAR MANUTENÇÃO</Text>
                        <Text style={styles.label}>DESCRIÇÃO DO SERVIÇO</Text>
                        <TextInput style={styles.input} value={servicoDesc} onChangeText={t => up(t, setServicoDesc)} autoCapitalize="characters" placeholder="Ex: TROCA DE ÓLEO" />

                        <Text style={styles.label}>CUSTO TOTAL (R$)</Text>
                        <TextInput style={styles.input} keyboardType="numeric" value={servicoValor} onChangeText={setServicoValor} placeholder="0,00" />

                        <View style={styles.modalBtns}>
                            <TouchableOpacity style={[styles.btn, styles.btnBack]} onPress={() => setServiceModalVisible(false)}><Text style={styles.btnText}>CANCELAR</Text></TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={handleSaveService}><Text style={[styles.btnText, { color: '#FFF' }]}>SALVAR</Text></TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: { padding: 25, paddingTop: 50 },
    title: { fontSize: 22, fontWeight: '900', color: '#1F2937' },
    sub: { fontSize: 11, color: '#9CA3AF', letterSpacing: 1, marginTop: 5 },
    card: { backgroundColor: '#FFF', borderRadius: 20, padding: 18, marginBottom: 12, elevation: 2, borderWidth: 1, borderColor: '#F3F4F6' },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    iconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
    cardTitle: { fontSize: 15, fontWeight: '800', color: '#1F2937' },
    cardSub: { fontSize: 11, color: '#9CA3AF', fontWeight: 'bold' },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    badgeText: { fontSize: 9, fontWeight: '900' },
    stats: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 },
    statVal: { fontSize: 18, fontWeight: '900', color: '#374151' },
    statUnit: { fontSize: 11, color: '#9CA3AF' },
    statLabel: { fontSize: 10, color: '#6B7280' },
    barBg: { height: 6, backgroundColor: '#F3F4F6', borderRadius: 3, overflow: 'hidden', marginBottom: 5 },
    barFill: { height: 6, borderRadius: 3 },
    remainText: { fontSize: 10, color: '#9CA3AF', textAlign: 'right', marginBottom: 15 },
    actions: { flexDirection: 'row', gap: 8 },
    actBtn: { flex: 1, padding: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    actText: { fontSize: 10, fontWeight: '900' },
    fab: { position: 'absolute', bottom: 30, right: 30, width: 64, height: 64, borderRadius: 32, backgroundColor: '#4B5563', justifyContent: 'center', alignItems: 'center', elevation: 10 },
    fabText: { fontSize: 32, color: '#FFF' },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },
    modal: { backgroundColor: '#FFF', borderRadius: 24, padding: 25 },
    modalTitle: { fontSize: 16, fontWeight: '900', marginBottom: 20, textAlign: 'center' },
    label: { fontSize: 9, fontWeight: '900', color: '#9CA3AF', marginBottom: 6, letterSpacing: 1 },
    input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, marginBottom: 15, fontSize: 14, color: '#111827' },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
    modalBtns: { flexDirection: 'row', gap: 10, marginTop: 10 },
    btn: { flex: 1, padding: 16, borderRadius: 14, alignItems: 'center' },
    btnBack: { backgroundColor: '#F3F4F6' },
    btnSave: { backgroundColor: '#4B5563' },
    btnText: { fontWeight: 'bold', fontSize: 11 },
    chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, backgroundColor: '#F3F4F6', marginRight: 5, marginBottom: 5 },
    chipActive: { backgroundColor: '#4B5563' },
    chipText: { fontSize: 10, fontWeight: 'bold', color: '#6B7280' },
    empty: { textAlign: 'center', marginTop: 100, color: '#9CA3AF' }
});
