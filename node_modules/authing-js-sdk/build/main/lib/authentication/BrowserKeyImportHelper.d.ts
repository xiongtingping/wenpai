declare function importECDHES(pem: string): Promise<CryptoKey>;
declare function importRSAOAEP(pem: string): Promise<CryptoKey>;
declare function importHS256(key: string): Promise<CryptoKey>;
declare function importAESKW(key: string): Promise<CryptoKey>;
export { importECDHES, importRSAOAEP, importHS256, importAESKW };
