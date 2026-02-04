import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, Alert, Share } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../styles/theme';
import AgroButton from '../components/AgroButton';
import { updatePlanoAdubacao } from '../database/database';

export default function AdubacaoDetailScreen({ route, navigation }) {
    const { plano } = route.params;
    const [currentPlano, setCurrentPlano] = useState(plano);
    const [loading, setLoading] = useState(false);

    const isApplied = currentPlano.status === 'APLICADO';

    const handleApply = async () => {
        Alert.alert(
            'Confirmar Aplicação',
            'Deseja marcar este plano como REALIZADO? Isso servirá como registro histórico.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Confirmar',
                    onPress: async () => {
                        setLoading(true);
                        const updated = {
                            ...currentPlano,
                            status: 'APLICADO',
                            data_aplicacao: new Date().toISOString()
                        };
                        await updatePlanoAdubacao(currentPlano.uuid, updated);
                        setCurrentPlano(updated);
                        setLoading(false);
                        Alert.alert('Sucesso', 'Plano marcado como APLICADO!');
                    }
                }
            ]
        );
    };

    const handleShare = async () => {
        try {
            const message = `*AGROGB - PLANO DE ADUBAÇÃO*\n\n` +
                `📅 ${new Date(currentPlano.data_criacao).toLocaleDateString()}\n` +
                `📝 ${currentPlano.nome_plano}\n` +
                `🌱 Cultura: ${currentPlano.cultura}\n` +
                `💧 Aplicação: ${currentPlano.tipo_aplicacao}\n` +
                `📍 Local: ${currentPlano.area_local || 'Geral'}\n\n` +
                `*RECEITA/ORIENTAÇÃO:*\n${currentPlano.descricao_tecnica}\n\n` +
                `Status: ${currentPlano.status}`;

            await Share.share({
                message: message,
            });
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>

                {/* STATUS BAR */}
                <View style={[styles.statusBar, isApplied ? styles.bgApplied : styles.bgPlanned]}>
                    <Ionicons name={isApplied ? "checkmark-circle" : "time"} size={20} color="#FFF" />
                    <Text style={styles.statusText}>
                        {isApplied
                            ? `APLICADO EM ${new Date(currentPlano.data_aplicacao).toLocaleDateString()}`
                            : 'PLANEJADO - AGUARDANDO APLICAÇÃO'}
                    </Text>
                </View>

                {/* HEADER */}
                <View style={styles.header}>
                    <View style={styles.iconBox}>
                        <FontAwesome5
                            name={currentPlano.tipo_aplicacao === 'GOTEJO' ? 'faucet' : 'spray-can'}
                            size={24}
                            color={theme.colors.primary}
                        />
                    </View>
                    <View>
                        <Text style={styles.title}>{currentPlano.nome_plano}</Text>
                        <Text style={styles.subtitle}>{currentPlano.cultura} • {currentPlano.area_local || 'Sem local definido'}</Text>
                    </View>
                </View>

                {/* RECEITA */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ORIENTAÇÃO TÉCNICA</Text>
                    <View style={styles.card}>
                        <Text style={styles.description}>{currentPlano.descricao_tecnica}</Text>
                    </View>
                </View>

                {/* ANEXOS */}
                {currentPlano.anexos_uri && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>ANEXO / FOTO</Text>
                        <Image
                            source={{ uri: currentPlano.anexos_uri }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    </View>
                )}

            </ScrollView>

            <View style={styles.footer}>
                {!isApplied ? (
                    <AgroButton
                        title="MARCAR COMO APLICADO"
                        onPress={handleApply}
                        loading={loading}
                    />
                ) : (
                    <AgroButton
                        title="COMPARTILHAR REGISTRO"
                        variant="secondary"
                        onPress={handleShare}
                    />
                )}

                <AgroButton
                    title="EDITAR"
                    variant="secondary"
                    style={{ marginTop: 0 }}
                    disabled={isApplied} // Desabilita edição se já aplicado (regra de segurança)
                    onPress={() => navigation.navigate('AdubacaoForm', { plano: currentPlano })}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    content: { paddingBottom: 100 },
    statusBar: { padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    bgPlanned: { backgroundColor: '#F59E0B' },
    bgApplied: { backgroundColor: '#10B981' },
    statusText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
    header: { padding: 20, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    iconBox: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
    title: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
    subtitle: { fontSize: 14, color: '#6B7280' },
    section: { padding: 20 },
    sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#6B7280', marginBottom: 10, letterSpacing: 1 },
    card: { backgroundColor: '#FFF', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', minHeight: 100 },
    description: { fontSize: 16, color: '#374151', lineHeight: 24, fontFamily: 'System' }, // Monospaced? No, System is better for reading
    image: { width: '100%', height: 300, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB' },
    footer: { padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E5E7EB' }
});
