import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Modal, Alert, ScrollView } from 'react-native';
import { getEstoque, atualizarEstoque } from '../database/database';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';



const THEME = {
    bg: '#F9FAFB',
    headerBg: ['#FFFFFF', '#FFFFFF'], // Header limpo (Light)
    textMain: '#111827',
    textSub: '#6B7280',
    primary: '#059669',
    border: '#E5E7EB',
    danger: '#DC2626'
};

export default function EstoqueScreen() {
    const [originalItems, setOriginalItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('TODOS');
    const [searchText, setSearchText] = useState('');

    // Modal Ajuste Rápido
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [actionType, setActionType] = useState('ENTRADA');
    const [qty, setQty] = useState('');

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getEstoque();
            const sorted = data.sort((a, b) => {
                // Ordenar alfabeticamente
                if (a.produto < b.produto) return -1;
                if (a.produto > b.produto) return 1;
                return 0;
            });
            setOriginalItems(sorted);
            applyFilter(sorted, filter, searchText);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useFocusEffect(useCallback(() => { loadData(); }, []));
    useEffect(() => { applyFilter(originalItems, filter, searchText); }, [filter, searchText]);

    const applyFilter = (data, mode, text) => {
        let res = data;
        if (mode === 'LOW') res = res.filter(i => i.quantidade > 0 && i.quantidade <= 10);
        if (mode === 'ZERO') res = res.filter(i => i.quantidade <= 0);
        if (text) res = res.filter(i => i.produto.toUpperCase().includes(text.toUpperCase()));
        setFilteredItems(res);
    };

    const getStatusInfo = (qtd) => {
        if (qtd <= 0) return { color: '#DC2626', label: 'Esgotado', bg: '#FEF2F2' };
        if (qtd <= 10) return { color: '#D97706', label: 'Baixo', bg: '#FFFBEB' };
        return { color: '#059669', label: 'Normal', bg: '#ECFDF5' }; // Green
    };

    const openModal = (item, type) => {
        setSelectedItem(item);
        setActionType(type);
        setQty('');
        setModalVisible(true);
    };

    const confirmAction = async () => {
        if (!qty || isNaN(qty) || parseFloat(qty) <= 0) { Alert.alert('Erro', 'Valor inválido.'); return; }
        const delta = actionType === 'ENTRADA' ? parseFloat(qty) : -parseFloat(qty);
        try {
            await atualizarEstoque(selectedItem.produto, delta);
            setModalVisible(false);
            loadData();
        } catch (e) { Alert.alert('Erro', 'Falha ao atualizar.'); }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <Text style={styles.title}>Estoque Geral</Text>

            <View style={styles.searchBar}>
                <Ionicons name="search" size={18} color="#9CA3AF" />
                <TextInput
                    style={styles.inputSearch}
                    placeholder="Buscar produto..."
                    placeholderTextColor="#9CA3AF"
                    value={searchText}
                    onChangeText={setSearchText}
                />
            </View>

            {/* SEGMENTED CONTROL / TABS */}
            <View style={styles.tabsContainer}>
                {['TODOS', 'LOW', 'ZERO'].map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, filter === tab && styles.tabActive]}
                        onPress={() => setFilter(tab)}
                    >
                        <Text style={[styles.tabText, filter === tab && styles.tabTextActive]}>
                            {tab === 'TODOS' ? 'Todos' : tab === 'LOW' ? 'Baixo' : 'Acabou'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderItem = ({ item }) => {
        const st = getStatusInfo(item.quantidade);
        return (
            <View style={styles.row}>
                <View style={styles.cellMain}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.produto}</Text>
                    <Text style={styles.itemCat}>{item.tipo || 'Geral'}</Text>
                </View>

                <View style={styles.cellQty}>
                    <Text style={styles.itemQty}>{item.quantidade}</Text>
                    <Text style={styles.itemUnit}>{item.unidade || 'un'}</Text>
                </View>

                <View style={styles.cellStatus}>
                    <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
                        <View style={[styles.statusDot, { backgroundColor: st.color }]} />
                        <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
                    </View>
                </View>

                <View style={styles.cellActions}>
                    <TouchableOpacity onPress={() => openModal(item, 'ENTRADA')} style={styles.miniBtn}>
                        <Ionicons name="add" size={18} color="#059669" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => openModal(item, 'SAIDA')} style={[styles.miniBtn, { marginLeft: 8 }]}>
                        <Ionicons name="remove" size={18} color="#DC2626" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {renderHeader()}

            <View style={styles.tableHeader}>
                <Text style={[styles.th, { flex: 2 }]}>PRODUTO</Text>
                <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>QTD</Text>
                <Text style={[styles.th, { flex: 1.2, textAlign: 'center' }]}>STATUS</Text>
                <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>AÇÕES</Text>
            </View>

            {loading ? <ActivityIndicator color="#059669" style={{ marginTop: 50 }} /> :
                <FlatList
                    data={filteredItems}
                    keyExtractor={i => i.toString()} // Using index or whatever unique if id missing
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    ListEmptyComponent={<Text style={styles.empty}>Nenhum registro.</Text>}
                />
            }

            {/* MODAL SIMPLIFICADO */}
            <Modal visible={modalVisible} transparent animationType="fade">
                <View style={styles.overlay}>
                    <View style={styles.modalBg}>
                        <Text style={styles.modalTitle}>{actionType === 'ENTRADA' ? 'Adicionar Estoque' : 'Baixar Estoque'}</Text>
                        <Text style={styles.modalSub}>{selectedItem?.produto}</Text>

                        <View style={styles.inputWrap}>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="0.00"
                                keyboardType="numeric"
                                autoFocus
                                value={qty}
                                onChangeText={setQty}
                            />
                            <Text style={styles.modalUnit}>{selectedItem?.unidade}</Text>
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.btnCancel}>
                                <Text style={styles.txtCancel}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={confirmAction} style={[styles.btnConfirm, { backgroundColor: actionType === 'ENTRADA' ? '#059669' : '#DC2626' }]}>
                                <Text style={styles.txtConfirm}>Confirmar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },

    // Header
    header: { backgroundColor: '#FFF', padding: 20, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    title: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 15 },
    searchBar: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 8, paddingHorizontal: 10, alignItems: 'center', height: 40, marginBottom: 15 },
    inputSearch: { flex: 1, marginLeft: 10, fontSize: 14, color: '#374151' },

    // Tabs
    tabsContainer: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 8, padding: 2 },
    tab: { flex: 1, paddingVertical: 6, alignItems: 'center', borderRadius: 6 },
    tabActive: { backgroundColor: '#FFF', elevation: 1 },
    tabText: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
    tabTextActive: { color: '#059669', fontWeight: 'bold' },

    // Table
    tableHeader: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#F9FAFB', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    th: { fontSize: 10, fontWeight: 'bold', color: '#9CA3AF', letterSpacing: 0.5 },

    row: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12, alignItems: 'center', backgroundColor: '#FFF' },
    cellMain: { flex: 2 },
    itemName: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
    itemCat: { fontSize: 10, color: '#9CA3AF', marginTop: 1 },

    cellQty: { flex: 1, alignItems: 'center' },
    itemQty: { fontSize: 14, fontWeight: 'bold', color: '#374151' },
    itemUnit: { fontSize: 9, color: '#9CA3AF' },

    cellStatus: { flex: 1.2, alignItems: 'center' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, gap: 4 },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: 10, fontWeight: 'bold' },

    cellActions: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end' },
    miniBtn: { width: 32, height: 32, borderRadius: 6, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },

    separator: { height: 1, backgroundColor: '#F3F4F6' },
    empty: { textAlign: 'center', marginTop: 50, color: '#9CA3AF' },

    // Modal
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalBg: { backgroundColor: '#FFF', width: '100%', borderRadius: 12, padding: 20, elevation: 5 },
    modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', textAlign: 'center' },
    modalSub: { fontSize: 12, color: '#6B7280', textAlign: 'center', marginBottom: 20 },
    inputWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 25 },
    modalInput: { fontSize: 32, fontWeight: 'bold', color: '#111827', minWidth: 80, textAlign: 'center', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    modalUnit: { fontSize: 14, color: '#9CA3AF', marginLeft: 10, fontWeight: 'bold' },
    modalActions: { flexDirection: 'row', gap: 10 },
    btnCancel: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#F3F4F6', alignItems: 'center' },
    txtCancel: { fontSize: 13, fontWeight: 'bold', color: '#4B5563' },
    btnConfirm: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
    txtConfirm: { fontSize: 13, fontWeight: 'bold', color: '#FFF' }
});
