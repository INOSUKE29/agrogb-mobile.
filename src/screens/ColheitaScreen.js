import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, FlatList, ActivityIndicator } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { insertColheita, getCadastro, getConfig, setConfig, insertDescarte, getColheitasRecentes, updateColheita, deleteColheita, getCulturas, insertCadastro as insertCadastros } from '../database/database';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

const up = (t, setter) => setter(t.toUpperCase());


export default function ColheitaScreen({ navigation }) {
    const [talhao, setTalhao] = useState('');
    const [produto, setProduto] = useState('');
    const [quantidade, setQuantidade] = useState('');
    const [observacao, setObservacao] = useState('');

    // Novas Variáveis
    const [congelado, setCongelado] = useState('');
    const [descarte, setDescarte] = useState('');
    const [qtdCaixas, setQtdCaixas] = useState('');
    const [fatorAtual, setFatorAtual] = useState(1); // Fator do produto selecionado
    // const [pesoCaixa, setPesoCaixa] = useState('0'); // Deprecated Global Config

    const [history, setHistory] = useState([]);
    const [editingUuid, setEditingUuid] = useState(null);

    // Modal States
    const [productModalVisible, setProductModalVisible] = useState(false);
    const [areaModalVisible, setAreaModalVisible] = useState(false);
    const [configModal, setConfigModal] = useState(false);
    const [quickAddModal, setQuickAddModal] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [newItemFator, setNewItemFator] = useState('1');

    // Lists
    const [productsDB, setProductsDB] = useState([]); // Do cadastro
    const [areasDB, setAreasDB] = useState([]); // Da tabela de culturas

    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);

    useFocusEffect(useCallback(() => {
        loadData();
    }, []));

    const loadData = async () => {
        setLoading(true);
        try {
            // Load Products (Cadastro)
            const allItems = await getCadastro();
            // Strict Filter: Only PRODUTO for Colheita
            const prods = allItems.filter(i => i.tipo === 'PRODUTO');
            setProductsDB(Array.isArray(prods) ? prods : []);

            // Load Areas (Culturas Table)
            const areas = await getCulturas();
            setAreasDB(Array.isArray(areas) ? areas : []);

            // Load History
            const hist = await getColheitasRecentes();
            setHistory(Array.isArray(hist) ? hist : []);
        } catch (e) {
            console.error("Colheita Load Error:", e);
            Alert.alert('Erro ao carregar', 'Falha ao buscar dados. Tente reiniciar o app.');
        } finally {
            setLoading(false);
        }
    };

    // Calculate Weight automatically when boxes change
    const handleCaixasChange = (txt) => {
        setQtdCaixas(txt);
        const boxes = parseFloat(txt) || 0;
        const weight = fatorAtual || 1;
        if (boxes > 0) {
            setQuantidade((boxes * weight).toFixed(2));
        } else {
            setQuantidade('');
        }
    };

    const handleProdutoSelect = (item) => {
        setProduto(item.nome);
        setFatorAtual(item.fator_conversao || 1);
        setProductModalVisible(false);

        // Recalculate if boxes exist
        if (qtdCaixas) {
            const boxes = parseFloat(qtdCaixas) || 0;
            setQuantidade((boxes * (item.fator_conversao || 1)).toFixed(2));
        }
    };

    const saveConfig = async () => {
        // Deprecated - Config is now in Cadastro
        setConfigModal(false);
        Alert.alert('Info', 'Agora configure o peso/fator diretamente no Cadastro do Produto.');
    };

    const getFilteredProducts = () => {
        if (!searchText) return productsDB;
        if (!searchText) return productsDB || [];
        return (productsDB || []).filter(i => i && i.nome && i.nome.toUpperCase().includes(searchText.toUpperCase()));
    };




    const quickSave = async () => {
        if (!newItemName.trim()) { Alert.alert('Ops', 'Nome é obrigatório'); return; }
        const newUuid = uuidv4();
        try {
            await insertCadastros({
                uuid: newUuid,
                nome: newItemName,
                tipo: 'PRODUTO',
                fator_conversao: parseFloat(newItemFator) || 1,
                unidade: 'CX',
                observacao: 'Cadastrado no Quick Add',
                estocavel: 1,
                vendavel: 1
            });
            // Reload and Select
            // Reload Strict
            const allItems = await getCadastro();
            const prods = allItems.filter(i => i.tipo === 'PRODUTO');
            setProductsDB(Array.isArray(prods) ? prods : []);

            // Find and click
            const newItem = prods.find(p => p.uuid === newUuid) || { nome: newItemName, fator_conversao: parseFloat(newItemFator) || 1 };
            handleProdutoSelect(newItem);

            setQuickAddModal(false);
            setNewItemName('');
            setNewItemFator('1');
        } catch (e) {
            Alert.alert('Erro', 'Falha ao criar produto.');
        }
    };

    const salvar = async () => {
        if (!talhao || !produto || !quantidade) {
            Alert.alert('Atenção', 'Preencha Local, Produto e Quantidade (*)');
            return;
        }

        const dados = {
            uuid: editingUuid || uuidv4(),
            cultura: talhao.toUpperCase(),
            produto: produto.toUpperCase(),
            quantidade: parseFloat(quantidade),
            congelado: parseFloat(congelado) || 0,
            observacao: observacao.toUpperCase(),
            data: new Date().toISOString().split('T')[0]
        };

        try {
            if (editingUuid) {
                await updateColheita(editingUuid, dados);
                Alert.alert('Sucesso', 'Registro atualizado!');
                setEditingUuid(null);
            } else {
                await insertColheita(dados);

                // Salvar Descarte se houver
                const qtdDescarte = parseFloat(descarte);
                if (qtdDescarte > 0) {
                    await insertDescarte({
                        uuid: uuidv4(),
                        produto: produto.toUpperCase(),
                        quantidade_kg: qtdDescarte,
                        motivo: 'APONTAMENTO DE CAMPO',
                        data: new Date().toISOString().split('T')[0]
                    });
                    Alert.alert('Sucesso', `Colheita e ${qtdDescarte}kg de descarte registrados.`);
                } else {
                    Alert.alert('Sucesso', 'Colheita registrada!');
                }
            }

            // Reset
            setQtdCaixas('');
            setQuantidade('');
            setCongelado('');
            setDescarte('');
            setObservacao('');

            // Reload History
            const hist = await getColheitasRecentes();
            setHistory(hist);
        } catch (error) {
            Alert.alert('Erro', 'Falha ao salvar registro.');
        }
    };

    const handleEdit = (item) => {
        setEditingUuid(item.uuid);
        setTalhao(item.cultura);
        setProduto(item.produto);
        setQuantidade(item.quantidade.toString());
        setCongelado(item.congelado ? item.congelado.toString() : '');
        setObservacao(item.observacao || '');
    };

    const handleDelete = (item) => {
        Alert.alert('Excluir', 'Confirmar exclusão?', [
            { text: 'Não', style: 'cancel' },
            {
                text: 'Sim',
                style: 'destructive',
                onPress: async () => {
                    await deleteColheita(item.uuid);
                    loadData();
                }
            }
        ]);
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <View style={styles.card}>
                    <LinearGradient colors={['#10B981', '#059669']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.cardHeader}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View>
                                <Text style={styles.headerTitle}>{editingUuid ? 'EDITAR APONTAMENTO' : 'REGISTRO DE CAMPO'}</Text>
                                <Text style={styles.headerSub}>Colheita, Descarte e Congelados</Text>
                            </View>
                            <TouchableOpacity style={styles.configBtn} onPress={() => setConfigModal(true)}>
                                <Ionicons name="settings-sharp" size={20} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>

                    <View style={styles.form}>
                        {/* AREA SELECTOR */}
                        <View style={styles.field}>
                            <Text style={styles.label}>LOCAL / ÁREA (ONDE?)</Text>
                            <TouchableOpacity style={styles.selectBtn} onPress={() => setAreaModalVisible(true)}>
                                <Text style={[styles.selectText, !talhao && { color: '#9CA3AF' }]}>
                                    {talhao || "SELECIONAR ÁREA..."}
                                </Text>
                                <Ionicons name="map" size={20} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        {/* PRODUCT SELECTOR */}
                        <View style={styles.field}>
                            <Text style={styles.label}>VARIEDADE / PRODUTO (O QUE?)</Text>
                            <TouchableOpacity style={styles.selectBtn} onPress={() => setProductModalVisible(true)}>
                                <Text style={[styles.selectText, !produto && { color: '#9CA3AF' }]}>
                                    {produto || "SELECIONAR PRODUTO..."}
                                </Text>
                                <Ionicons name="leaf" size={20} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        {/* CONVERSION ROW */}
                        <View style={styles.row}>
                            <View style={[styles.field, { flex: 1, marginRight: 10 }]}>
                                <Text style={styles.label}>QTD VOLUMES / CAIXAS</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0"
                                    value={qtdCaixas}
                                    onChangeText={handleCaixasChange}
                                    keyboardType="decimal-pad"
                                />
                                <Text style={styles.helper}>Fator: {fatorAtual} Kg/Un</Text>
                            </View>
                            <View style={[styles.field, { flex: 1 }]}>
                                <Text style={styles.label}>TOTAL KG *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0.00"
                                    value={quantidade}
                                    onChangeText={setQuantidade}
                                    keyboardType="decimal-pad"
                                />
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.field, { flex: 1, marginRight: 10 }]}>
                                <Text style={styles.label}>DESCARTE (KG)</Text>
                                <TextInput
                                    style={[styles.input, { borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' }]}
                                    placeholder="0.00"
                                    value={descarte}
                                    onChangeText={setDescarte}
                                    keyboardType="decimal-pad"
                                />
                            </View>
                            <View style={[styles.field, { flex: 1 }]}>
                                <Text style={styles.label}>CONGELADO (KG)</Text>
                                <TextInput
                                    style={[styles.input, { borderColor: '#93C5FD', backgroundColor: '#EFF6FF' }]}
                                    placeholder="0.00"
                                    value={congelado}
                                    onChangeText={setCongelado}
                                    keyboardType="decimal-pad"
                                />
                            </View>
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>OBSERVAÇÕES TÉCNICAS</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="DETALHES DA COLHEITA..."
                                value={observacao}
                                onChangeText={(t) => up(t, setObservacao)}
                                multiline
                                autoCapitalize="characters"
                            />
                        </View>

                        <View style={styles.row}>
                            {editingUuid && (
                                <TouchableOpacity style={[styles.btn, { backgroundColor: '#EF4444', flex: 1, marginRight: 10 }]} onPress={() => { setEditingUuid(null); setTalhao(''); setProduto(''); setQuantidade(''); setCongelado(''); setDescarte(''); setObservacao(''); setQtdCaixas(''); }}>
                                    <Text style={styles.btnText}>CANCELAR</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity style={[styles.btn, { flex: 2 }]} onPress={salvar}>
                                <Text style={styles.btnText}>{editingUuid ? 'SALVAR ALTERAÇÕES' : 'CONFIRMAR REGISTRO'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* HISTÓRICO */}
                <Text style={styles.historyTitle}>REGISTROS DE CAMPO</Text>
                {history.map(item => (
                    <View key={item.uuid} style={styles.historyItem}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.hProd}>{item?.produto || 'Produto?'}</Text>
                            <Text style={styles.hSub}>{item?.cultura || '?'} • {item?.data ? new Date(item.data).toLocaleDateString() : '-'}</Text>
                            <Text style={styles.hVal}>{item?.quantidade || 0} Kg {item?.congelado > 0 ? `(+${item.congelado}kg Cong)` : ''}</Text>
                        </View>
                        <View style={styles.actions}>
                            <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionBtn}>
                                <Ionicons name="create-outline" size={20} color="#10B981" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionBtn}>
                                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* PRODUCT MODAL */}
            <Modal visible={productModalVisible} animationType="slide" transparent>
                <View style={styles.overlay}>
                    <View style={styles.modalBg}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>SELECIONAR PRODUTO</Text>
                            <View style={{ flexDirection: 'row', gap: 15 }}>
                                <TouchableOpacity onPress={() => { setProductModalVisible(false); setQuickAddModal(true); }}>
                                    <Ionicons name="add-circle" size={28} color="#10B981" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setProductModalVisible(false)}>
                                    <Ionicons name="close" size={24} color="#374151" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <TextInput style={styles.searchBar} placeholder="Buscar produto..." value={searchText} onChangeText={t => up(t, setSearchText)} autoCapitalize="characters" />
                        <FlatList
                            data={getFilteredProducts()}
                            keyExtractor={i => i.uuid || i.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.itemRow} onPress={() => handleProdutoSelect(item || {})}>
                                    <Text style={styles.itemText}>{item?.nome || 'Sem Nome'}</Text>
                                    <Text style={styles.itemSub}>{item?.tipo || 'OUTROS'} • Fator: {item?.fator_conversao || 1}</Text>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={<Text style={styles.empty}>Nenhum produto cadastrado.</Text>}
                        />
                    </View>
                </View>
            </Modal>

            {/* AREA MODAL (CULTURAS) */}
            <Modal visible={areaModalVisible} animationType="slide" transparent>
                <View style={styles.overlay}>
                    <View style={styles.modalBg}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>SELECIONAR LOCAL</Text>
                            <TouchableOpacity onPress={() => setAreaModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#374151" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={areasDB}
                            keyExtractor={i => i.uuid || i.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.itemRow} onPress={() => { setTalhao(item.nome); setAreaModalVisible(false); }}>
                                    <Text style={styles.itemText}>{item?.nome || 'Sem Nome'}</Text>
                                    <Text style={styles.itemSub}>{item?.observacao || 'Sem obs'}</Text>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <TouchableOpacity style={styles.empty} onPress={() => { setAreaModalVisible(false); navigation.navigate('Culturas'); }}>
                                    <Text style={{ color: '#10B981' }}>Nenhuma área cadastrada. Clique para adicionar.</Text>
                                </TouchableOpacity>
                            }
                        />
                    </View>
                </View>
            </Modal>

            {/* CONFIG MODAL */}
            <Modal visible={configModal} animationType="fade" transparent>
                <View style={styles.overlayCenter}>
                    <View style={styles.miniModal}>
                        <Text style={styles.modalTitle}>Configuração</Text>
                        <Text style={[styles.label, { marginTop: 20 }]}>NOTA:</Text>
                        <Text style={{ textAlign: 'center', color: '#6B7280', marginVertical: 10 }}>
                            A configuração de peso agora é feita individualmente no CADASTRO DE CADA PRODUTO.
                        </Text>
                        <View style={styles.row}>
                            <TouchableOpacity style={[styles.btn, { backgroundColor: '#9CA3AF', flex: 1, marginRight: 10, marginTop: 20 }]} onPress={() => setConfigModal(false)}>
                                <Text style={styles.btnText}>CANCELAR</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, { marginTop: 20, flex: 1 }]} onPress={saveConfig}>
                                <Text style={styles.btnText}>SALVAR</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* QUICK ADD MODAL */}
            <Modal visible={quickAddModal} animationType="slide" transparent>
                <View style={styles.overlayCenter}>
                    <View style={styles.miniModal}>
                        <Text style={styles.modalTitle}>NOVO PRODUTO RÁPIDO</Text>
                        <View style={styles.field}>
                            <Text style={styles.label}>NOME DO PRODUTO</Text>
                            <TextInput style={styles.input} value={newItemName} onChangeText={t => up(t, setNewItemName)} autoCapitalize="characters" placeholder="EX: MORANGO ESPEC" />
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.label}>FATOR (KG POR UNIDADE)</Text>
                            <TextInput style={styles.input} value={newItemFator} onChangeText={setNewItemFator} keyboardType="decimal-pad" placeholder="1.0" />
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
    configBtn: { padding: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },
    form: { padding: 25 },
    field: { marginBottom: 20 },
    row: { flexDirection: 'row' },
    label: { fontSize: 9, fontWeight: '900', color: '#9CA3AF', letterSpacing: 1.5, marginBottom: 8 },
    input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 16, fontSize: 15, color: '#111827' },
    textArea: { height: 100, textAlignVertical: 'top' },
    btn: { backgroundColor: '#10B981', paddingVertical: 18, borderRadius: 18, alignItems: 'center', marginTop: 10 },
    btnText: { color: '#FFF', fontSize: 13, fontWeight: '900', letterSpacing: 1 },
    selectBtn: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    selectText: { fontSize: 15, fontWeight: '600', color: '#111827' },
    helper: { fontSize: 10, color: '#059669', marginTop: 4, fontWeight: 'bold', marginLeft: 4 },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    overlayCenter: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 30 },
    modalBg: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '80%', padding: 20 },
    miniModal: { backgroundColor: '#FFF', borderRadius: 24, padding: 30 },
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
    actions: { flexDirection: 'row', gap: 10 },
    actionBtn: { padding: 8, backgroundColor: '#F3F4F6', borderRadius: 8 }
});
