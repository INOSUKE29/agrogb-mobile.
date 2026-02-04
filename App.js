import 'react-native-get-random-values';
import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { initDB } from './src/database/database';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ColheitaScreen from './src/screens/ColheitaScreen';
import VendasScreen from './src/screens/VendasScreen';
import EstoqueScreen from './src/screens/EstoqueScreen';
import SyncScreen from './src/screens/SyncScreen';
import ComprasScreen from './src/screens/ComprasScreen';
import PlantioScreen from './src/screens/PlantioScreen';
import CustosScreen from './src/screens/CustosScreen';
import DescarteScreen from './src/screens/DescarteScreen';
import RelatoriosScreen from './src/screens/RelatoriosScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import MonitoramentoScreen from './src/screens/MonitoramentoScreen';
import CadastroScreen from './src/screens/CadastroScreen';
import ClientesScreen from './src/screens/ClientesScreen';
import CulturasScreen from './src/screens/CulturasScreen';
import UsuariosScreen from './src/screens/UsuariosScreen';
import OcrScreen from './src/screens/OcrScreen';
import ScannerScreen from './src/screens/ScannerScreen';
import FrotaScreen from './src/screens/FrotaScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AdubacaoListScreen from './src/screens/AdubacaoListScreen';
import AdubacaoFormScreen from './src/screens/AdubacaoFormScreen';
import AdubacaoDetailScreen from './src/screens/AdubacaoDetailScreen';

const Stack = createStackNavigator();

export default function App() {
    useEffect(() => {
        initDB().catch(console.error);
    }, []);

    return (
        <>
            <StatusBar style="light" />
            <NavigationContainer>
                <Stack.Navigator
                    initialRouteName="Login"
                    screenOptions={{
                        headerStyle: { backgroundColor: '#10B981' },
                        headerTintColor: '#fff',
                        headerTitleStyle: { fontWeight: 'bold' }
                    }}
                >
                    <Stack.Screen
                        name="Login"
                        component={LoginScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="Register"
                        component={RegisterScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="Home"
                        component={HomeScreen}
                        options={{ title: 'AgroGB Mobile' }}
                    />
                    <Stack.Screen
                        name="Colheita"
                        component={ColheitaScreen}
                        options={{ title: 'Registrar Colheita' }}
                    />
                    <Stack.Screen
                        name="Vendas"
                        component={VendasScreen}
                        options={{ title: 'Registrar Venda' }}
                    />
                    <Stack.Screen
                        name="Estoque"
                        component={EstoqueScreen}
                        options={{ title: 'Consultar Estoque' }}
                    />
                    <Stack.Screen
                        name="Sync"
                        component={SyncScreen}
                        options={{ title: 'Sincronizar Dados' }}
                    />
                    <Stack.Screen
                        name="Compras"
                        component={ComprasScreen}
                        options={{ title: 'Registrar Compra' }}
                    />
                    <Stack.Screen
                        name="Plantio"
                        component={PlantioScreen}
                        options={{ title: 'Registrar Plantio' }}
                    />
                    <Stack.Screen
                        name="Custos"
                        component={CustosScreen}
                        options={{ title: 'Registrar Custo' }}
                    />
                    <Stack.Screen
                        name="Descarte"
                        component={DescarteScreen}
                        options={{ title: 'Registrar Descarte' }}
                    />
                    <Stack.Screen
                        name="Cadastro"
                        component={CadastroScreen}
                        options={{ title: 'Cadastros Gerais' }}
                    />
                    <Stack.Screen
                        name="Clientes"
                        component={ClientesScreen}
                        options={{ title: 'Gerenciar Clientes' }}
                    />
                    <Stack.Screen
                        name="Culturas"
                        component={CulturasScreen}
                        options={{ title: 'Culturas e Áreas' }}
                    />
                    <Stack.Screen
                        name="Relatorios"
                        component={RelatoriosScreen}
                        options={{ title: 'Relatórios' }}
                    />
                    <Stack.Screen name="Usuarios" component={UsuariosScreen} options={{ title: 'Controle de Usuários' }} />
                    <Stack.Screen name="Monitoramento" component={MonitoramentoScreen} options={{ title: 'Monitoramento' }} />
                    <Stack.Screen name="Ocr" component={OcrScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Scanner" component={ScannerScreen} options={{ headerShown: false }} />
                    <Stack.Screen name="Frota" component={FrotaScreen} options={{ title: 'Gestão de Frota' }} />
                    <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Meu Perfil UltraPro' }} />

                    {/* ADUBAÇÃO v5.4 */}
                    <Stack.Screen name="AdubacaoList" component={AdubacaoListScreen} options={{ title: 'Planos de Adubação' }} />
                    <Stack.Screen name="AdubacaoForm" component={AdubacaoFormScreen} options={{ title: 'Novo Plano' }} />
                    <Stack.Screen name="AdubacaoDetail" component={AdubacaoDetailScreen} options={{ title: 'Detalhes do Plano' }} />

                </Stack.Navigator>
            </NavigationContainer>
        </>
    );
}
