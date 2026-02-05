import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import * as Updates from 'expo-updates';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught Error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    handleRestart = async () => {
        try {
            // CRITICAL FIX: Limpar sessão para evitar loop de erro
            await AsyncStorage.multiRemove(['@user_session', '@user_profile', '@menu_config']);
            await Updates.reloadAsync();
        } catch (e) {
            Alert.alert("Erro", "Falha ao reiniciar. Feche o app manualmente.");
        }
    };

    render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <View style={styles.card}>
                        <Text style={styles.icon}>🐞</Text>
                        <Text style={styles.title}>Opa! Algo deu errado.</Text>
                        <Text style={styles.subtitle}>
                            O aplicativo encontrou um erro inesperado. Tente reiniciar.
                        </Text>

                        <ScrollView style={styles.errorBox}>
                            <Text style={styles.errorText}>
                                {this.state.error?.toString()}
                            </Text>
                        </ScrollView>

                        <TouchableOpacity style={styles.button} onPress={this.handleRestart}>
                            <Text style={styles.buttonText}>TENTAR REINICIAR</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FEE2E2', justifyContent: 'center', padding: 20 },
    card: { backgroundColor: '#FFF', padding: 30, borderRadius: 20, alignItems: 'center', elevation: 10 },
    icon: { fontSize: 50, marginBottom: 20 },
    title: { fontSize: 20, fontWeight: 'bold', color: '#B91C1C', marginBottom: 10 },
    subtitle: { textAlign: 'center', color: '#4B5563', marginBottom: 20 },
    errorBox: { maxHeight: 150, width: '100%', backgroundColor: '#F3F4F6', padding: 10, borderRadius: 8, marginBottom: 20 },
    errorText: { fontFamily: 'monospace', fontSize: 10, color: '#EF4444' },
    button: { backgroundColor: '#B91C1C', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, width: '100%', alignItems: 'center' },
    buttonText: { color: '#FFF', fontWeight: 'bold' }
});
