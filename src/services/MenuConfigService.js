// CONFIGURAÇÃO PADRÃO (FALLBACK)
const DEFAULT_CONFIG = {
    menu_columns: 3,
    menu_items: [
        { id: "colheita", label: "Colheita", icon: "leaf-outline", screen: "Colheita", color: "#059669", enabled: true },
        { id: "vendas", label: "Vendas", icon: "cash-outline", screen: "Vendas", color: "#10B981", enabled: true },
        { id: "estoque", label: "Estoque", icon: "cube-outline", screen: "Estoque", color: "#3B82F6", enabled: true },
        { id: "monitoramento", label: "Monitorar", icon: "camera-outline", screen: "Monitoramento", color: "#EC4899", enabled: true },
        { id: "adubacao", label: "Adubação", icon: "flask-outline", screen: "AdubacaoList", color: "#7C3AED", enabled: true },
        { id: "compras", label: "Compras", icon: "cart-outline", screen: "Compras", color: "#F59E0B", enabled: true },
        { id: "plantio", label: "Plantio", icon: "nutrition-outline", screen: "Plantio", color: "#8B5CF6", enabled: true },
        { id: "frota", label: "Frota", icon: "car-sport-outline", screen: "Frota", color: "#2563EB", enabled: true },
        { id: "relatorios", label: "Relatórios", icon: "pie-chart-outline", screen: "Relatorios", color: "#374151", enabled: true },
        // Secondary
        { id: "cadastros", label: "Cadastros", icon: "create-outline", screen: "Cadastro", color: "#374151", enabled: true },
        { id: "clientes", label: "Clientes", icon: "people-outline", screen: "Clientes", color: "#374151", enabled: true },
        { id: "areas", label: "Áreas", icon: "map-outline", screen: "Culturas", color: "#374151", enabled: true },
        { id: "sync", label: "Sync", icon: "cloud-upload-outline", screen: "Sync", color: "#6366F1", enabled: true }
    ],
    monitoramento_features: {
        novo_registro: true,
        pesquisa_pdf: true,
        galeria_fotos: true
    }
};

const CACHE_KEY = '@app_remote_config_v1';

export const MenuConfigService = {
    /**
     * Obtém toda a configuração remota (Menu + Features).
     */
    getRemoteConfig: async () => {
        try {
            // 1. Cache Local (Rápido)
            const cached = await AsyncStorage.getItem(CACHE_KEY);
            let config = cached ? JSON.parse(cached) : DEFAULT_CONFIG;

            // 2. Fetch Remote (Simulado ou Real)
            // Aqui entraria: remoteConfig().fetchAndActivate()...
            // Por enquanto, simulamos um merge com defaults

            // Garantir que monitoramento_features exista (fallback)
            if (!config.monitoramento_features) {
                config.monitoramento_features = DEFAULT_CONFIG.monitoramento_features;
            }

            return config;
        } catch (error) {
            console.warn('Config Error:', error);
            return DEFAULT_CONFIG;
        }
    },

    /**
     * Helper para pegar apenas features de monitoramento
     */
    getMonitoramentoFeatures: async () => {
        const cfg = await MenuConfigService.getRemoteConfig();
        return cfg.monitoramento_features;
    },

    // Mantendo compatibilidade com código anterior
    getMenuConfig: async () => {
        return MenuConfigService.getRemoteConfig();
    },

    resetConfig: async () => {
        await AsyncStorage.removeItem(CACHE_KEY);
        return DEFAULT_CONFIG;
    }
};
