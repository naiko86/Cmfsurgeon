#!/usr/bin/env bash
# Builds and signs the Apple Wallet business card (site/onur-dogru.pkpass).
# Needs (as environment variables, e.g. GitHub Actions secrets):
#   PASS_CERT_P12_BASE64  Pass Type ID certificate + private key exported as .p12, base64-encoded
#   PASS_CERT_PASSWORD    password of that .p12
#   PASS_TYPE_ID          e.g. pass.com.cmfsurgeon.card
#   TEAM_ID               Apple Developer Team ID (10 characters)
# Optional: WWDR_CERT_PATH (Apple WWDR G4 certificate, PEM or DER); downloaded from apple.com otherwise.
set -euo pipefail
cd "$(dirname "$0")"
OUT="${1:-../site/onur-dogru.pkpass}"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

cp pass/*.png "$WORK/"
sed -e "s/__PASS_TYPE_ID__/${PASS_TYPE_ID}/" -e "s/__TEAM_ID__/${TEAM_ID}/" pass/pass.json > "$WORK/pass.json"

# manifest.json: SHA-1 of every file in the pass
( cd "$WORK"
  printf '{'
  first=1
  for f in pass.json *.png; do
    [ $first -eq 1 ] || printf ','
    first=0
    printf '"%s":"%s"' "$f" "$(openssl sha1 -r "$f" | cut -d' ' -f1)"
  done
  printf '}'
) > "$WORK/manifest.json"

# Certificates
echo "$PASS_CERT_P12_BASE64" | base64 -d > "$WORK/cert.p12"
openssl pkcs12 -in "$WORK/cert.p12" -clcerts -nokeys -passin env:PASS_CERT_PASSWORD -out "$WORK/cert.pem" -legacy 2>/dev/null \
  || openssl pkcs12 -in "$WORK/cert.p12" -clcerts -nokeys -passin env:PASS_CERT_PASSWORD -out "$WORK/cert.pem"
openssl pkcs12 -in "$WORK/cert.p12" -nocerts -nodes -passin env:PASS_CERT_PASSWORD -out "$WORK/key.pem" -legacy 2>/dev/null \
  || openssl pkcs12 -in "$WORK/cert.p12" -nocerts -nodes -passin env:PASS_CERT_PASSWORD -out "$WORK/key.pem"
WWDR="${WWDR_CERT_PATH:-$WORK/wwdr.cer}"
[ -f "$WWDR" ] || curl -fsSL https://www.apple.com/certificateauthority/AppleWWDRCAG4.cer -o "$WWDR"
openssl x509 -in "$WWDR" -inform DER -out "$WORK/wwdr.pem" 2>/dev/null || cp "$WWDR" "$WORK/wwdr.pem"

# Detached PKCS#7 signature of manifest.json
openssl smime -binary -sign -signer "$WORK/cert.pem" -inkey "$WORK/key.pem" -certfile "$WORK/wwdr.pem" \
  -in "$WORK/manifest.json" -out "$WORK/signature" -outform DER

rm -f "$WORK"/cert.p12 "$WORK"/cert.pem "$WORK"/key.pem "$WORK"/wwdr.* 
( cd "$WORK" && zip -q -X -r pass.pkpass pass.json manifest.json signature ./*.png )
cp "$WORK/pass.pkpass" "$OUT"
echo "Wrote $OUT"
