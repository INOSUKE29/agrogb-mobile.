import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, Dimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { insertUsuario } from '../database/database';
import { Link } from '@react-navigation/native';
import AgroInput from '../components/AgroInput';
import AgroButton from '../components/AgroButton';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen({ navigation }) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!name || !phone || !password || !confirmPassword) {
            return Alert.alert('Campos Obrigatórios', 'Informe Nome, Telefone e Senha.');
        }

        if (password !== confirmPassword) {
            return Alert.alert('Erro', 'As senhas não conferem.');
        }

        setLoading(true);
        try {
            // Usa o TELEFONE como identificador único (usuario) para o login
            const phoneClean = phone.replace(/\D/g, ''); // Remove formatação se houver

            await insertUsuario({
                usuario: phoneClean, // Login é o telefone limpo
                senha: password,
                nivel: 'USUARIO',
                nome_completo: name.toUpperCase(),
                telefone: phone,
                endereco: city ? city.toUpperCase() : ''
            });

            Alert.alert('Sucesso!', 'Conta criada. Use seu TELEFONE para entrar.', [
                { text: 'FAZER LOGIN', onPress: () => navigation.navigate('Login') }
            ]);
        } catch (error) {
            console.error('Erro no cadastro:', error);
            Alert.alert('Atenção', 'Este telefone já possui um cadastro.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#10B981', '#059669']} style={styles.headerBg}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={28} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Nova Conta</Text>
                <Text style={styles.headerSub}>Crie seu acesso ao AgroGB Pro</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <View style={styles.form}>
                    <AgroInput
                        label="NOME (OU NOME DA PROPRIEDADE)"
                        placeholder="Ex: Fazenda Santa Maria"
                        value={name}
                        onChangeText={(t) => setName(t.toUpperCase())}
                        autoCapitalize="words"
                    />

                    <AgroInput
                        label="TELEFONE (SEU LOGIN)"
                        placeholder="(xx) 9xxxx-xxxx"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                    />

                    <AgroInput
                        label="CIDADE / ESTADO (OPCIONAL)"
                        placeholder="Ex: Goiânia - GO"
                        value={city}
                        onChangeText={(t) => setCity(t.toUpperCase())}
                        autoCapitalize="words"
                    />

                    <AgroInput
                        label="SENHA"
                        placeholder="••••••••"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <AgroInput
                        label="CONFIRMAR SENHA"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                    />

                    <AgroButton
                        title="CRIAR MINHA CONTA"
                        onPress={handleRegister}
                        loading={loading}
                    />

                    <View style={styles.footerLink}>
                        <Text style={styles.secondaryText}>Já tem conta? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.linkText}>Entrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    headerBg: { height: height * 0.25, justifyContent: 'center', paddingHorizontal: 30, paddingTop: 40 },
    backBtn: { position: 'absolute', top: 50, left: 20 },
    headerTitle: { fontSize: 24, fontWeight: '900', color: '#FFF' },
    headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 5, fontWeight: 'bold' },
    scroll: { flexGrow: 1, paddingBottom: 50 },
    form: { marginTop: -30, backgroundColor: '#FFF', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 30, elevation: 10 },
    footerLink: { flexDirection: 'row', justifyContent: 'center', marginTop: 25 },
    secondaryText: { fontSize: 14, color: '#6B7280' },
    linkText: { fontSize: 14, color: '#10B981', fontWeight: 'bold' }
});
