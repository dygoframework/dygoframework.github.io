---
title: Password hashing
description: The package that dygo g security and dygo g auth write hashes passwords with PBKDF2-HMAC-SHA256.
---

`dygo g security` and `dygo g auth` write a `password.go` file into the generated package. It uses only the standard library: PBKDF2-HMAC-SHA256 with 600,000 iterations, as OWASP advises, and a random 16 byte salt.

```go
// passwordIterations follows the OWASP advice for PBKDF2-HMAC-SHA256.
const passwordIterations = 600_000

// HashPassword returns "pbkdf2-sha256$<iterations>$<salt>$<hash>".
func HashPassword(password string) (string, error) {
	salt := make([]byte, 16)
	if _, err := rand.Read(salt); err != nil {
		return "", err
	}
	key, err := pbkdf2.Key(sha256.New, password, salt, passwordIterations, 32)
	if err != nil {
		return "", err
	}
	enc := base64.RawStdEncoding
	return fmt.Sprintf("pbkdf2-sha256$%d$%s$%s", passwordIterations, enc.EncodeToString(salt), enc.EncodeToString(key)), nil
}
```

- `CheckPassword(hash, password)` compares in constant time.
- `NeedsRehash(hash)` reports a hash made with fewer iterations. The generated login then saves a new hash, so raising `passwordIterations` upgrades users as they sign in.
- Login takes the same time for an unknown email and for a wrong password.

The [authentication page](/docs/security/authentication/) covers the rest of the generated package.
