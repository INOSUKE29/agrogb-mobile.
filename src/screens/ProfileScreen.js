import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { executeQuery } from '../database/database';
import AgroButton from '../components/AgroButton';

export default function ProfileScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState({
        nome: 'Produtor',
        usuario: '',
        telefone: '',
        endereco: 'Não informado',
        nivel: ''
    });

    const loadProfile = async () => {
        setLoading(true);
        try {
            // Obtém o usuário logado do armazenamento local
            const jsonUser = await AsyncStorage.getItem('user_session');
            if (jsonUser) {
                const session = JSON.parse(jsonUser);

                // Recarrega dados frescos do banco
                const res = await executeQuery('SELECT * FROM usuarios WHERE id = ?', [session.id]);
                if (res.rows.length > 0) {
                    const u = res.rows.item(0);
                    setUser({
                        nome: u.nome_completo || u.usuario,
                        usuario: u.usuario,
                        telefone: u.telefone || 'Não informado',
                        endereco: u.endereco || 'Não informado',
                        nivel: u.nivel,
                        provider: u.provider || 'local'
                    });
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(useCallback(() => { loadProfile(); }, []));

    const handleLogout = async () => {
        Alert.alert('Sair', 'Deseja realmente desconectar?', [
            { text: 'Não' },
            {
                text: 'Sim, Sair',
                style: 'destructive',
                onPress: async () => {
                    await AsyncStorage.removeItem('user_session');
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Login' }],
                    });
                }
            }
        ]);
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#10B981', '#059669']} style={styles.header}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>{user.nome?.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={styles.name}>{user.nome}</Text>
                <Text style={styles.role}>{user.nivel === 'ADM' ? 'ADMINISTRADOR' : 'PRODUTOR RURAL'}</Text>
                <View style={[styles.badge, styles.badgePro]}>
                    <Text style={styles.badgeText}>PLANO ULTRAPRO 💎</Text>
                </View>
            </LinearGradient>

            <ScrollView style={styles.body}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>MEUS DADOS</Text>

                    <View style={styles.row}>
                        <View style={styles.iconBox}><Ionicons name="call-outline" size={20} color="#6B7280" /></View>
                        <View>
                            <Text style={styles.label}>TELEFONE</Text>
                            <Text style={styles.value}>{user.telefone}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <View style={styles.iconBox}><Ionicons name="location-outline" size={20} color="#6B7280" /></View>
                        <View>
                            <Text style={styles.label}>LOCALIZAÇÃO</Text>
                            <Text style={styles.value}>{user.endereco}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.row}>
                        <View style={styles.iconBox}><Ionicons name="person-outline" size={20} color="#6B7280" /></View>
                        <View>
                            <Text style={styles.label}>USUÁRIO DE ACESSO</Text>
                            <Text style={styles.value}>{user.usuario}</Text>
                        </View>
                        <View style={styles.divider} />

                        <View style={styles.row}>
                            <View style={styles.iconBox}><Ionicons name="shield-checkmark-outline" size={20} color="#6B7280" /></View>
                            <View>
                                <Text style={styles.label}>TIPO DE CONTA</Text>
                                <Text style={styles.value}>
                                    {user.provider === 'google' ? 'CONTA GOOGLE (VINCULADA)' : 'TITULAR (SENHA LOCAL)'}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={{ marginTop: 30 }}>
                        <AgroButton
                            title="SAIR DO APLICATIVO"
                            onPress={handleLogout}
                            variant="danger"
                        />
                    </View>

                    <Text style={styles.version}>AgroGB Mobile v5.4</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    header: { alignItems: 'center', paddingTop: 60, paddingBottom: 40, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    avatarContainer: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginBottom: 15, elevation: 10, borderWidth: 4, borderColor: 'rgba(255,255,255,0.2)' },
    avatarText: { fontSize: 36, fontWeight: 'bold', color: '#059669' },
    name: { fontSize: 22, fontWeight: 'bold', color: '#FFF' },
    role: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 'bold', letterSpacing: 1, marginTop: 5 },

    badge: { marginTop: 15, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    badgeText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },

    body: { flex: 1, padding: 20, marginTop: -30 },
    section: { backgroundColor: '#FFF', borderRadius: 20, padding: 25, elevation: 3, marginBottom: 20 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    sectionTitle: { fontSize: 12, fontWeight: '900', color: '#9CA3AF', letterSpacing: 1 },

    editBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    editText: { fontSize: 12, fontWeight: 'bold', color: '#059669' },

    fieldGroup: { marginBottom: 20 },
    label: { fontSize: 11, fontWeight: 'bold', color: '#6B7280', marginBottom: 6, textTransform: 'uppercase' },
    value: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
    input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, fontSize: 16, color: '#1F2937' },

    divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 15 },

    saveBtn: { backgroundColor: '#059669', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    saveText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },

    version: { textAlign: 'center', marginTop: 30, color: '#D1D5DB', fontSize: 10, fontWeight: 'bold' }
});

