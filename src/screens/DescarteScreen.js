import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { insertDescarte } from '../database/database';
import { LinearGradient } from 'expo-linear-gradient';

export default function DescarteScreen({ navigation }) {
    const [produto, setProduto] = useState('');
    const [quantidade, setQuantidade] = useState('');
    const [motivo, setMotivo] = useState('');

    const up = (t, setter) => setter(t.toUpperCase());

    const salvar = async () => {
        if (!produto || !quantidade) {
            Alert.alert('Atenção', 'Produto e Quantidade são obrigatórios.');
            return;
        }

        const dados = {
            uuid: uuidv4(),
            produto: produto.toUpperCase(),
            quantidade_kg: parseFloat(quantidade) || 0,
            motivo: (motivo || 'NÃO INFORMADO').toUpperCase(),
            data: new Date().toISOString().split('T')[0]
        };

        try {
            await insertDescarte(dados);
            Alert.alert('Sucesso', 'Perda registrada com sucesso!', [{ text: 'OK', onPress: () => navigation.goBack() }]);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível registrar o descarte.');
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
                <LinearGradient colors={['#7F1D1D', '#991B1B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.cardHeader}>
                    <Text style={styles.headerTitle}>REGISTRO DE PERDAS</Text>
                    <Text style={styles.headerSub}>Controle de Avarias e Descarte de Produtos</Text>
                </LinearGradient>

                <View style={styles.form}>
                    <View style={styles.field}>
                        <Text style={styles.label}>PRODUTO DESCARTADO *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="EX: MORANGO ESPECIAL - QUEBRA"
                            value={produto}
                            onChangeText={(t) => up(t, setProduto)}
                            autoCapitalize="characters"
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>QUANTIDADE (KG) *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0.00"
                            value={quantidade}
                            onChangeText={setQuantidade}
                            keyboardType="decimal-pad"
                        />
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>MOTIVO DO DESCARTE</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="EX: TRANSPORTE / MATURAÇÃO EXCESSIVA"
                            value={motivo}
                            onChangeText={(t) => up(t, setMotivo)}
                            multiline
                            autoCapitalize="characters"
                        />
                    </View>

                    <TouchableOpacity style={styles.btn} onPress={salvar}>
                        <Text style={styles.btnText}>CONFIRMAR PERDA</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
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
    label: { fontSize: 9, fontWeight: '900', color: '#9CA3AF', letterSpacing: 1.5, marginBottom: 8 },
    input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 16, fontSize: 15, color: '#111827' },
    textArea: { height: 100, textAlignVertical: 'top' },
    btn: { backgroundColor: '#7F1D1D', paddingVertical: 20, borderRadius: 18, alignItems: 'center', marginTop: 10 },
    btnText: { color: '#FFF', fontSize: 14, fontWeight: '900', letterSpacing: 1 }
});
