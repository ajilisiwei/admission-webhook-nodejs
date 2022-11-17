#!/bin/bash
CN1=${1}
CN2=${2}

openssl genrsa -out ca.key 2048
openssl req -x509 -new -nodes -key ca.key -subj "/CN=$CN1" -days 5000 -out ca.crt
# macos: /System/Library/OpenSSL/openssl.cnf
# linux: /etc/pki/tls/openssl.cnf
openssl req -new -sha256 \
    -key ca.key \
    -subj "/C=CN/ST=Beijing/L=Beijing/O=UnitedStack/OU=Devops/CN=$CN1" \
    -reqexts SAN \
    -config <(cat /System/Library/OpenSSL/openssl.cnf \
        <(printf "[SAN]\nsubjectAltName=DNS:$CN1,DNS:$CN2")) \
    -out server.csr  

openssl x509 -req -days 365000 \
    -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial \
    -extfile <(printf "subjectAltName=DNS:$CN1,DNS:$CN2") \
    -out server.crt
