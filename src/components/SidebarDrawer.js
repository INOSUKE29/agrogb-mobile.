import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Animated, Dimensions, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

export default function SidebarDrawer({ visible, onClose }) {
    const navigation = useNavigation();
    const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current; // Start hidden (left)
    const [user, setUser] = useState({ name: 'Usuário', email: 'agrogb@sistema.com' });

    useEffect(() => {
        if (visible) {
            // Slide In
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
            loadProfile();
        } else {
            // Slide Out
            Animated.timing(slideAnim, {
                toValue: -DRAWER_WIDTH,
                duration: 250,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    const loadProfile = async () => {
        try {
            const json = await AsyncStorage.getItem('@user_profile');
            if (json) setUser(JSON.parse(json));
        } catch (e) { }
    };

    const handleNavigation = (screen, params = {}) => {
        onClose();
        setTimeout(() => {
            navigation.navigate(screen, params);
        }, 300);
    };

    const handleLogout = async () => {
        Alert.alert(
            'Sair do App',
            'Deseja realmente sair?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'SAIR', style: 'destructive',
                    onPress: async () => {
                        onClose();
                        try {
                            await AsyncStorage.multiRemove(['@user_session', '@user_profile']);
                            // Opcional: Limpar tudo exceto configurações importantes
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Login' }],
                            });
                        } catch (e) {
                            console.log('Login error', e);
                            navigation.replace('Login');
                        }
                    }
                }
            ]
        );
    };

    const MenuItem = ({ icon, label, screen, badge }) => (
        <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigation(screen)}>
            <View style={{ width: 30, alignItems: 'center' }}>
                <Ionicons name={icon} size={22} color="#374151" />
            </View>
            <Text style={styles.menuText}>{label}</Text>
            {badge && <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View>}
        </TouchableOpacity>
    );

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} onRequestClose={onClose} animationType="fade">
            <View style={styles.overlay}>
                {/* Backdrop (Click to close) */}
                <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />

                {/* Drawer Content */}
                <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>

                    {/* Header: User Info */}
                    <View style={styles.header}>
                        <View style={styles.avatar}>
                            <Ionicons name="person" size={30} color="#FFF" />
                        </View>
                        <View>
                            <Text style={styles.userName}>{user.nome_completo || user.nome || 'AgroGB User'}</Text>
                            <Text style={styles.userEmail}>{user.email || 'Online'}</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={{ position: 'absolute', top: 20, right: 10 }}>
                            <Ionicons name="close" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    {/* Menu Items */}
                    <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
                        <Text style={styles.sectionTitle}>NAVEGAÇÃO</Text>
                        <MenuItem icon="home-outline" label="Painel / Início" screen="Home" />
                        <MenuItem icon="camera-outline" label="Monitoramento" screen="Monitoramento" />
                        <MenuItem icon="cube-outline" label="Estoque" screen="Estoque" />
                        <MenuItem icon="cart-outline" label="Compras" screen="Compras" />
                        <MenuItem icon="people-outline" label="Clientes" screen="Clientes" />

                        <View style={styles.divider} />

                        <Text style={styles.sectionTitle}>SISTEMA</Text>
                        <MenuItem icon="person-outline" label="Meu Perfil" screen="Profile" />
                        <MenuItem icon="settings-outline" label="Configurações" screen="Sync" />
                        <MenuItem icon="information-circle-outline" label="Sobre" screen="Help" />
                    </ScrollView>

                    {/* Footer: Logout */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                            <Ionicons name="log-out-outline" size={24} color="#EF4444" />
                            <Text style={styles.logoutText}>Sair</Text>
                        </TouchableOpacity>
                        <Text style={styles.version}>v7.0.0 (MVP)</Text>
                    </View>

                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
    backdrop: { ...StyleSheet.absoluteFillObject },
    drawer: {
        width: DRAWER_WIDTH,
        height: '100%',
        backgroundColor: '#FFF',
        position: 'absolute',
        left: 0,
        zIndex: 2,
        shadowColor: "#000",
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    header: {
        backgroundColor: '#059669',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center'
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15
    },
    userName: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    userEmail: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
    body: { flex: 1, paddingVertical: 10 },
    sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#9CA3AF', marginLeft: 20, marginTop: 15, marginBottom: 5 },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 20 },
    menuText: { fontSize: 15, color: '#374151', marginLeft: 15, fontWeight: '500' },
    divider: { height: 1, backgroundColor: '#E5E7EB', marginVertical: 10, marginHorizontal: 20 },
    footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#E5E7EB', backgroundColor: '#F9FAFB' },
    logoutBtn: { flexDirection: 'row', alignItems: 'center' },
    logoutText: { color: '#EF4444', fontSize: 16, fontWeight: 'bold', marginLeft: 15 },
    version: { marginTop: 10, fontSize: 10, color: '#9CA3AF', textAlign: 'center' }
});
