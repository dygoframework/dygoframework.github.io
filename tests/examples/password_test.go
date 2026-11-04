package examples

import "testing"

func TestPasswordHashing(t *testing.T) {
	hash, err := HashPassword("correct horse")
	if err != nil {
		t.Fatal(err)
	}
	if !CheckPassword(hash, "correct horse") {
		t.Fatal("the right password must match")
	}
	if CheckPassword(hash, "wrong") {
		t.Fatal("a wrong password must not match")
	}
	if NeedsRehash(hash) {
		t.Fatal("a fresh hash needs no rehash")
	}
	if !NeedsRehash("pbkdf2-sha256$100000$c2FsdA$a2V5") {
		t.Fatal("fewer iterations must ask for a rehash")
	}
}
