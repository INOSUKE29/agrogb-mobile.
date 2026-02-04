import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SectionList, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { insertCadastro, getCadastro, deleteCadastro, updateCadastro, insertReceita, getReceita, deleteItemReceita } from '../database/database';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// --- CONFIGURAÇÃO DE CATEGORIAS (UX) ---
const CATEGORIES = {
    DEFENSIVO: { label: 'Defensivo Agrícola', icon: 'flask-outline', color: '#DC2626', bg: '#FEE2E2', fields: ['principio', 'classe'] },
    FERTILIZANTE: { label: 'Fertilizante / Adubo', icon: 'leaf-outline', color: '#16A34A', bg: '#DCFCE7', fields: ['composicao'] },
    NUTRIENTE: { label: 'Nutriente / Corretivo', icon: 'water-outline', color: '#CA8A04', bg: '#FEF9C3', fields: ['composicao'] },
    EMBALAGEM: { label: 'Embalagem / Caixa', icon: 'cube-outline', color: '#4B5563', bg: '#F3F4F6' },
    INSUMO: { label: 'Insumo Geral', icon: 'construct-outline', color: '#6366F1', bg: '#E0E7FF' },
    CULTURA: { label: 'Cultura (Plantio)', icon: 'nutrition-outline', color: '#15803D', bg: '#DCFCE7' },
    PRODUTO: { label: 'Produto (Venda)', icon: 'cart-outline', color: '#2563EB', bg: '#DBEAFE', preCheck: ['vendavel'] },
    AREA: { label: 'Área / Talhão', icon: 'map-outline', color: '#059669', bg: '#D1FAE5' }
};

// Padrões de Mercado 
const MARKET_STANDARDS = [
    { label: '🏞️ Área / Talhão', unit: 'HA', weight: '1' },
    { label: '🍓 Cx Morango Padrão', unit: 'CX', weight: '1.2' },
    { label: '🍅 Cx Tomate (K)', unit: 'CX', weight: '20' },
    { label: '🥦 Cx Legumes (Madeira)', unit: 'CX', weight: '12' },
    { label: '📦 Cx Papelão G', unit: 'CX', weight: '5' },
    { label: '🧪 Saco Adubo', unit: 'SC', weight: '50' },
    { label: '🌽 Saco Grãos/Milho', unit: 'SC', weight: '60' },
    { label: '🛢️ Galão Pequeno', unit: 'LT', weight: '5' },
    { label: '🛢️ Galão Grande', unit: 'LT', weight: '20' },
    { label: '🧱 Milheiro', unit: 'MIL', weight: '1000' },
    { label: '❓ Unitário', unit: 'UNI', weight: '1' }
];

