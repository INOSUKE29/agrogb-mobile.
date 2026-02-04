import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Updates from 'expo-updates';
import { getSupabase } from '../services/supabase';
import { insertUsuario } from '../database/database';

const { height } = Dimensions.get('window');

import { executeQuery } from '../database/database';

import Link from '@react-navigation/native'; // Not needed but keeping structure valid
import AgroInput from '../components/AgroInput';
import AgroButton from '../components/AgroButton';

export default function LoginScreen({ navigation }) {
    const [usuario, setUsuario] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = async () => {
        try {
            const supabase = getSupabase();
            // Inicia fluxo OAuth (Vai abrir navegador)
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: 'agrogb://login-callback' // Necessário configurar Scheme no app.json
                }
            });

            // Nota: Em fluxo real, o app ouviria o deep link de retorno.
            // Para este protótipo, alertamos o passo seguinte.
        } catch (e) {
            Alert.alert('Erro Google', 'Configuração de Auth necessária no Painel Supabase.');
        }
    };

    // Verificação Automática de Login
    useEffect(() => {
        const checkSession = async () => {
            const userJson = await AsyncStorage.getItem('user_session');
            if (userJson) {
                // Sessão existe, vai direto (Sessão Infinita Offline)
                navigation.replace('Home');
            }
        };
        checkSession();
    }, []);

    const handleLogin = async () => {
        const userTrim = usuario.trim().toUpperCase();
        const passTrim = senha.trim();

        if (!userTrim || !passTrim) return Alert.alert('Atenção', 'Informe seu telefone/usuário e senha.');

        setLoading(true);
        try {
            // Suporte a Login por Telefone (com ou sem formatação) ou Nome de Usuário antigo
            // Tentamos limpar o telefone para ver se bate com o campo 'usuario' (novo padrão) ou buscamos na col 'telefone'
            const phoneClean = userTrim.replace(/\D/g, '');

            // Query poderosa: Busca por Usuario (Legacy/CleanPhone) OU Telefone (Formatado)
            const sql = `SELECT * FROM usuarios WHERE usuario = ? OR telefone = ? OR usuario = ?`;
            const params = [userTrim, userTrim, phoneClean];

            const res = await executeQuery(sql, params);

            if (res.rows.length > 0) {
                const userRow = res.rows.item(0);
                const hash = userRow.senha;

                // Validação Híbrida (Hash ou Texto Plano)
                let isValid = false;
                if (hash && hash.startsWith('$2')) {
                    const bcrypt = require('react-native-bcrypt');
                    const isaac = require('isaac');
                    bcrypt.setRandomFallback((len) => {
                        const buf = new Uint8Array(len);
                        return buf.map(() => Math.floor(isaac.random() * 256));
                    });
                    isValid = bcrypt.compareSync(passTrim, hash);
                } else {
                    isValid = (hash === passTrim);
                }

                if (isValid) {
                    // ** SUCESSO **
                    // 1. Salvar Sessão Persistente
                    const sessionData = {
                        id: userRow.id,
                        usuario: userRow.usuario,
                        nome: userRow.nome_completo || userRow.usuario,
                        nivel: userRow.nivel,
                        timestamp: new Date().getTime()
                    };
                    await AsyncStorage.setItem('user_session', JSON.stringify(sessionData));

                    // 2. Entrar
                    navigation.replace('Home');
                } else {
                    Alert.alert('Acesso Negado', 'Senha incorreta.');
                }
            } else {
                Alert.alert('Não Encontrado', 'Verifique o telefone ou usuário digitado.');
            }
        } catch (e) {
            console.error(e);
            Alert.alert('Erro', 'Falha ao conectar.');
        } finally {
            setLoading(false);
        }
    };

    const verificarAtualizacao = async () => {
        try {
            const update = await Updates.checkForUpdateAsync();
            if (update.isAvailable) {
                Alert.alert('Atualização', 'Nova versão encontrada! Baixando...', [{ text: 'OK' }]);
                await Updates.fetchUpdateAsync();
                Alert.alert('Sucesso', 'App atualizado! Reiniciando...', [
                    { text: 'Reiniciar Agora', onPress: () => Updates.reloadAsync() }
                ]);
            } else {
                Alert.alert('Atualizado', 'Você já está na última versão.');
            }
        } catch (error) {
            Alert.alert('Info', 'Nenhuma atualização disponível ou erro de conexão.');
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#FF0055', '#FF4D88']} style={styles.bgGradient} />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.inner}
            >
                <View style={styles.header}>
                    <Text style={styles.logoEmoji}>🚜</Text>
                    <Text style={styles.logoText}>AGROGB</Text>
                    <Text style={styles.tagline}>A INTELIGÊNCIA NO CAMPO</Text>
                </View>

                <View style={styles.formCard}>
                    <Text style={styles.welcome}>Acesse sua Conta</Text>

                    <AgroInput
                        label="TELEFONE DE ACESSO"
                        placeholder="(xx) 9xxxx-xxxx"
                        value={usuario}
                        onChangeText={(t) => setUsuario(t.toUpperCase())}
                        autoCapitalize="characters"
                    />

                    <AgroInput
                        label="SENHA"
                        placeholder="••••••••"
                        value={senha}
                        onChangeText={setSenha}
                        secureTextEntry
                    />

                    <AgroButton
                        title="ENTRAR NO SISTEMA"
                        onPress={handleLogin}
                        loading={loading}
                    />

                    <View style={styles.divider}>
                        <View style={styles.line} />
                        <Text style={styles.or}>OU</Text>
                        <View style={styles.line} />
                    </View>

                    {/* GOOGLE LOGIN - Mantendo estilo customizado por enquanto pois tem Icon */}
                    <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleLogin}>
                        <Ionicons name="logo-google" size={20} color="#374151" />
                        <Text style={styles.googleText}>CONTINUAR COM GOOGLE</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.registerLink} onPress={() => navigation.navigate('Register')}>
                        <Text style={styles.registerText}>Novo por aqui? <Text style={styles.bold}>Crie sua conta</Text></Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={{ marginTop: 20, alignSelf: 'center' }} onPress={verificarAtualizacao}>
                        <Text style={{ color: '#6B7280', fontSize: 10, textDecorationLine: 'underline' }}>BUSCAR ATUALIZAÇÕES</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.footer}>AgroGB Mobile v5.3 (Design System)</Text>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    bgGradient: { position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.45 },
    inner: { flex: 1, justifyContent: 'center', padding: 25 },
    header: { alignItems: 'center', marginBottom: 40 },
    logoEmoji: { fontSize: 60, textShadowColor: 'rgba(0,0,0,0.1)', textShadowRadius: 10 },
    logoText: { fontSize: 32, fontWeight: '900', color: '#FFF', letterSpacing: 2 },
    tagline: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: 'bold', letterSpacing: 3, marginTop: 5 },
    formCard: { backgroundColor: '#FFF', borderRadius: 32, padding: 30, elevation: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20 },
    welcome: { fontSize: 22, fontWeight: '900', color: '#1F2937', marginBottom: 25, textAlign: 'center' },
    registerLink: { marginTop: 25, alignItems: 'center' },
    registerText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
    bold: { fontWeight: '900', color: '#059669' },
    divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
    line: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
    or: { marginHorizontal: 15, fontSize: 10, fontWeight: '800', color: '#9CA3AF' },
    googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6', padding: 16, borderRadius: 16, gap: 10 },
    googleText: { fontSize: 12, fontWeight: '900', color: '#374151', letterSpacing: 0.5 },
    footer: { marginTop: 40, textAlign: 'center', fontSize: 10, color: '#9CA3AF', fontWeight: 'bold', letterSpacing: 2 }
});
