import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import {
    generateEncryptionKey,
    exportKeyToStorage,
    importKeyFromStorage,
    clearKeyFromStorage,
    encrypt,
    decrypt,
    encryptFields,
    decryptFields,
} from '@/lib/encryption';

const ENCRYPTION_KEY_STORAGE = 'sf_encryption_key';

interface EncryptionContextType {
    /** Whether encryption is initialized and ready */
    isReady: boolean;
    /** Initialize encryption with user credentials */
    initializeEncryption: (password: string, userId: string) => Promise<void>;
    /** Clear encryption key (on logout) */
    clearEncryption: () => void;
    /** Encrypt a single string value */
    encryptValue: (value: string) => Promise<string>;
    /** Decrypt a single string value */
    decryptValue: (value: string) => Promise<string>;
    /** Encrypt specific fields of an object */
    encryptObjectFields: <T extends Record<string, unknown>>(obj: T, fields: (keyof T)[]) => Promise<T>;
    /** Decrypt specific fields of an object */
    decryptObjectFields: <T extends Record<string, unknown>>(obj: T, fields: (keyof T)[]) => Promise<T>;
}

const EncryptionContext = createContext<EncryptionContextType | undefined>(undefined);

export function EncryptionProvider({ children }: { children: ReactNode }) {
    const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
    const [isReady, setIsReady] = useState(false);

    /**
     * Initialize encryption with user's password and ID
     * Called after successful login
     */
    const initializeEncryption = useCallback(async (password: string, userId: string) => {
        try {
            // Generate key from password and userId
            const key = await generateEncryptionKey(password, userId);
            setEncryptionKey(key);
            setIsReady(true);

            // Store key in session storage for page refreshes
            await exportKeyToStorage(key, ENCRYPTION_KEY_STORAGE);
        } catch (error) {
            console.error('Failed to initialize encryption:', error);
            throw error;
        }
    }, []);

    /**
     * Try to restore encryption key from session storage
     * Called on app initialization if user is already logged in
     */
    const restoreEncryption = useCallback(async () => {
        try {
            const key = await importKeyFromStorage(ENCRYPTION_KEY_STORAGE);
            if (key) {
                setEncryptionKey(key);
                setIsReady(true);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to restore encryption:', error);
            return false;
        }
    }, []);

    /**
     * Clear encryption key (on logout)
     */
    const clearEncryption = useCallback(() => {
        setEncryptionKey(null);
        setIsReady(false);
        clearKeyFromStorage(ENCRYPTION_KEY_STORAGE);
    }, []);

    /**
     * Encrypt a single value
     */
    const encryptValue = useCallback(async (value: string): Promise<string> => {
        if (!encryptionKey) {
            console.warn('Encryption not initialized, returning plain value');
            return value;
        }
        return encrypt(value, encryptionKey);
    }, [encryptionKey]);

    /**
     * Decrypt a single value
     */
    const decryptValue = useCallback(async (value: string): Promise<string> => {
        if (!encryptionKey) {
            console.warn('Encryption not initialized, returning as-is');
            return value;
        }
        return decrypt(value, encryptionKey);
    }, [encryptionKey]);

    /**
     * Encrypt specific fields of an object
     */
    const encryptObjectFields = useCallback(async <T extends Record<string, unknown>>(
        obj: T,
        fields: (keyof T)[]
    ): Promise<T> => {
        if (!encryptionKey) {
            console.warn('Encryption not initialized, returning plain object');
            return obj;
        }
        return encryptFields(obj, fields, encryptionKey);
    }, [encryptionKey]);

    /**
     * Decrypt specific fields of an object
     */
    const decryptObjectFields = useCallback(async <T extends Record<string, unknown>>(
        obj: T,
        fields: (keyof T)[]
    ): Promise<T> => {
        if (!encryptionKey) {
            console.warn('Encryption not initialized, returning as-is');
            return obj;
        }
        return decryptFields(obj, fields, encryptionKey);
    }, [encryptionKey]);

    // Try to restore encryption on mount
    useState(() => {
        restoreEncryption();
    });

    return (
        <EncryptionContext.Provider
            value={{
                isReady,
                initializeEncryption,
                clearEncryption,
                encryptValue,
                decryptValue,
                encryptObjectFields,
                decryptObjectFields,
            }}
        >
            {children}
        </EncryptionContext.Provider>
    );
}

export function useEncryption() {
    const context = useContext(EncryptionContext);
    if (context === undefined) {
        throw new Error('useEncryption must be used within an EncryptionProvider');
    }
    return context;
}
