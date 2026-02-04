import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, FlatList, ActivityIndicator } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { insertCusto, getCadastro } from '../database/database';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function CustosScreen({ navigation }) {
    const [produto, setProduto] = useState('');
    const [tipo, setTipo] = useState('');
    const [quantidade, setQuantidade] = useState('');
    const [valorTotal, setValorTotal] = useState('');
    const [observacao, setObservacao] = useState('');

    // Selection Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [items, setItems] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);

    React.useEffect(() => { loadItems(); }, []);

    const loadItems = async () => {
        setLoading(true);
        try {
            const all = await getCadastro();
            // Filter services
            const services = all.filter(i => i.tipo === 'SERVICO' || i.tipo === 'OUTRO');
            setItems(services);
        } catch (e) { } finally { setLoading(false); }
    };

    const getFilteredItems = () => {
        if (!searchText) return items;
        return items.filter(i => i.nome.includes(searchText.toUpperCase()));
    };

    const up = (t, setter) => setter(t.toUpperCase());

    const salvar = async () => {
        if (!produto || !quantidade || !valorTotal) {
            Alert.alert('Atenção', 'Preencha os campos obrigatórios (*)');
            return;
        }

        const dados = {
            uuid: uuidv4(),
            produto: produto.toUpperCase(),
            tipo: (tipo || 'GERAL').toUpperCase(),
            quantidade: parseFloat(quantidade) || 0,
            valor_total: parseFloat(valorTotal) || 0,
            observacao: observacao.toUpperCase(),
            data: new Date().toISOString().split('T')[0]
        };

        try {
            await insertCusto(dados);
            Alert.alert('Sucesso', 'Custo operacional registrado!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível registrar o custo.');
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
                <LinearGradient colors={['#DC2626', '#B91C1C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardHeader}>
                    <Text style={styles.headerTitle}>CUSTOS OPERACIONAIS</Text>
                    <Text style={styles.headerSub}>Gestão de Despesas e Manutenções</Text>
                </LinearGradient>

                <View style={styles.form}>
                    <View style={styles.field}>
                        <Text style={styles.label}>IDENTIFICAÇÃO DA DESPESA *</Text>
                        <TouchableOpacity style={styles.selectBtn} onPress={() => setModalVisible(true)}>
                            <Text style={[styles.selectText, !produto && { color: '#9CA3AF' }]}>
                                {produto || "SELECIONAR SERVIÇO/DESPESA..."}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>CATEGORIA / TIPO</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="EX: FIXA / VARIÁVEL / MÃO DE OBRA"
                            value={tipo}
                            onChangeText={(t) => up(t, setTipo)}
                            autoCapitalize="characters"
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.field, { flex: 1, marginRight: 10 }]}>
                            <Text style={styles.label}>QTD FATOR *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="1"
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
                                value={valorTotal}
                                onChangeText={setValorTotal}
                                keyboardType="decimal-pad"
                            />
                        </View>
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>NOTAS ADICIONAIS</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="DETALHES DO CUSTO..."
                            value={observacao}
                            onChangeText={(t) => up(t, setObservacao)}
                            multiline
                            autoCapitalize="characters"
                        />
                    </View>

                    <TouchableOpacity style={styles.btn} onPress={salvar}>
                        <Text style={styles.btnText}>REGISTRAR DESPESA</Text>
                    </TouchableOpacity>
                </View>
            </View>


            {/* SELECTION MODAL */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.overlay}>
                    <View style={styles.modalBg}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>SELECIONAR DESPESA</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#374151" />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={styles.searchBar}
                            placeholder="Buscar item..."
                            value={searchText}
                            onChangeText={t => up(t, setSearchText)}
                            autoCapitalize="characters"
                        />

                        {loading ? <ActivityIndicator color="#DC2626" /> :
                            <FlatList
                                data={getFilteredItems()}
                                keyExtractor={i => i.uuid || i.id.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity style={styles.itemRow} onPress={() => { setProduto(item.nome); setModalVisible(false); }}>
                                        <Text style={styles.itemText}>{item.nome}</Text>
                                        <Text style={styles.itemSub}>{item.tipo}</Text>
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={<Text style={styles.empty}>Nenhum serviço cadastrado.</Text>}
                            />
                        }
                    </View>
                </View>
            </Modal>
        </ScrollView >
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB', padding: 20 },
    card: { backgroundColor: '#FFF', borderRadius: 32, overflow: 'hidden', elevation: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20 },
    cardHeader: { padding: 30 },
    headerTitle: { fontSize: 18, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
    headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 5, fontWeight: 'bold' },
    form: { padding: 25 },
    field: { marginBottom: 20 },
    row: { flexDirection: 'row' },
    label: { fontSize: 9, fontWeight: '900', color: '#9CA3AF', letterSpacing: 1.5, marginBottom: 8 },
    input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 16, fontSize: 15, color: '#111827' },
    textArea: { height: 80, textAlignVertical: 'top' },
    btn: { backgroundColor: '#DC2626', paddingVertical: 20, borderRadius: 18, alignItems: 'center', marginTop: 10 },
    btnText: { color: '#FFF', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
    selectBtn: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    selectText: { fontSize: 15, fontWeight: '600', color: '#111827' },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalBg: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '80%', padding: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 16, fontWeight: '900', color: '#1F2937' },
    searchBar: { backgroundColor: '#F3F4F6', padding: 12, borderRadius: 12, marginBottom: 10, fontSize: 14 },
    itemRow: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    itemText: { fontSize: 14, fontWeight: 'bold', color: '#374151' },
    itemSub: { fontSize: 10, color: '#9CA3AF' },
    empty: { textAlign: 'center', marginTop: 20, color: '#9CA3AF' }
});
