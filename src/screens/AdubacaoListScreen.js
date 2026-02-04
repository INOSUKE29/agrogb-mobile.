import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons'; // FontAwesome5 for specific agro icons
import { theme } from '../styles/theme';
import { getPlanosAdubacao, deletePlanoAdubacao } from '../database/database';
import { useIsFocused } from '@react-navigation/native';

export default function AdubacaoListScreen({ navigation }) {
    const [planos, setPlanos] = useState([]);
    const [loading, setLoading] = useState(false);
    const isFocused = useIsFocused(); // Recarrega ao voltar

    const loadPlanos = async () => {
        setLoading(true);
        try {
            const data = await getPlanosAdubacao();
            setPlanos(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isFocused) loadPlanos();
    }, [isFocused]);

    const handleDelete = (plano) => {
        Alert.alert(
            'Excluir Plano',
            `Deseja excluir "${plano.nome_plano}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        await deletePlanoAdubacao(plano.uuid);
                        loadPlanos();
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }) => {
        const isApplied = item.status === 'APLICADO';

        return (
            <TouchableOpacity
                style={[styles.card, isApplied && styles.cardApplied]}
                onPress={() => navigation.navigate('AdubacaoDetail', { plano: item })}
                onLongPress={() => handleDelete(item)}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.iconContainer}>
                        <FontAwesome5
                            name={item.tipo_aplicacao === 'GOTEJO' ? 'faucet' : 'spray-can'}
                            size={20}
                            color={isApplied ? '#059669' : '#F59E0B'}
                        />
                    </View>
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>{item.nome_plano}</Text>
                        <Text style={styles.cardSubtitle}>
                            {item.cultura} • {item.tipo_aplicacao}
                        </Text>
                    </View>
                    <View style={styles.statusBadge}>
                        <Text style={[styles.statusText, isApplied ? styles.textApplied : styles.textPlanned]}>
                            {item.status}
                        </Text>
                    </View>
                </View>

                {item.area_local ? (
                    <Text style={styles.localText}>📍 {item.area_local}</Text>
                ) : null}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={planos}
                keyExtractor={(item) => item.uuid}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadPlanos} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="flask-outline" size={64} color="#D1D5DB" />
                        <Text style={styles.emptyText}>Nenhum plano de adubação criado.</Text>
                        <Text style={styles.emptySub}>Toque no + para criar uma receita.</Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('AdubacaoForm')}
            >
                <Ionicons name="add" size={30} color="#FFF" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    listContent: { padding: 15, paddingBottom: 100 },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4,
        borderLeftWidth: 4,
        borderLeftColor: '#F59E0B' // Padrão: Planejado (Amber)
    },
    cardApplied: {
        borderLeftColor: '#10B981', // Verde
        opacity: 0.8
    },
    cardHeader: { flexDirection: 'row', alignItems: 'center' },
    iconContainer: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: '#F3F4F6',
        alignItems: 'center', justifyContent: 'center',
        marginRight: 12
    },
    cardContent: { flex: 1 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.textDark },
    cardSubtitle: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: '#F3F4F6' },
    statusText: { fontSize: 10, fontWeight: 'bold' },
    textPlanned: { color: '#F59E0B' },
    textApplied: { color: '#10B981' },
    localText: { marginTop: 10, fontSize: 12, color: theme.colors.textMuted, fontStyle: 'italic' },
    fab: {
        position: 'absolute', bottom: 20, right: 20,
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: theme.colors.primary,
        alignItems: 'center', justifyContent: 'center',
        elevation: 5, shadowColor: '#000', shadowOpacity: 0.3
    },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    emptyText: { marginTop: 20, fontSize: 16, fontWeight: 'bold', color: theme.colors.textMuted },
    emptySub: { marginTop: 5, fontSize: 14, color: '#9CA3AF' }
});
