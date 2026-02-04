import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, FlatList, ActivityIndicator, Vibration } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { insertCompra, getCadastro, getComprasRecentes, updateCompra, deleteCompra, insertCadastro as insertCadastros } from '../database/database';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera } from 'expo-camera';
import { useFocusEffect } from '@react-navigation/native';

export default function ComprasScreen({ navigation }) {
    const [item, setItem] = useState('');
    const [quantidade, setQuantidade] = useState('');
    const [valor, setValor] = useState('');
    const [cultura, setCultura] = useState('');
    const [observacao, setObservacao] = useState('');
    const [detalhes, setDetalhes] = useState(''); // Bula / Info Técnica
    const [editingUuid, setEditingUuid] = useState(null);

    const [history, setHistory] = useState([]);

    // Selection Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [items, setItems] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);

    // Quick Add State
    const [quickAddModal, setQuickAddModal] = useState(false);
    const [newItemName, setNewItemName] = useState('');

    // Camera State
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [cameraVisible, setCameraVisible] = useState(false);

    useFocusEffect(useCallback(() => {
        loadItems();
        loadHistory();
    }, []));

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const loadItems = async () => {
        setLoading(true);
        try {
            const all = await getCadastro();
            // Strict Filter: INSUMO or EMBALAGEM for Compras
            const inputs = all.filter(i => ['INSUMO', 'EMBALAGEM'].includes(i.tipo));
            setItems(inputs);
        } catch (e) { } finally { setLoading(false); }
    };

    const loadHistory = async () => {
        const data = await getComprasRecentes();
        setHistory(data);
    };

    const handleBarCodeScanned = ({ type, data }) => {
        setScanned(true);
        Vibration.vibrate();
        setCameraVisible(false);
        setObservacao(prev => {
            const prefix = prev ? prev + ' | ' : '';
            return prefix + `Nota/Ref: ${data}`;
        });
        Alert.alert('Código Escaneado', `Código ${data} adicionado à observação.`);
    };

    const getFilteredItems = () => {
        if (!searchText) return items;
        return items.filter(i => i.nome.includes(searchText.toUpperCase()));
    };

    const up = (t, setter) => setter(t.toUpperCase());

    const quickSave = async () => {
        if (!newItemName.trim()) { Alert.alert('Ops', 'Nome é obrigatório'); return; }
        const newUuid = uuidv4();
        try {
            await insertCadastros({
                uuid: newUuid,
                nome: newItemName,
                tipo: 'INSUMO',
                unidade: 'UN',
                observacao: 'Cadastrado na Compra (Quick)',
                estocavel: 1,
                vendavel: 0
            });
            // Reload
            // Reload Strict
            const all = await getCadastro();
            const inputs = all.filter(i => ['INSUMO', 'EMBALAGEM'].includes(i.tipo));
            setItems(inputs);

            // Select
            // Select
            handleEdit({ item: newItemName, uuid: null, quantidade: '', valor: '', cultura: '', observacao: '', detalhes: '' }); // Just set item name really
            setItem(newItemName);
            setModalVisible(false); // Close main modal
            setQuickAddModal(false);
            setNewItemName('');
        } catch (e) { Alert.alert('Erro', 'Falha ao criar item.'); }
    };

    const salvar = async () => {
        if (!item || !quantidade || !valor) {
            Alert.alert('Alerta', 'Preencha os campos obrigatórios (*)');
            return;
        }

        const dados = {
            uuid: editingUuid || uuidv4(),
            item: item.toUpperCase(),
            quantidade: parseFloat(quantidade) || 0,
            valor: parseFloat(valor) || 0,
            cultura: (cultura || 'GERAL').toUpperCase(),
            observacao: observacao.toUpperCase(),
            detalhes: detalhes.toUpperCase(),
            data: new Date().toISOString().split('T')[0]
        };

        try {
            if (editingUuid) {
                await updateCompra(editingUuid, dados);
                Alert.alert('Sucesso', 'Registro atualizado.');
                setEditingUuid(null);
            } else {
                await insertCompra(dados);
                Alert.alert('Sucesso', 'Entrada registrada.');
            }

            setItem('');
            setQuantidade('');
            setValor('');
            setQuantidade('');
            setValor('');
            setObservacao('');
            setDetalhes('');

            loadHistory();
        } catch (error) {
            Alert.alert('Erro', 'Falha ao salvar compra.');
        }
    };

    const handleEdit = (rec) => {
        setEditingUuid(rec.uuid);
        setItem(rec.item);
        setQuantidade(rec.quantidade.toString());
        setValor(rec.valor.toString());
        setCultura(rec.cultura);
        setObservacao(rec.observacao || '');
        setDetalhes(rec.detalhes || '');
    };

    const handleDelete = (rec) => {
        Alert.alert('Excluir', 'Confirmar exclusão?', [
            { text: 'Não', style: 'cancel' },
            {
                text: 'Sim',
                style: 'destructive',
                onPress: async () => {
                    await deleteCompra(rec.uuid);
                    loadHistory();
                }
            }
        ]);
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <View style={styles.card}>
                    <LinearGradient colors={['#6366F1', '#4F46E5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.cardHeader}>
                        <Text style={styles.headerTitle}>{editingUuid ? 'EDITAR COMPRA' : 'ENTRADA DE INSUMOS'}</Text>
                        <Text style={styles.headerSub}>Compras e Suprimentos da Fazenda</Text>
                    </LinearGradient>

                    <View style={styles.form}>
                        {/* CAMERA BUTTON */}
                        <TouchableOpacity style={styles.scanBtn} onPress={() => {
                            if (!hasPermission) {
                                Alert.alert('Permissão', 'Acesso à câmera necessário.');
                                return;
                            }
                            setScanned(false);
                            setCameraVisible(true);
                        }}>
                            <Ionicons name="scan" size={20} color="#4F46E5" />
                            <Text style={styles.scanText}>ESCANEAR CÓDIGO / NOTA</Text>
                        </TouchableOpacity>

                        <View style={styles.field}>
                            <Text style={styles.label}>PRODUTO / INSUMO COMPRADO *</Text>
                            <TouchableOpacity style={styles.selectBtn} onPress={() => setModalVisible(true)}>
                                <Text style={[styles.selectText, !item && { color: '#9CA3AF' }]}>
                                    {item || "SELECIONAR ITEM..."}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.field, { flex: 1, marginRight: 10 }]}>
                                <Text style={styles.label}>QUANTIDADE *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0"
                                    value={quantidade}
                                    onChangeText={setQuantidade}
                                    keyboardType="decimal-pad"
                                />
                            </View>
                            <View style={[styles.field, { flex: 1 }]}>
                                <Text style={styles.label}>VALOR TOTAL R$ *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0.00"
                                    value={valor}
                                    onChangeText={setValor}
                                    keyboardType="decimal-pad"
                                />
                            </View>
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>VINCULAR À CULTURA</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="EX: MORANGO ALBION ou GERAL"
                                value={cultura}
                                onChangeText={(t) => up(t, setCultura)}
                                autoCapitalize="characters"
                            />
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>DETALHES TÉCNICOS / BULA</Text>
                            <TextInput
                                style={[styles.input, { height: 60 }]}
                                placeholder="EX: NPK 04-14-08, APLICAÇÃO FOLIAR..."
                                value={detalhes}
                                onChangeText={(t) => up(t, setDetalhes)}
                                multiline
                                autoCapitalize="characters"
                            />
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>DETALHES / FORNECEDOR / NOTA</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="NOTAS SOBRE A COMPRA..."
                                value={observacao}
                                onChangeText={(t) => up(t, setObservacao)}
                                multiline
                                autoCapitalize="characters"
                            />
                        </View>

                        <View style={styles.row}>
                            {editingUuid && (
                                <TouchableOpacity style={[styles.btn, { backgroundColor: '#EF4444', flex: 1, marginRight: 10 }]} onPress={() => { setEditingUuid(null); setItem(''); setQuantidade(''); setValor(''); setObservacao(''); setDetalhes(''); setCultura(''); }}>
                                    <Text style={styles.btnText}>CANCELAR</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity style={[styles.btn, { flex: 2 }]} onPress={salvar}>
                                <Text style={styles.btnText}>{editingUuid ? 'SALVAR ALTERAÇÕES' : 'REGISTRAR ENTRADA'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* HISTÓRICO */}
                <Text style={styles.historyTitle}>ENTRADAS RECENTES</Text>
                {history.map(rec => (
                    <View key={rec.uuid} style={styles.historyItem}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.hProd}>{rec.item}</Text>
                            <Text style={styles.hSub}>{new Date(rec.data).toLocaleDateString()} • {rec.cultura || 'Geral'}</Text>
                            <Text style={styles.hVal}>{rec.quantidade} un • R$ {rec.valor.toFixed(2)}</Text>
                            {rec.detalhes ? <Text style={[styles.hObs, { color: '#4B5563', fontWeight: 'bold' }]}>📦 {rec.detalhes}</Text> : null}
                            {rec.observacao ? <Text style={styles.hObs}>📝 {rec.observacao}</Text> : null}
                        </View>
                        <View style={styles.actions}>
                            <TouchableOpacity onPress={() => handleEdit(rec)} style={styles.actionBtn}>
                                <Ionicons name="create-outline" size={20} color="#4F46E5" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDelete(rec)} style={styles.actionBtn}>
                                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* CAMERA MODAL */}
            <Modal visible={cameraVisible} animationType="slide">
                <Camera
                    style={StyleSheet.absoluteFill}
                    onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                >
                    <View style={styles.cameraOverlay}>
                        <View style={styles.scanBox} />
                        <TouchableOpacity style={styles.closeCamera} onPress={() => setCameraVisible(false)}>
                            <Text style={styles.closeCameraText}>CANCELAR SCANNER</Text>
                        </TouchableOpacity>
                    </View>
                </Camera>
            </Modal>

            {/* SELECTION MODAL */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.overlay}>
                    <View style={styles.modalBg}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>SELECIONAR MATERIAL</Text>
                            <View style={{ flexDirection: 'row', gap: 15 }}>
                                <TouchableOpacity onPress={() => { setModalVisible(false); setQuickAddModal(true); }}>
                                    <Ionicons name="add-circle" size={28} color="#6366F1" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Ionicons name="close" size={24} color="#374151" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TextInput
                            style={styles.searchBar}
                            placeholder="Buscar item..."
                            value={searchText}
                            onChangeText={t => up(t, setSearchText)}
                            autoCapitalize="characters"
                        />

                        {loading ? <ActivityIndicator color="#6366F1" /> :
                            <FlatList
                                data={getFilteredItems()}
                                keyExtractor={i => i.uuid || i.id.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity style={styles.itemRow} onPress={() => { setItem(item.nome); setModalVisible(false); }}>
                                        <Text style={styles.itemText}>{item.nome}</Text>
                                        <Text style={styles.itemSub}>{item.tipo} • {item.unidade}</Text>
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={<Text style={styles.empty}>Nenhum material encontrado.</Text>}
                            />
                        }
                    </View>
                </View>
            </Modal>

            {/* QUICK ADD MODAL */}
            <Modal visible={quickAddModal} animationType="slide" transparent>
                <View style={styles.overlay}>
                    <View style={[styles.modalBg, { height: 'auto', paddingBottom: 40 }]}>
                        <Text style={styles.modalTitle}>NOVO INSUMO RÁPIDO</Text>
                        <View style={styles.field}>
                            <Text style={styles.label}>NOME DO ITEM</Text>
                            <TextInput style={styles.input} value={newItemName} onChangeText={t => up(t, setNewItemName)} autoCapitalize="characters" placeholder="EX: ADUBO ORGANICO" />
                        </View>
                        <View style={styles.row}>
                            <TouchableOpacity style={[styles.btn, { backgroundColor: '#EF4444', flex: 1, marginRight: 10 }]} onPress={() => setQuickAddModal(false)}>
                                <Text style={styles.btnText}>CANCELAR</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, { flex: 1 }]} onPress={quickSave}>
                                <Text style={styles.btnText}>SALVAR</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB', padding: 20 },
    card: { backgroundColor: '#FFF', borderRadius: 32, overflow: 'hidden', elevation: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, marginBottom: 30 },
    cardHeader: { padding: 30 },
    headerTitle: { fontSize: 18, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
    headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 5, fontWeight: 'bold' },
    form: { padding: 25 },
    field: { marginBottom: 20 },
    row: { flexDirection: 'row' },
    label: { fontSize: 9, fontWeight: '900', color: '#9CA3AF', letterSpacing: 1.5, marginBottom: 8 },
    input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 16, fontSize: 15, color: '#111827' },
    textArea: { height: 80, textAlignVertical: 'top' },
    btn: { backgroundColor: '#6366F1', paddingVertical: 18, borderRadius: 18, alignItems: 'center', marginTop: 10 },
    btnText: { color: '#FFF', fontSize: 13, fontWeight: '900', letterSpacing: 1 },
    selectBtn: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    selectText: { fontSize: 15, fontWeight: '600', color: '#111827' },
    scanBtn: { flexDirection: 'row', backgroundColor: '#EEF2FF', padding: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#C7D2FE' },
    scanText: { color: '#4F46E5', fontWeight: 'bold', marginLeft: 8, fontSize: 12, letterSpacing: 0.5 },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalBg: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '80%', padding: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 16, fontWeight: '900', color: '#1F2937' },
    searchBar: { backgroundColor: '#F3F4F6', padding: 12, borderRadius: 12, marginBottom: 10, fontSize: 14 },
    itemRow: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    itemText: { fontSize: 14, fontWeight: 'bold', color: '#374151' },
    itemSub: { fontSize: 10, color: '#9CA3AF' },
    empty: { textAlign: 'center', marginTop: 20, color: '#9CA3AF' },
    historyTitle: { fontSize: 12, fontWeight: '900', color: '#6B7280', letterSpacing: 1, marginBottom: 15, marginLeft: 10 },
    historyItem: { backgroundColor: '#FFF', padding: 15, borderRadius: 16, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 5, elevation: 2 },
    hProd: { fontSize: 14, fontWeight: 'bold', color: '#1F2937' },
    hSub: { fontSize: 11, color: '#9CA3AF' },
    hVal: { fontSize: 12, fontWeight: '900', color: '#059669', marginTop: 4 },
    hObs: { fontSize: 10, color: '#6B7280', marginTop: 2, fontStyle: 'italic' },
    actions: { flexDirection: 'row', gap: 10 },
    actionBtn: { padding: 8, backgroundColor: '#F3F4F6', borderRadius: 8 },
    cameraOverlay: { flex: 1, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' },
    scanBox: { width: 250, height: 250, borderWidth: 2, borderColor: '#FFF', borderRadius: 20 },
    closeCamera: { position: 'absolute', bottom: 50, backgroundColor: '#FFF', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 30 },
    closeCameraText: { color: '#000', fontWeight: 'bold' }
});
