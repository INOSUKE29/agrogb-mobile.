import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { insertCliente, getClientes, deleteCliente } from '../database/database';

export default function ClientesScreen() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [nome, setNome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [endereco, setEndereco] = useState('');
    const [cpf, setCpf] = useState('');

    useEffect(() => { loadData(); }, []);

    const up = (t, setter) => setter(t.toUpperCase());

    const loadData = async () => {
        setLoading(true);
        try { const data = await getClientes(); setItems(data); } catch (e) { } finally { setLoading(false); }
    };

    const handleSave = async () => {
        if (!nome.trim()) return Alert.alert('Erro', 'Nome do cliente é obrigatório.');
        try {
            await insertCliente({ uuid: uuidv4(), nome, telefone, endereco, cpf_cnpj: cpf, observacao: '' });
            setModalVisible(false); setNome(''); setTelefone(''); setEndereco(''); setCpf(''); loadData();
        } catch (e) { Alert.alert('Erro', 'Falha ao salvar cliente.'); }
    };

    const handleDelete = (id) => {
        Alert.alert('Excluir Contato', 'Remover este parceiro da base de dados?', [
            { text: 'Cancelar' }, { text: 'Remover', style: 'destructive', onPress: async () => { await deleteCliente(id); loadData(); } }
        ]);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>CLIENTES E PARCEIROS</Text>
                <Text style={styles.sub}>Gestão de Contatos Comerciais</Text>
            </View>

            {loading ? <ActivityIndicator size="large" color="#EC4899" style={{ marginTop: 50 }} /> :
                <FlatList
                    data={items}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.avatar}><Text style={styles.avatarTxt}>{item.nome.charAt(0)}</Text></View>
                            <View style={styles.cardBody}>
                                <Text style={styles.cardTitle}>{item.nome}</Text>
                                <Text style={styles.cardSub}>{item.telefone || 'SEM TELEFONE'}</Text>
                            </View>
                            <TouchableOpacity onPress={() => handleDelete(item.id)}>
                                <Text style={styles.delIcon}>✕</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    contentContainerStyle={{ padding: 20 }}
                    ListEmptyComponent={<Text style={styles.empty}>Nenhum cliente cadastrado.</Text>}
                />}

            <TouchableOpacity style={[styles.fab, { backgroundColor: '#EC4899' }]} onPress={() => setModalVisible(true)}>
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <Text style={styles.modalTitle}>NOVO PARCEIRO</Text>

                        <Text style={styles.label}>NOME COMPLETO / EMPRESA *</Text>
                        <TextInput style={styles.input} value={nome} onChangeText={t => up(t, setNome)} autoCapitalize="characters" />

                        <Text style={styles.label}>TELEFONE / WHATSAPP</Text>
                        <TextInput style={styles.input} value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />

                        <Text style={styles.label}>ENDEREÇO / LOCALIZAÇÃO</Text>
                        <TextInput style={styles.input} value={endereco} onChangeText={t => up(t, setEndereco)} autoCapitalize="characters" />

                        <Text style={styles.label}>CPF / CNPJ</Text>
                        <TextInput style={styles.input} value={cpf} onChangeText={setCpf} />

                        <View style={styles.modalBtns}>
                            <TouchableOpacity style={[styles.btn, styles.btnBack]} onPress={() => setModalVisible(false)}><Text style={styles.btnText}>VOLTAR</Text></TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, { backgroundColor: '#EC4899' }]} onPress={handleSave}><Text style={[styles.btnText, { color: '#FFF' }]}>SALVAR</Text></TouchableOpacity>
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
    card: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 2 },
    avatar: { width: 45, height: 45, borderRadius: 15, backgroundColor: '#FCE7F3', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    avatarTxt: { fontSize: 18, fontWeight: 'bold', color: '#EC4899' },
    cardBody: { flex: 1 },
    cardTitle: { fontSize: 16, fontWeight: '800', color: '#1F2937' },
    cardSub: { fontSize: 12, color: '#9CA3AF', fontWeight: 'bold', marginTop: 2 },
    delIcon: { color: '#EF4444', fontWeight: 'bold', fontSize: 18, padding: 10 },
    fab: { position: 'absolute', bottom: 30, right: 30, width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', elevation: 10 },
    fabText: { fontSize: 32, color: '#FFF' },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 20 },
    modal: { backgroundColor: '#FFF', borderRadius: 32, padding: 30 },
    modalTitle: { fontSize: 18, fontWeight: '900', marginBottom: 25 },
    label: { fontSize: 9, fontWeight: '900', color: '#9CA3AF', marginBottom: 6, letterSpacing: 1 },
    input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 14, padding: 14, marginBottom: 15, fontSize: 15 },
    modalBtns: { flexDirection: 'row', gap: 10, marginTop: 10 },
    btn: { flex: 1, padding: 18, borderRadius: 16, alignItems: 'center' },
    btnBack: { backgroundColor: '#F3F4F6' },
    btnText: { fontWeight: 'bold', fontSize: 12 },
    empty: { textAlign: 'center', marginTop: 100, color: '#9CA3AF' }
});