export default function CadastroScreen() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modais
    const [modalVisible, setModalVisible] = useState(false);
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [obsModalVisible, setObsModalVisible] = useState(false);
    const [assistantVisible, setAssistantVisible] = useState(false);

    // Form Item
    const [editingItem, setEditingItem] = useState(null);
    const [nome, setNome] = useState('');
    const [unidade, setUnidade] = useState('KG');
    const [tipo, setTipo] = useState('INSUMO'); // Default safe
    const [observacao, setObservacao] = useState('');
    const [fator, setFator] = useState('1');
    const [estocavel, setEstocavel] = useState(true);
    const [vendavel, setVendavel] = useState(true);

    // Form Extended (Novos Campos)
    const [principioAtivo, setPrincipioAtivo] = useState('');
    const [classeToxicologica, setClasseToxicologica] = useState('');
    const [composicao, setComposicao] = useState('');
    const [precoVenda, setPrecoVenda] = useState('');

    // Form Receita
    const [recipeModalVisible, setRecipeModalVisible] = useState(false);
    const [currentRecipe, setCurrentRecipe] = useState([]);
    const [addIngModal, setAddIngModal] = useState(false);
    const [selectedIng, setSelectedIng] = useState(null);
    const [qtdIng, setQtdIng] = useState('');

    useEffect(() => { loadData(); }, []);

    const up = (t, setter) => setter(t ? t.toUpperCase() : '');

    const loadData = async () => {
        setLoading(true);
        try { const data = await getCadastro(); setItems(data); } catch (e) { } finally { setLoading(false); }
    };

    const handleSave = async () => {
        if (!nome.trim()) return Alert.alert('Ops!', 'Dê um nome ao item.');
        try {
            const data = {
                uuid: editingItem ? editingItem.uuid : uuidv4(),
                nome, unidade, tipo, observacao,
                fator_conversao: parseFloat(fator) || 1,
                estocavel: estocavel ? 1 : 0,
                vendavel: vendavel ? 1 : 0,
                principio_ativo: principioAtivo,
                classe_toxicologica: classeToxicologica,
                composicao: composicao,
                preco_venda: parseFloat(precoVenda) || 0
            };

            if (editingItem) {
                await updateCadastro(data);
                Alert.alert('Sucesso', 'Item atualizado!');
            } else {
                await insertCadastro(data);
            }

            setModalVisible(false);
            resetForm();
            loadData();
        } catch (e) { Alert.alert('Erro', 'Falha ao salvar.'); }
    };

    const resetForm = () => {
        setEditingItem(null);
        setNome(''); setObservacao(''); setFator('1');
        setEstocavel(true); setVendavel(false);
        setUnidade('KG'); setTipo('INSUMO');
        setPrincipioAtivo(''); setClasseToxicologica('');
        setComposicao(''); setPrecoVenda('');
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setNome(item.nome);
        setUnidade(item.unidade);
        setTipo(item.tipo);
        setObservacao(item.observacao || '');
        setFator((item.fator_conversao || 1).toString());
        setEstocavel(item.estocavel === 1);
        setVendavel(item.vendavel === 1);

        // Extended
        setPrincipioAtivo(item.principio_ativo || '');
        setClasseToxicologica(item.classe_toxicologica || '');
        setComposicao(item.composicao || '');
        setPrecoVenda(item.preco_venda ? item.preco_venda.toString() : '');

        setModalVisible(true);
    };

    const handleDelete = (id) => {
        Alert.alert('Excluir', 'Remover item permanentemente?', [
            { text: 'Não' }, { text: 'Sim', onPress: async () => { await deleteCadastro(id); loadData(); } }
        ]);
    };

    // UX Helpers
    const getCategoryConfig = (t) => CATEGORIES[t] || CATEGORIES['INSUMO'];

    const selectCategory = (key) => {
        setTipo(key);
        setCategoryModalVisible(false);
        // Auto-sets based on category
        const cfg = CATEGORIES[key];
        if (cfg.preCheck?.includes('vendavel')) setVendavel(true);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>CATÁLOGO GERAL</Text>
                    <Text style={styles.sub}>Insumos, Produtos e Embalagens</Text>
                </View>
                <TouchableOpacity
                    style={{ backgroundColor: '#10B981', padding: 8, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}
                    onPress={() => navigation.navigate('Scanner', {
                        onScanComplete: (data) => {
                            // Preencher formulário com dados da IA
                            setNome(data.nome);
                            setTipo(data.tipo);
                            setObservacao(data.observacao);
                            setModalVisible(true); // Abre o modal de edição já preenchido
                        }
                    })}
                >
                    <Ionicons name="scan-outline" size={24} color="#FFF" />
                </TouchableOpacity>
            </View>

            {loading ? <ActivityIndicator size="large" color="#15803D" style={{ marginTop: 50 }} /> :
                <SectionList
                    sections={Object.values(items.reduce((acc, item) => {
                        if (!acc[item.tipo]) acc[item.tipo] = { title: item.tipo, data: [] };
                        acc[item.tipo].data.push(item);
                        return acc;
                    }, {})).sort((a, b) => a.title.localeCompare(b.title))}
                    keyExtractor={item => item.id.toString()}
                    renderSectionHeader={({ section: { title } }) => {
                        const cfg = getCategoryConfig(title);
                        return (
                            <View style={[styles.sectionHeader, { backgroundColor: cfg.bg }]}>
                                <Ionicons name={cfg.icon} size={16} color={cfg.color} style={{ marginRight: 5 }} />
                                <Text style={[styles.sectionTitle, { color: cfg.color }]}>{cfg.label}</Text>
                            </View>
                        );
                    }}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <TouchableOpacity style={styles.cardBody} onPress={() => handleEdit(item)}>
                                <Text style={styles.cardTitle}>{item.nome}</Text>
                                <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                                    <View style={styles.miniTag}><Text style={styles.miniTagText}>{item.unidade}</Text></View>
                                    {item.estocavel === 1 && <View style={[styles.miniTag, { backgroundColor: '#DCFCE7' }]}><Text style={[styles.miniTagText, { color: '#166534' }]}>Estoque</Text></View>}
                                    {item.vendavel === 1 && <View style={[styles.miniTag, { backgroundColor: '#DBEAFE' }]}><Text style={[styles.miniTagText, { color: '#1E40AF' }]}>$ Venda</Text></View>}
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDelete(item.id)} style={{ padding: 10 }}>
                                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                            </TouchableOpacity>
                        </View>
                    )}
                    contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                    ListEmptyComponent={<Text style={styles.empty}>Nenhum item cadastrado.</Text>}
                />}

            <TouchableOpacity style={styles.fab} onPress={() => { resetForm(); setModalVisible(true); }}>
                <Ionicons name="add" size={32} color="#FFF" />
            </TouchableOpacity>

            {/* MODAL EDITOR PRINCIPAL */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.modalTitle}>{editingItem ? 'EDITAR ITEM' : 'NOVO ITEM'}</Text>

                            {/* 1. SELEÇÃO DE CATEGORIA (UX MELHORADA) */}
                            <Text style={styles.label}>CATEGORIA / TIPO</Text>
                            <TouchableOpacity style={[styles.selectorBtn, { borderColor: getCategoryConfig(tipo).color }]} onPress={() => setCategoryModalVisible(true)}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <View style={[styles.iconBox, { backgroundColor: getCategoryConfig(tipo).bg }]}>
                                        <Ionicons name={getCategoryConfig(tipo).icon} size={20} color={getCategoryConfig(tipo).color} />
                                    </View>
                                    <View style={{ marginLeft: 10 }}>
                                        <Text style={[styles.selectorLabel, { color: getCategoryConfig(tipo).color }]}>{getCategoryConfig(tipo).label}</Text>
                                        <Text style={{ fontSize: 10, color: '#9CA3AF' }}>Toque para alterar</Text>
                                    </View>
                                </View>
                                <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
                            </TouchableOpacity>

                            {/* 2. DADOS BÁSICOS */}
                            <Text style={styles.label}>IDENTIFICAÇÃO</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nome do Item (Ex: Adubo 20-00-20)"
                                value={nome}
                                onChangeText={t => up(t, setNome)}
                            />

                            <View style={styles.row}>
                                <View style={{ flex: 1, marginRight: 10 }}>
                                    <Text style={styles.label}>UNIDADE</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                                        {['KG', 'LT', 'CX', 'SC', 'UNI'].map(u => (
                                            <TouchableOpacity key={u} onPress={() => setUnidade(u)} style={[styles.unitChip, unidade === u && styles.unitChipActive]}>
                                                <Text style={[styles.unitText, unidade === u && { color: '#FFF' }]}>{u}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            </View>

                            {/* 3. CAMPOS ESPECÍFICOS (LÓGICA CONDICIONAL) */}

                            {/* Defensivos */}
                            {getCategoryConfig(tipo).fields?.includes('principio') && (
                                <View style={styles.extraSection}>
                                    <Text style={styles.sectionHeader}>DADOS DO DEFENSIVO</Text>
                                    <Text style={styles.label}>PRINCÍPIO ATIVO</Text>
                                    <TextInput style={styles.input} placeholder="Ex: Glifosato" value={principioAtivo} onChangeText={t => up(t, setPrincipioAtivo)} />
                                    <Text style={styles.label}>CLASSE TOXICOLÓGICA</Text>
                                    <TextInput style={styles.input} placeholder="Ex: Classe I, II..." value={classeToxicologica} onChangeText={t => up(t, setClasseToxicologica)} />
                                </View>
                            )}

                            {/* Fertilizantes / Nutrientes */}
                            {getCategoryConfig(tipo).fields?.includes('composicao') && (
                                <View style={styles.extraSection}>
                                    <Text style={styles.sectionHeader}>COMPOSIÇÃO QUÍMICA</Text>
                                    <TextInput style={styles.input} placeholder="Ex: NPK 04-14-08 + Micronutrientes" value={composicao} onChangeText={t => up(t, setComposicao)} />
                                </View>
                            )}

                            {/* Produtos Vendáveis */}
                            {(tipo === 'PRODUTO' || vendavel) && (
                                <View style={styles.extraSection}>
                                    <Text style={styles.sectionHeader}>VENDAS</Text>
                                    <Text style={styles.label}>PREÇO DE VENDA SUGERIDO (R$)</Text>
                                    <TextInput style={styles.input} placeholder="0.00" keyboardType="numeric" value={precoVenda} onChangeText={setPrecoVenda} />
                                </View>
                            )}

                            {/* 4. CONVERSÃO E SWITCHES */}
                            <Text style={styles.label}>CONTEÚDO DA EMBALAGEM</Text>
                            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
                                <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} value={fator} onChangeText={setFator} keyboardType="numeric" />
                                <TouchableOpacity style={styles.assistantBtn} onPress={() => setAssistantVisible(true)}>
                                    <Ionicons name="bulb-outline" size={18} color="#FFF" />
                                    <Text style={styles.assistantText}>Padrões</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={[styles.row, { marginBottom: 15, justifyContent: 'space-between' }]}>
                                <TouchableOpacity style={[styles.toggleBtn, estocavel && styles.toggleActive]} onPress={() => setEstocavel(!estocavel)}>
                                    <Text style={[styles.toggleLabel, estocavel && { color: '#FFF' }]}>📦 ESTOCÁVEL</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.toggleBtn, vendavel && styles.toggleActive]} onPress={() => setVendavel(!vendavel)}>
                                    <Text style={[styles.toggleLabel, vendavel && { color: '#FFF' }]}>💲 VENDÁVEL</Text>
                                </TouchableOpacity>
                            </View>

                            {/* 5. RECEITA (Só Produto) */}
                            {editingItem && tipo === 'PRODUTO' && (
                                <TouchableOpacity style={styles.recipeBtn} onPress={() => openRecipeModal(editingItem)}>
                                    <Ionicons name="construct-outline" size={20} color="#FFF" />
                                    <Text style={styles.recipeBtnText}>ENGENHARIA / RECEITA</Text>
                                </TouchableOpacity>
                            )}

                            {/* 6. OBSERVAÇÃO (UX LEITURA) */}
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={styles.label}>OBSERVAÇÕES (Toque para ler)</Text>
                                <TouchableOpacity onPress={() => setObsModalVisible(true)}>
                                    <Ionicons name="expand" size={18} color="#4B5563" />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity activeOpacity={0.8} onLongPress={() => setObsModalVisible(true)} onPress={() => { }}>
                                <TextInput
                                    style={[styles.input, { height: 80 }]}
                                    value={observacao}
                                    onChangeText={t => up(t, setObservacao)}
                                    multiline
                                    placeholder="Detalhes adicionais..."
                                />
                            </TouchableOpacity>

                            <View style={styles.modalBtns}>
                                <TouchableOpacity style={[styles.btn, styles.btnBack]} onPress={() => setModalVisible(false)}><Text style={styles.btnText}>CANCELAR</Text></TouchableOpacity>
                                <TouchableOpacity style={[styles.btn, styles.btnSave]} onPress={handleSave}><Text style={[styles.btnText, { color: '#FFF' }]}>SALVAR</Text></TouchableOpacity>
                            </View>
                            <View style={{ height: 50 }} />
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* MODAL CATEGORIAS (UX SELEÇÃO) */}
            <Modal visible={categoryModalVisible} transparent animationType="fade">
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <Text style={styles.modalTitle}>SELECIONE A CATEGORIA</Text>
                            <TouchableOpacity onPress={() => setCategoryModalVisible(false)}><Ionicons name="close" size={24} /></TouchableOpacity>
                        </View>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
                            {Object.keys(CATEGORIES).map(key => {
                                const cat = CATEGORIES[key];
                                return (
                                    <TouchableOpacity key={key} style={styles.catGridItem} onPress={() => selectCategory(key)}>
                                        <View style={[styles.catIconBig, { backgroundColor: cat.bg }]}>
                                            <Ionicons name={cat.icon} size={28} color={cat.color} />
                                        </View>
                                        <Text style={styles.catLabelSmall}>{cat.label}</Text>
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    </View>
                </View>
            </Modal>

            {/* MODAL LEITURA OBSERVAÇÃO */}
            <Modal visible={obsModalVisible} transparent animationType="fade">
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
                            <Text style={styles.modalTitle}>OBSERVAÇÃO COMPLETA</Text>
                            <TouchableOpacity onPress={() => setObsModalVisible(false)}><Ionicons name="close" size={24} /></TouchableOpacity>
                        </View>
                        <ScrollView style={{ maxHeight: 300, backgroundColor: '#F9FAFB', padding: 15, borderRadius: 10 }}>
                            <Text style={{ fontSize: 16, lineHeight: 24, color: '#374151' }}>{observacao || 'Nenhuma observação registrada.'}</Text>
                        </ScrollView>
                        <TouchableOpacity style={[styles.btn, styles.btnBack, { marginTop: 20 }]} onPress={() => setObsModalVisible(false)}>
                            <Text style={styles.btnText}>FECHAR</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* MODAIS AUXILIARES (Padrões e Receita - Mantidos Similares) */}
            <Modal visible={assistantVisible} transparent animationType="fade">
                <View style={[styles.overlay]}>
                    <View style={styles.modal}>
                        <Text style={styles.modalTitle}>PADRÕES IDEAIS</Text>
                        <FlatList data={MARKET_STANDARDS} keyExtractor={i => i.label} renderItem={({ item }) => (
                            <TouchableOpacity style={styles.stdItem} onPress={() => { setUnidade(item.unit); setFator(item.weight); setAssistantVisible(false); }}>
                                <Text>{item.label}</Text>
                                <Text style={{ fontWeight: 'bold' }}>{item.weight} {item.unit}</Text>
                            </TouchableOpacity>
                        )} />
                        <TouchableOpacity onPress={() => setAssistantVisible(false)} style={{ alignSelf: 'center', padding: 10 }}><Text>Cancelar</Text></TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* --- RECEITA MANAGER (Simplified for brevity, same logic typically) --- */}
            <Modal visible={recipeModalVisible} transparent animationType="slide">
                <View style={styles.overlay}>
                    <View style={[styles.modal, { height: '85%' }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={styles.modalTitle}>FICHA TÉCNICA 🏗️</Text>
                            <TouchableOpacity onPress={() => setRecipeModalVisible(false)}><Ionicons name="close" size={28} /></TouchableOpacity>
                        </View>
                        <FlatList
                            data={currentRecipe}
                            keyExtractor={i => i.id.toString()}
                            ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 50, color: '#9CA3AF' }}>Sem ingredientes.</Text>}
                            renderItem={({ item }) => (
                                <View style={styles.stdItem}>
                                    <Text>{item.nome_filho} ({item.quantidade} {item.unidade_filho})</Text>
                                    <TouchableOpacity onPress={() => removeIngredient(item.id)}><Ionicons name="trash" size={18} color="red" /></TouchableOpacity>
                                </View>
                            )}
                        />
                        <TouchableOpacity style={styles.addIngBtn} onPress={() => setAddIngModal(true)}><Text style={styles.addIngText}>+ INGREDIENTE</Text></TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal visible={addIngModal} transparent animationType="fade">
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <Text style={styles.modalTitle}>ADICIONAR</Text>
                        {!selectedIng ? (
                            <FlatList data={items.filter(i => i.uuid !== editingItem?.uuid)} keyExtractor={i => i.uuid} renderItem={({ item }) => (
                                <TouchableOpacity style={styles.stdItem} onPress={() => setSelectedIng(item)}><Text>{item.nome}</Text></TouchableOpacity>
                            )} style={{ height: 200 }} />
                        ) : (
                            <View>
                                <Text>Qtd de {selectedIng.nome}?</Text>
                                <TextInput style={styles.input} value={qtdIng} onChangeText={setQtdIng} keyboardType="numeric" autoFocus />
                                <TouchableOpacity style={styles.btnSave} onPress={confirmAddIngredient}><Text style={{ color: '#FFF' }}>CONFIRMAR</Text></TouchableOpacity>
                            </View>
                        )}
                        <TouchableOpacity onPress={() => { setAddIngModal(false); setSelectedIng(null) }} style={{ padding: 10, alignSelf: 'center' }}><Text>Cancelar</Text></TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );

    async function openRecipeModal(item) { setRecipeModalVisible(true); loadRecipeData(item.uuid); }
    async function loadRecipeData(paiUuid) {
        try { const data = await getReceita(paiUuid); setCurrentRecipe(data); } catch (e) { }
    }
    async function confirmAddIngredient() {
        if (!qtdIng) return;
        await insertReceita(editingItem.uuid, selectedIng.uuid, parseFloat(qtdIng));
        setAddIngModal(false); setSelectedIng(null); setQtdIng(''); loadRecipeData(editingItem.uuid);
    }
    async function removeIngredient(id) { await deleteItemReceita(id); loadRecipeData(editingItem.uuid); }
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: { padding: 25, paddingTop: 50 },
    title: { fontSize: 22, fontWeight: '900', color: '#1F2937' },
    sub: { fontSize: 11, color: '#9CA3AF', letterSpacing: 1, marginTop: 5 },

    // Lista
    sectionHeader: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 8, marginTop: 15, marginBottom: 5 },
    sectionTitle: { fontWeight: 'bold', fontSize: 12, letterSpacing: 1 },
    card: { backgroundColor: '#FFF', borderRadius: 16, padding: 15, marginBottom: 8, flexDirection: 'row', alignItems: 'center', elevation: 1 },
    cardBody: { flex: 1 },
    cardTitle: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
    miniTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, backgroundColor: '#F3F4F6' },
    miniTagText: { fontSize: 10, fontWeight: 'bold', color: '#6B7280' },
    empty: { textAlign: 'center', marginTop: 50, color: '#9CA3AF' },
    fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#15803D', justifyContent: 'center', alignItems: 'center', elevation: 5 },

    // Modal
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modal: { backgroundColor: '#FFF', borderRadius: 24, padding: 25, maxHeight: '90%' },
    modalTitle: { fontSize: 18, fontWeight: '900', marginBottom: 20, color: '#111827' },
    label: { fontSize: 10, fontWeight: '800', color: '#9CA3AF', marginBottom: 8, marginTop: 15, letterSpacing: 0.5 },
    input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, fontSize: 15, color: '#1F2937', marginBottom: 5 },

    // Selector
    selectorBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderWidth: 1, borderRadius: 16, backgroundColor: '#FFF' },
    iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    selectorLabel: { fontWeight: 'bold', fontSize: 14 },

    // Category Modal Grid
    catGridItem: { width: '45%', backgroundColor: '#F9FAFB', padding: 15, borderRadius: 16, alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: '#F3F4F6' },
    catIconBig: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    catLabelSmall: { fontSize: 12, fontWeight: 'bold', color: '#374151', textAlign: 'center' },

    // Extra Fields
    extraSection: { backgroundColor: '#F0FDF4', padding: 15, borderRadius: 12, marginTop: 10, borderWidth: 1, borderColor: '#DCFCE7' },

    row: { flexDirection: 'row' },
    unitChip: { padding: 10, borderRadius: 10, backgroundColor: '#F3F4F6', marginRight: 8, minWidth: 40, alignItems: 'center' },
    unitChipActive: { backgroundColor: '#4B5563' },
    unitText: { fontSize: 12, fontWeight: 'bold', color: '#6B7280' },

    assistantBtn: { backgroundColor: '#F59E0B', paddingHorizontal: 15, borderRadius: 12, justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 5 },
    assistantText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },

    toggleBtn: { flex: 0.48, padding: 15, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
    toggleActive: { backgroundColor: '#10B981', borderColor: '#059669' },
    toggleLabel: { fontSize: 11, fontWeight: '900', color: '#6B7280' },

    modalBtns: { flexDirection: 'row', gap: 10, marginTop: 25 },
    btn: { flex: 1, padding: 16, borderRadius: 14, alignItems: 'center' },
    btnBack: { backgroundColor: '#E5E7EB' },
    btnSave: { backgroundColor: '#1F2937' },
    btnText: { fontWeight: '900', fontSize: 12 },

    stdItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', flexDirection: 'row', justifyContent: 'space-between' },

    recipeBtn: { backgroundColor: '#4F46E5', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderRadius: 14, marginTop: 15, gap: 10 },
    recipeBtnText: { color: '#FFF', fontWeight: 'bold' },
    addIngBtn: { backgroundColor: '#10B981', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 15 },
    addIngText: { color: '#FFF', fontWeight: 'bold' }
});
