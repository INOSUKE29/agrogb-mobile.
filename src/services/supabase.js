
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { executeQuery } from '../database/database';

// ⚠️ CHAVES REAIS DO SUPABASE ⚠️
const SUPABASE_URL = 'https://bybryyvmwkahoohgtmpc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_QdNitBVoMJmfgG7vE4cPUg_bIwVA7sn';

let supabaseInstance = null;

export const getSupabase = () => {
    if (!supabaseInstance) {
        supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                storage: null,
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: false,
            },
        });
    }
    return supabaseInstance;
};

// Sincronização Bidirecional
export const syncTable = async (tableName) => {
    const supabase = getSupabase();

    // 1. PUSH: Envia dados locais pendentes (sync_status = 0)
    try {
        const res = await executeQuery(`SELECT * FROM ${tableName} WHERE sync_status = 0`);
        const rows = [];
        for (let i = 0; i < res.rows.length; i++) rows.push(res.rows.item(i));

        if (rows.length > 0) {
            // Remove campos locais antes de enviar (id, sync_status)
            const cleanRows = rows.map(r => {
                const { id, sync_status, ...rest } = r;
                return rest;
            });

            const { error } = await supabase.from(tableName).upsert(cleanRows, { onConflict: 'uuid' });

            if (!error) {
                // Marca como sincronizado localmente
                for (const row of rows) {
                    await executeQuery(`UPDATE ${tableName} SET sync_status = 1 WHERE uuid = ?`, [row.uuid]);
                }
            } else {
                console.error(`Erro envio ${tableName}:`, error);
            }
        }
    } catch (e) { console.error(`Erro local ${tableName}:`, e); }

    // 2. PULL: Baixa dados novos da nuvem
    // (Simplificado: baixa tudo que mudou recentemente, ou tudo se for pequeno. 
    // Ideal: Usar 'last_updated' local máximo para filtrar)
    try {
        // Pega o maior last_updated local
        const resLast = await executeQuery(`SELECT MAX(last_updated) as max_date FROM ${tableName}`);
        const lastDate = resLast.rows.item(0).max_date || '1970-01-01T00:00:00.000Z';

        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .gt('last_updated', lastDate);

        if (data && data.length > 0) {
            for (const item of data) {
                // Insere ou Atualiza Local
                // Precisamos montar a query de insert dinamicamente ou ter funções específicas no database.js
                // Por simplicidade, vamos assumir que o usuário vai recarregar o app ou implementar update genérico
                // AQUI É UM PONTO CRÍTICO: Generic Insert/Update no SQLite é chato sem ORM.
                // Vou focar no upload por enquanto ou implementar um insert genérico no SyncScreen.
            }
        }
    } catch (e) { }
};

export const testConnection = async () => {
    try {
        const supabase = getSupabase();
        const { data, error } = await supabase.from('usuarios').select('count').limit(1);
        return !error;
    } catch (e) {
        return false;
    }
};
