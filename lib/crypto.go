package lib

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"fmt"
	"os"
)

// Returns the first 32 bytes of the SHA-256 hash of the ENCRYPTION_KEY environment variable
func GetEncryptionKey() []byte {
	key := []byte(os.Getenv("ENCRYPTION_KEY"))
	hash := sha256.Sum256(key)
	return hash[:32] // Use the first 32 bytes for AES-256
}

// Encrypt data using AES
func Encrypt(data []byte) (string, error) {
	encryptionKey := GetEncryptionKey()
	fmt.Printf("Encryption Key Length: %d\n", len(encryptionKey))

	block, err := aes.NewCipher(encryptionKey)
	if err != nil {
		return "", err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}
	nonce := make([]byte, gcm.NonceSize())
	_, err = rand.Read(nonce)
	if err != nil {
		return "", err
	}
	cipherText := gcm.Seal(nonce, nonce, data, nil)
	return base64.StdEncoding.EncodeToString(cipherText), nil
}

// decrypt decrypts the data using AES-GCM.
func Decrypt(encryptedString string) (string, error) {
	encryptionKey := GetEncryptionKey()

	data, err := base64.StdEncoding.DecodeString(encryptedString)
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher(encryptionKey)
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonceSize := gcm.NonceSize()
	if len(data) < nonceSize {
		return "", errors.New("ciphertext too short")
	}

	nonce, ciphertext := data[:nonceSize], data[nonceSize:]
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", err
	}

	return string(plaintext), nil
}

// GenerateRandomBytes returns securely generated random bytes.
func GenerateRandomBytes(n int) ([]byte, error) {
	b := make([]byte, n)
	_, err := rand.Read(b)
	if err != nil {
		return nil, err
	}

	return b, nil
}
