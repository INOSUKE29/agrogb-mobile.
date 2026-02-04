import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, FlatList, ActivityIndicator } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { insertVenda, getCadastro, getClientes, insertCliente, getVendasRecentes, deleteVenda, updateVenda } from '../database/database';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

export default function VendasScreen({ navigation }) {
    const [cliente, setCliente] = useState('');
    const [produto, setProduto] = useState('');
    const [quantidade, setQuantidade] = useState('');
    const [valor, setValor] = useState('');
    const [observacao, setObservacao] = useState('');
    const [editingUuid, setEditingUuid] = useState(null);

    // Data State
    const [history, setHistory] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    // Modal States
    const [modalVisible, setModalVisible] = useState(false); // Product
    const [clientModalVisible, setClientModalVisible] = useState(false); // Client
    const [newClientModal, setNewClientModal] = useState(false); // New Client Form

    // Lists
    const [items, setItems] = useState([]);
    const [clients, setClients] = useState([]);

    // Search
    const [searchText, setSearchText] = useState('');
    const [clientSearchText, setClientSearchText] = useState('');
    const [loading, setLoading] = useState(false);

    // New Client Form State
    const [newClientName, setNewClientName] = useState('');
    const [newClientPhone, setNewClientPhone] = useState('');

    useFocusEffect(useCallback(() => {
        loadInitialData();
        loadHistory();
    }, []));

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const allItems = await getCadastro();
            const sellable = allItems.filter(i => i.vendavel === 1 || i.vendavel === true || i.vendavel === "1");
            setItems(sellable);

            const allClients = await getClientes();
            setClients(allClients);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const loadHistory = async () => {
        const data = await getVendasRecentes();
        setHistory(data);
    };

    const up = (t, setter) => setter(t.toUpperCase());

    const handleSaveClient = async () => {
        if (!newClientName.trim()) return Alert.alert('Erro', 'Nome do cliente obrigatório');
        try {
            const uuid = uuidv4();
            await insertCliente({
                uuid,
                nome: newClientName,
                telefone: newClientPhone,
                endereco: '',
                cpf_cnpj: '',
                observacao: 'CADASTRADO NA VENDA'
            });
            setNewClientName('');
            setNewClientPhone('');
            setNewClientModal(false);

            // Reload clients and select the new one
            const updatedClients = await getClientes();
            setClients(updatedClients);
            setCliente(newClientName.toUpperCase());
            setClientModalVisible(false);
        } catch (e) {
            Alert.alert('Erro', 'Falha ao criar cliente');
        }
    };

    const salvar = async () => {
        if (!produto || !quantidade || !valor) {
            Alert.alert('Atenção', 'Produto, Qtd e Valor são obrigatórios.');
            return;
        }

        const dados = {
            uuid: editingUuid || uuidv4(),
            cliente: (cliente || 'BALCÃO').toUpperCase(),
            produto: produto.toUpperCase(),
            quantidade: parseFloat(quantidade),
            valor: parseFloat(valor),
            observacao: observacao.toUpperCase(),
            data: new Date().toISOString().split('T')[0]
        };

        try {
            if (editingUuid) {
                await updateVenda(editingUuid, dados);
                Alert.alert('Sucesso', 'Venda atualizada!');
                setEditingUuid(null);
            } else {
                await insertVenda(dados);
                Alert.alert('Sucesso', 'Venda registrada!');
            }

            // Reset Form (keep Client maybe? No, reset all for fresh sale)
            setProduto('');
            setQuantidade('');
            setValor('');
            setObservacao('');
            // setCliente(''); // Optional: keep client selected for rapid entry

            loadHistory();
        } catch (error) {
            Alert.alert('Erro', 'Falha ao processar venda.');
        }
    };

    const handleEdit = (item) => {
        setEditingUuid(item.uuid);
        setCliente(item.cliente);
        setProduto(item.produto);
        setQuantidade(item.quantidade.toString());
        setValor(item.valor.toString());
        setObservacao(item.observacao || '');
        // Scroll to top?
    };

    const handleDelete = (item) => {
        Alert.alert('Excluir', 'Deseja excluir esta venda?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Excluir',
                style: 'destructive',
                onPress: async () => {
                    await deleteVenda(item.uuid);
                    loadHistory();
                }
            }
        ]);
    };

    const getFilteredItems = () => {
        if (!searchText) return items;
        return items.filter(i => i.nome.includes(searchText.toUpperCase()));
    };

    const getFilteredClients = () => {
        if (!clientSearchText) return clients;
        return clients.filter(c => c.nome.includes(clientSearchText.toUpperCase()));
    };

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <View style={styles.card}>
                    <LinearGradient colors={['#3B82F6', '#2563EB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.cardHeader}>
                        <Text style={styles.headerTitle}>{editingUuid ? 'EDITAR VENDA' : 'FLUXO DE VENDAS'}</Text>
                        <Text style={styles.headerSub}>{editingUuid ? 'Alterando registro existente' : 'Faturamento e Saída de Estoque'}</Text>
                    </LinearGradient>

                    <View style={styles.form}>
                        <View style={styles.field}>
                            <Text style={styles.label}>CLIENTE / PARCEIRO</Text>
                            <TouchableOpacity style={styles.selectBtn} onPress={() => setClientModalVisible(true)}>
                                <Text style={[styles.selectText, !cliente && { color: '#9CA3AF' }]}>
                                    {cliente || "SELECIONAR CLIENTE..."}
                                </Text>
                                <Ionicons name="people" size={20} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.field}>
                            <Text style={styles.label}>PRODUTO VENDIDO *</Text>
                            <TouchableOpacity style={styles.selectBtn} onPress={() => setModalVisible(true)}>
                                <Text style={[styles.selectText, !produto && { color: '#9CA3AF' }]}>
                                    {produto || "SELECIONAR PRODUTO..."}
                                </Text>
                                <Ionicons name="chevron-down" size={20} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.field, { flex: 1, marginRight: 10 }]}>
                                <Text style={styles.label}>QTD *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="0.00"
                                    value={quantidade}
                                    onChangeText={setQuantidade}
                                    keyboardType="decimal-pad"
                                />
                            </View>
                            <View style={[styles.field, { flex: 1 }]}>
                                <Text style={styles.label}>VALOR R$ *</Text>
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
                            <Text style={styles.label}>NOTAS / OBSERVAÇÃO</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Detalhes..."
                                value={observacao}
                                onChangeText={(t) => up(t, setObservacao)}
                                multiline
                                autoCapitalize="characters"
                            />
                        </View>

                        <View style={styles.row}>
                            {editingUuid && (
                                <TouchableOpacity style={[styles.btn, { backgroundColor: '#EF4444', flex: 1, marginRight: 10 }]} onPress={() => { setEditingUuid(null); setProduto(''); setQuantidade(''); setValor(''); setObservacao(''); }}>
                                    <Text style={styles.btnText}>CANCELAR</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity style={[styles.btn, { flex: 2 }]} onPress={salvar}>
                                <Text style={styles.btnText}>{editingUuid ? 'SALVAR ALTERAÇÕES' : 'CONFIRMAR VENDA'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* HISTÓRICO */}
                <Text style={styles.historyTitle}>ÚLTIMAS VENDAS</Text>
                {history.map(item => (
                    <View key={item.uuid} style={styles.historyItem}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.hProd}>{item.produto}</Text>
                            <Text style={styles.hSub}>{item.cliente} • {new Date(item.data).toLocaleDateString()}</Text>
                            <Text style={styles.hVal}>{item.quantidade} x R$ {item.valor.toFixed(2)}</Text>
                        </View>
                        <View style={styles.actions}>
                            <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionBtn}>
                                <Ionicons name="create-outline" size={20} color="#3B82F6" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionBtn}>
                                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* PRODUCT MODAL */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.overlay}>
                    <View style={styles.modalBg}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>SELECIONAR PRODUTO</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#374151" />
                            </TouchableOpacity>
                        </View>
                        <TextInput style={styles.searchBar} placeholder="Buscar..." value={searchText} onChangeText={t => up(t, setSearchText)} autoCapitalize="characters" />
                        <FlatList
                            data={getFilteredItems()}
                            keyExtractor={i => i.uuid || i.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.itemRow} onPress={() => { setProduto(item.nome); setModalVisible(false); }}>
                                    <Text style={styles.itemText}>{item.nome}</Text>
                                    <Text style={styles.itemSub}>{item.unidade}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>

            {/* CLIENT MODAL */}
            <Modal visible={clientModalVisible} animationType="slide" transparent>
                <View style={styles.overlay}>
                    <View style={styles.modalBg}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>SELECIONAR CLIENTE</Text>
                            <TouchableOpacity onPress={() => setClientModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#374151" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.newClientBtn} onPress={() => setNewClientModal(true)}>
                            <Ionicons name="add-circle" size={24} color="#FFF" />
                            <Text style={styles.newClientText}>CADASTRAR NOVO CLIENTE</Text>
                        </TouchableOpacity>

                        <TextInput style={styles.searchBar} placeholder="Buscar cliente..." value={clientSearchText} onChangeText={t => up(t, setClientSearchText)} autoCapitalize="characters" />

                        <FlatList
                            data={getFilteredClients()}
                            keyExtractor={i => i.uuid || i.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.itemRow} onPress={() => { setCliente(item.nome); setClientModalVisible(false); }}>
                                    <Text style={styles.itemText}>{item.nome}</Text>
                                    <Text style={styles.itemSub}>{item.telefone || 'Sem telefone'}</Text>
                                </TouchableOpacity>
                            )}
                            ListHeaderComponent={
                                <TouchableOpacity style={styles.itemRow} onPress={() => { setCliente('BALCÃO'); setClientModalVisible(false); }}>
                                    <Text style={styles.itemText}>BALCÃO / AVULSO</Text>
                                    <Text style={styles.itemSub}>Venda sem cadastro</Text>
                                </TouchableOpacity>
                            }
                        />
                    </View>
                </View>
            </Modal>

            {/* NEW CLIENT MINI-FORM */}
            <Modal visible={newClientModal} animationType="fade" transparent>
                <View style={styles.overlayCenter}>
                    <View style={styles.miniModal}>
                        <Text style={styles.modalTitle}>Novo Cliente</Text>
                        <TextInput style={[styles.input, { marginTop: 20 }]} placeholder="Nome *" value={newClientName} onChangeText={t => up(t, setNewClientName)} />
                        <TextInput style={[styles.input, { marginTop: 10 }]} placeholder="Telefone" value={newClientPhone} onChangeText={setNewClientPhone} keyboardType="phone-pad" />
                        <View style={styles.row}>
                            <TouchableOpacity style={[styles.btn, { backgroundColor: '#9CA3AF', flex: 1, marginRight: 10 }]} onPress={() => setNewClientModal(false)}>
                                <Text style={styles.btnText}>CANCELAR</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, { flex: 1 }]} onPress={handleSaveClient}>
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
    btn: { backgroundColor: '#3B82F6', paddingVertical: 18, borderRadius: 18, alignItems: 'center', marginTop: 10 },
    btnText: { color: '#FFF', fontSize: 13, fontWeight: '900', letterSpacing: 1 },
    selectBtn: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    selectText: { fontSize: 15, fontWeight: '600', color: '#111827' },
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
    newClientBtn: { flexDirection: 'row', backgroundColor: '#3B82F6', padding: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
    newClientText: { color: '#FFF', fontWeight: 'bold', marginLeft: 10, fontSize: 12 },
    historyTitle: { fontSize: 12, fontWeight: '900', color: '#6B7280', letterSpacing: 1, marginBottom: 15, marginLeft: 10 },
    historyItem: { backgroundColor: '#FFF', padding: 15, borderRadius: 16, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 5, elevation: 2 },
    hProd: { fontSize: 14, fontWeight: 'bold', color: '#1F2937' },
    hSub: { fontSize: 11, color: '#9CA3AF' },
    hVal: { fontSize: 12, fontWeight: '900', color: '#059669', marginTop: 4 },
    actions: { flexDirection: 'row', gap: 10 },
    actionBtn: { padding: 8, backgroundColor: '#F3F4F6', borderRadius: 8 }
});
