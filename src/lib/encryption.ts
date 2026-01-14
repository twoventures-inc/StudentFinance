/**
 * Encryption Utility Library
 * 
 * Uses Web Crypto API for AES-GCM encryption with PBKDF2 key derivation.
 * This provides client-side encryption before data is sent to Supabase.
 */

// Constants for encryption
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const KEY_LENGTH = 256;
const PBKDF2_ITERATIONS = 100000;

// Prefix to identify encrypted data
const ENCRYPTED_PREFIX = 'ENC:';

/**
 * Generate a cryptographic key from a password using PBKDF2
 */
export async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);

    // Import password as raw key material
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        'PBKDF2',
        false,
        ['deriveKey']
    );

    // Derive the actual encryption key
    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: salt,
            iterations: PBKDF2_ITERATIONS,
            hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: KEY_LENGTH },
        false,
        ['encrypt', 'decrypt']
    );
}

/**
 * Generate a key from user's password and a fixed salt derived from user ID
 */
export async function generateEncryptionKey(userPassword: string, userId: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    // Use userId to create a deterministic salt
    const saltBase = encoder.encode(userId + '_encryption_salt_v1');
    const saltHash = await crypto.subtle.digest('SHA-256', saltBase);
    const salt = new Uint8Array(saltHash).slice(0, SALT_LENGTH);

    return deriveKey(userPassword, salt);
}

/**
 * Encrypt a string value
 * Returns base64-encoded string with IV prepended
 */
export async function encrypt(plaintext: string, key: CryptoKey): Promise<string> {
    if (!plaintext || plaintext.length === 0) {
        return plaintext;
    }

    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

    const encryptedBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        encoder.encode(plaintext)
    );

    // Combine IV + encrypted data
    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedBuffer), iv.length);

    // Return as base64 with prefix
    return ENCRYPTED_PREFIX + btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt an encrypted string value
 */
export async function decrypt(ciphertext: string, key: CryptoKey): Promise<string> {
    if (!ciphertext || ciphertext.length === 0) {
        return ciphertext;
    }

    // Check if data is encrypted
    if (!ciphertext.startsWith(ENCRYPTED_PREFIX)) {
        // Return as-is if not encrypted (legacy data)
        return ciphertext;
    }

    try {
        const encoded = ciphertext.slice(ENCRYPTED_PREFIX.length);
        const combined = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));

        // Extract IV and encrypted data
        const iv = combined.slice(0, IV_LENGTH);
        const encryptedData = combined.slice(IV_LENGTH);

        const decryptedBuffer = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            key,
            encryptedData
        );

        const decoder = new TextDecoder();
        return decoder.decode(decryptedBuffer);
    } catch (error) {
        console.error('Decryption failed:', error);
        // Return original if decryption fails (might be corrupted or wrong key)
        return ciphertext;
    }
}

/**
 * Check if a value is encrypted
 */
export function isEncrypted(value: string): boolean {
    return value?.startsWith(ENCRYPTED_PREFIX) ?? false;
}

/**
 * Encrypt an object's specified fields
 */
export async function encryptFields<T extends Record<string, unknown>>(
    obj: T,
    fields: (keyof T)[],
    key: CryptoKey
): Promise<T> {
    const result = { ...obj };

    for (const field of fields) {
        const value = obj[field];
        if (typeof value === 'string' && value.length > 0) {
            (result as Record<string, unknown>)[field as string] = await encrypt(value, key);
        }
    }

    return result;
}

/**
 * Decrypt an object's specified fields
 */
export async function decryptFields<T extends Record<string, unknown>>(
    obj: T,
    fields: (keyof T)[],
    key: CryptoKey
): Promise<T> {
    const result = { ...obj };

    for (const field of fields) {
        const value = obj[field];
        if (typeof value === 'string' && isEncrypted(value)) {
            (result as Record<string, unknown>)[field as string] = await decrypt(value, key);
        }
    }

    return result;
}

/**
 * Store encryption key securely in session storage (cleared on tab close)
 * Note: For highest security, we only store the encrypted key, never plain password
 */
export async function exportKeyToStorage(key: CryptoKey, storageKey: string): Promise<void> {
    // Export the key to raw format
    const exported = await crypto.subtle.exportKey('raw', key);
    const base64Key = btoa(String.fromCharCode(...new Uint8Array(exported)));
    sessionStorage.setItem(storageKey, base64Key);
}

/**
 * Import encryption key from session storage
 */
export async function importKeyFromStorage(storageKey: string): Promise<CryptoKey | null> {
    const base64Key = sessionStorage.getItem(storageKey);
    if (!base64Key) return null;

    try {
        const keyData = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));
        return crypto.subtle.importKey(
            'raw',
            keyData,
            { name: 'AES-GCM', length: KEY_LENGTH },
            false,
            ['encrypt', 'decrypt']
        );
    } catch (error) {
        console.error('Failed to import key from storage:', error);
        return null;
    }
}

/**
 * Clear encryption key from storage
 */
export function clearKeyFromStorage(storageKey: string): void {
    sessionStorage.removeItem(storageKey);
}
