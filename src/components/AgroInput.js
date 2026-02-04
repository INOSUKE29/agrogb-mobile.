import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { theme } from '../styles/theme';

export default function AgroInput({
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry,
    keyboardType,
    error,
    autoCapitalize = 'sentences',
    maxLength,
    style
}) {
    const [isFocused, setIsFocused] = useState(false);

    // Cor da borda dinâmica
    const borderColor = error
        ? theme.colors.error
        : isFocused
            ? theme.colors.primary
            : theme.colors.border;

    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label.toUpperCase()}</Text>}

            <TextInput
                style={[
                    styles.input,
                    { borderColor: borderColor }
                ]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={theme.colors.textMuted}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalize}
                maxLength={maxLength}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />

            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 15,
        width: '100%',
    },
    label: {
        fontSize: 10,
        fontWeight: 'bold',
        color: theme.colors.textMuted,
        marginBottom: 6,
        letterSpacing: 0.5,
    },
    input: {
        height: theme.metrics.inputHeight,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderRadius: 8, // Design System: Radius 8px para inputs
        paddingHorizontal: 15,
        fontSize: 16,
        color: theme.colors.textDark,
    },
    errorText: {
        color: theme.colors.error,
        fontSize: 12,
        marginTop: 4,
    }
});