export default function ProfileScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    // User Data State
    const [user, setUser] = useState({
        id: null,
        nome: '',
        usuario: '',
        telefone: '',
        endereco: '',
        nivel: '',
        provider: 'local'
    });

    const loadProfile = async () => {
        setLoading(true);
        try {
            const jsonUser = await AsyncStorage.getItem('user_session');
            if (jsonUser) {
                const session = JSON.parse(jsonUser);
                // Force reload from DB to be sure
                const res = await executeQuery('SELECT * FROM usuarios WHERE id = ?', [session.id]);
                if (res.rows.length > 0) {
                    const u = res.rows.item(0);
                    setUser({
                        id: u.id,
                        nome: u.nome_completo || u.usuario, // Fallback
                        usuario: u.usuario,
                        telefone: u.telefone || '',
                        endereco: u.endereco || '',
                        nivel: u.nivel || 'USUARIO',
                        provider: u.provider || 'local'
                    });
                }
            }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    useFocusEffect(useCallback(() => { loadProfile(); }, []));

    const handleSave = async () => {
        setSaving(true);
        try {
            await executeQuery(
                `UPDATE usuarios SET nome_completo = ?, telefone = ?, endereco = ?, last_updated = ? WHERE id = ?`,
                [user.nome.toUpperCase(), user.telefone, user.endereco.toUpperCase(), new Date().toISOString(), user.id]
            );
            Alert.alert('Sucesso', 'Perfil atualizado!');
            setIsEditing(false);
            // Reload to sync state perfectly
            loadProfile();
        } catch (e) {
            Alert.alert('Erro', 'Falha ao salvar perfil.');
        } finally { setSaving(false); }
    };

    const handleLogout = async () => {
        Alert.alert('Sair', 'Deseja realmente sair?', [
            { text: 'Cancelar' },
            {
                text: 'Sair', style: 'destructive',
                onPress: async () => {
                    await AsyncStorage.removeItem('user_session');
                    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
                }
            }
        ]);
    };

    const canEdit = user.nivel === 'ADM';

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#064E3B', '#059669']} style={styles.header}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>{user.nome?.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={styles.name}>{user.nome}</Text>
                <Text style={styles.role}>{user.nivel === 'ADM' ? 'ADMINISTRADOR' : 'COLABORADOR'}</Text>

                <View style={styles.badge}>
                    <Ionicons name="diamond" size={12} color="#A7F3D0" />
                    <Text style={styles.badgeText}>PLANO ULTRAPRO</Text>
                </View>
            </LinearGradient>

            <ScrollView style={styles.body}>
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>DADOS PESSOAIS</Text>
                        {canEdit && !isEditing && (
                            <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
                                <Ionicons name="pencil" size={14} color="#059669" />
                                <Text style={styles.editText}>EDITAR</Text>
                            </TouchableOpacity>
                        )}
                        {isEditing && (
                            <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(false)}>
                                <Text style={[styles.editText, { color: '#EF4444' }]}>CANCELAR</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* NOME */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>NOME COMPLETO</Text>
                        {isEditing ? (
                            <TextInput
                                style={styles.input}
                                value={user.nome}
                                onChangeText={t => setUser({ ...user, nome: t })}
                            />
                        ) : (
                            <Text style={styles.value}>{user.nome || '-'}</Text>
                        )}
                    </View>

                    {/* TELEFONE */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>TELEFONE / WHATSAPP</Text>
                        {isEditing ? (
                            <TextInput
                                style={styles.input}
                                value={user.telefone}
                                onChangeText={t => setUser({ ...user, telefone: t })}
                                keyboardType="phone-pad"
                            />
                        ) : (
                            <Text style={styles.value}>{user.telefone || '-'}</Text>
                        )}
                    </View>

                    {/* ENDEREÇO */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.label}>LOCALIZAÇÃO / FAZENDA</Text>
                        {isEditing ? (
                            <TextInput
                                style={styles.input}
                                value={user.endereco}
                                onChangeText={t => setUser({ ...user, endereco: t })}
                            />
                        ) : (
                            <Text style={styles.value}>{user.endereco || '-'}</Text>
                        )}
                    </View>

                    <View style={styles.divider} />

                    {/* READ ONLY FIELDS */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View>
                            <Text style={styles.label}>USUÁRIO</Text>
                            <Text style={styles.value}>{user.usuario}</Text>
                        </View>
                        <View>
                            <Text style={[styles.label, { textAlign: 'right' }]}>LOGIN VIA</Text>
                            <Text style={[styles.value, { textAlign: 'right', fontSize: 14 }]}>
                                {user.provider === 'google' ? 'GOOGLE' : 'SENHA LOCAL'}
                            </Text>
                        </View>
                    </View>

                    {/* BOTÃO SALVAR (Só aparece editando) */}
                    {isEditing && (
                        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                            <Text style={styles.saveText}>{saving ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={{ marginTop: 10, paddingBottom: 50 }}>
                    <AgroButton
                        title="SAIR DO APLICATIVO"
                        onPress={handleLogout}
                        variant="danger"
                        style={{ backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' }}
                        textStyle={{ color: '#DC2626' }}
                    />
                    <Text style={styles.version}>AgroGB Mobile v6.0</Text>
                </View>
            </ScrollView>
        </View>
    );
}
