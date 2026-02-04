import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function OcrScreen({ navigation }) {
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const handleBarCodeScanned = ({ type, data }) => {
        setScanned(true);
        Alert.alert('Nota Detectada', `Tipo: ${type}\nDados: ${data}`, [
            { text: 'OK', onPress: () => setScanned(false) }
        ]);
    };

    if (hasPermission === null) {
        return <View style={styles.container}><ActivityIndicator size="large" color="#059669" /></View>;
    }
    if (hasPermission === false) {
        return <View style={styles.container}><Text>Sem acesso à câmera</Text></View>;
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#059669', '#047857']} style={styles.header}>
                <Text style={styles.title}>Leitor de Notas Inteligente</Text>
                <Text style={styles.subtitle}>Aponte para o QR Code ou Código de Barras</Text>
            </LinearGradient>

            <Camera
                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                style={styles.camera}
                ratio="16:9"
            >
                <View style={styles.overlay}>
                    <View style={styles.scannerLine} />
                    <Text style={styles.instruction}>Enquadre o código da nota</Text>
                </View>
            </Camera>

            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="#FFF" />
                <Text style={styles.backText}>Voltar</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    header: { padding: 20, paddingTop: 50, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, elevation: 10 },
    title: { color: '#FFF', fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
    subtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 12, textAlign: 'center', marginTop: 5 },
    camera: { flex: 1 },
    overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' },
    scannerLine: { width: '80%', height: 2, backgroundColor: '#00FF00', shadowColor: '#00FF00', shadowOpacity: 1, shadowRadius: 10, elevation: 10 },
    instruction: { color: '#FFF', marginTop: 20, backgroundColor: 'rgba(0,0,0,0.6)', padding: 10, borderRadius: 10 },
    backBtn: { position: 'absolute', bottom: 30, left: 30, flexDirection: 'row', alignItems: 'center' },
    backText: { color: '#FFF', fontWeight: 'bold', marginLeft: 10 }
});
