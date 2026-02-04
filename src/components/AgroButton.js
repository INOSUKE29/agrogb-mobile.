import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../styles/theme';

export default function AgroButton({
    title,
    onPress,
    variant = 'primary', // primary, secondary, danger
    loading = false,
    disabled = false,
    style
}) {
    const isPrimary = variant === 'primary';
    const isDanger = variant === 'danger';

    // Define cores com base na variante
    let bg = theme.colors.primary;
    let txt = '#FFF';
    let border = 'transparent';

    if (variant === 'secondary') {
        bg = 'transparent';
        txt = theme.colors.primaryDeep;
        border = theme.colors.primary;
    } else if (variant === 'danger') {
        bg = '#FEE2E2';
        txt = theme.colors.error;
    }

    // Estado desativado
    if (disabled) {
        bg = '#E5E7EB';
        txt = '#9CA3AF';
        border = 'transparent';
    }

    return (
        <TouchableOpacity
            style={[
                styles.container,
                { backgroundColor: bg, borderColor: border, borderWidth: variant === 'secondary' ? 1 : 0 },
                style
            ]}
            onPress={onPress}
            activeOpacity={0.8}
            disabled={disabled || loading}
        >
            {loading ? (
                <ActivityIndicator color={txt} />
            ) : (
                <Text style={[styles.text, { color: txt }]}>
                    {title.toUpperCase()}
                </Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        height: theme.metrics.buttonHeight,
        borderRadius: theme.metrics.radius,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginVertical: 10,
    },
    text: {
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 1,
    }
});
