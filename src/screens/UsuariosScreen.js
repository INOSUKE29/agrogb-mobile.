import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, Dimensions, ScrollView } from 'react-native';
import { insertUsuario, getUsuarios, deleteUsuario, updateUsuario } from '../database/database';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function UsuariosScreen() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    // Form States
    const [id, setId] = useState(null);
    const [usuario, setUsuario] = useState('');
    const [senha, setSenha] = useState('');
    const [nivel, setNivel] = useState('USUARIO');

    // New Profile Fields
    const [nomeCompleto, setNomeCompleto] = useState('');
    const [telefone, setTelefone] = useState('');
    const [endereco, setEndereco] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => { loadData(); }, []);

    // Force Uppercase
    const up = (t, setter) => setter(t.toUpperCase());

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getUsuarios();
            setItems(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setId(item.id);
            setUsuario(item.usuario);
            setSenha(item.senha); // Note: Showing password is security risk, but for this simple app context it allows editing
            setNivel(item.nivel);
            setNomeCompleto(item.nome_completo || '');
            setTelefone(item.telefone || '');
            setEndereco(item.endereco || '');
            setEmail(item.email || '');
        } else {
            setId(null);
            setUsuario('');
            setSenha('');
            setNivel('USUARIO');
            setNomeCompleto('');
            setTelefone('');
            setEndereco('');
            setEmail('');
        }
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!usuario.trim() || !senha.trim()) return Alert.alert('Erro', 'Preencha login e senha.');

        const dados = {
            id,
            usuario: usuario.toUpperCase(),
            senha,
            nivel,
            nome_completo: nomeCompleto.toUpperCase(),
            telefone,
            endereco: endereco.toUpperCase(),
            email: email.toLowerCase()
        };

        try {
            if (id) {
                await updateUsuario(dados);
                Alert.alert('Sucesso', 'Perfil atualizado!');
            } else {
                await insertUsuario(dados);
                Alert.alert('Sucesso', 'Usuário criado!');
            }
            setModalVisible(false);
            loadData();
        } catch (error) {
            Alert.alert('Erro', 'Falha ao salvar dados. Tente outro login.');
        }
    };

    const handleDelete = async (item) => {
        if (item.usuario === 'ADMIN') return Alert.alert('Acesso negado', 'O usuário ADMIN mestre não pode ser removido.');
        Alert.alert('Remover Acesso', 'Deseja remover o acesso de ' + item.usuario + '?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Remover', style: 'destructive', onPress: async () => {
                    await deleteUsuario(item.id);
                    loadData();
                }
            }
        ]);
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#F3F4F6', '#E5E7EB']} style={StyleSheet.absoluteFill} />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Gestão de Acessos</Text>
                <Text style={styles.headerSub}>Controle de operadores e perfis</Text>
            </View>

            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color="#059669" /></View>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={item => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.card} onPress={() => handleOpenModal(item)}>
                            <View style={[styles.avatarContainer, { backgroundColor: item.nivel === 'ADM' ? '#FEE2E2' : '#E0E7FF' }]}>
                                <Text style={[styles.avatarText, { color: item.nivel === 'ADM' ? '#DC2626' : '#4F46E5' }]}>
                                    {item.usuario.charAt(0)}
                                </Text>
                            </View>

                            <View style={styles.cardInfo}>
                                <Text style={styles.userName}>{item.nome_completo || item.usuario}</Text>
                                <Text style={styles.userSub}>{item.email || 'Sem email'}</Text>
                                <View style={[styles.badge, { backgroundColor: item.nivel === 'ADM' ? '#FEF2F2' : '#F0F9FF' }]}>
                                    <View style={[styles.dot, { backgroundColor: item.nivel === 'ADM' ? '#EF4444' : '#3B82F6' }]} />
                                    <Text style={[styles.badgeText, { color: item.nivel === 'ADM' ? '#EF4444' : '#3B82F6' }]}>
                                        {item.nivel === 'ADM' ? 'ADMINISTRADOR' : 'OPERADOR'} • {item.usuario}
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
                                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="people-outline" size={64} color="#D1D5DB" />
                            <Text style={styles.emptyText}>Nenhum usuário cadastrado.</Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity style={styles.fab} onPress={() => handleOpenModal(null)} activeOpacity={0.8}>
                <LinearGradient colors={['#10B981', '#059669']} style={styles.fabGradient}>
                    <Ionicons name="add" size={32} color="#FFF" />
                </LinearGradient>
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>{id ? 'Editar Perfil' : 'Novo Usuário'}</Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <Ionicons name="close-circle" size={28} color="#9CA3AF" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>CREDENCIAIS DE ACESSO</Text>
                            </View>

                            <Text style={styles.inputLabel}>LOGIN (USUÁRIO)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="EX: JOAO.SILVA"
                                value={usuario}
                                onChangeText={t => up(t, setUsuario)}
                                autoCapitalize="characters"
                            />

                            <Text style={styles.inputLabel}>SENHA</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="••••••"
                                value={senha}
                                onChangeText={setSenha}
                            // secureTextEntry // Show password for editing convenience in this context
                            />

                            <Text style={styles.inputLabel}>NÍVEL DE PERMISSÃO</Text>
                            <View style={styles.row}>
                                <TouchableOpacity
                                    style={[styles.toggleBtn, nivel === 'USUARIO' && styles.toggleActive]}
                                    onPress={() => setNivel('USUARIO')}
                                >
                                    <Ionicons name="person" size={16} color={nivel === 'USUARIO' ? '#FFF' : '#6B7280'} />
                                    <Text style={[styles.toggleText, nivel === 'USUARIO' && styles.toggleTextActive]}>OPERADOR</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.toggleBtn, nivel === 'ADM' && styles.toggleActive]}
                                    onPress={() => setNivel('ADM')}
                                >
                                    <Ionicons name="shield-checkmark" size={16} color={nivel === 'ADM' ? '#FFF' : '#6B7280'} />
                                    <Text style={[styles.toggleText, nivel === 'ADM' && styles.toggleTextActive]}>ADMIN</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>DADOS PESSOAIS</Text>
                            </View>

                            <Text style={styles.inputLabel}>NOME COMPLETO</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nome Completo"
                                value={nomeCompleto}
                                onChangeText={t => up(t, setNomeCompleto)}
                            />

                            <Text style={styles.inputLabel}>TELEFONE / WHATSAPP</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="(00) 00000-0000"
                                value={telefone}
                                onChangeText={setTelefone}
                                keyboardType="phone-pad"
                            />

                            <Text style={styles.inputLabel}>EMAIL</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="nome@exemplo.com"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />

                            <Text style={styles.inputLabel}>ENDEREÇO</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Endereço completo"
                                value={endereco}
                                onChangeText={t => up(t, setEndereco)}
                            />

                            <TouchableOpacity style={styles.btnSave} onPress={handleSave} activeOpacity={0.8}>
                                <LinearGradient colors={['#10B981', '#059669']} style={styles.btnGradient}>
                                    <Text style={styles.btnText}>SALVAR DADOS</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            <View style={{ height: 50 }} />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { padding: 24, paddingTop: 60, paddingBottom: 20 },
    headerTitle: { fontSize: 28, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
    headerSub: { fontSize: 14, color: '#6B7280', marginTop: 4, fontWeight: '500' },
    list: { paddingHorizontal: 20, paddingBottom: 100 },
    card: {
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 24,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3
    },
    avatarContainer: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    avatarText: { fontSize: 20, fontWeight: '800' },
    cardInfo: { flex: 1 },
    badge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginTop: 4 },
    dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    badgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
    userName: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
    userSub: { fontSize: 11, color: '#9CA3AF', marginBottom: 2 },
    deleteBtn: { padding: 10, backgroundColor: '#FEF2F2', borderRadius: 12 },
    fab: { position: 'absolute', bottom: 30, right: 30, elevation: 8, shadowColor: '#10B981', shadowOpacity: 0.4, shadowRadius: 15 },
    fabGradient: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 30, paddingBottom: 0, height: '85%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
    sectionHeader: { marginTop: 10, marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingBottom: 5 },
    sectionTitle: { fontSize: 12, fontWeight: '900', color: '#4F46E5', letterSpacing: 1 },
    inputLabel: { fontSize: 11, fontWeight: '800', color: '#374151', marginBottom: 8, letterSpacing: 1, marginLeft: 4 },
    input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 18, marginBottom: 20, fontSize: 16, color: '#1F2937', fontWeight: '500' },
    row: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    toggleBtn: { flex: 1, padding: 16, borderRadius: 16, backgroundColor: '#F3F4F6', alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: 'transparent' },
    toggleActive: { backgroundColor: '#111827', borderColor: '#111827' },
    toggleText: { fontSize: 12, fontWeight: '800', color: '#6B7280' },
    toggleTextActive: { color: '#FFF' },
    btnSave: { overflow: 'hidden', borderRadius: 18, marginTop: 10 },
    btnGradient: { padding: 20, alignItems: 'center' },
    btnText: { fontWeight: '900', color: '#FFF', fontSize: 14, letterSpacing: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { alignItems: 'center', marginTop: 60, opacity: 0.5 },
    emptyText: { color: '#6B7280', marginTop: 16, fontWeight: '600' }
});
