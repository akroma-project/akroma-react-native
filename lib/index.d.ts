declare enum EthUnits {
    wei = "WEI",
    kwei = "KWEI",
    mwei = "MWEI",
    gwei = "GWEI",
    finney = "FINNEY",
    eth = "ETHER"
}
interface AkromaWallet {
    address: string;
    sendFunds: (toAddress: string, amount: number, units: EthUnits) => {};
}
declare class AkromaRn {
    private url;
    constructor(url?: string);
    sanitizeKeystore: (keystore: string) => string;
    sanitizePassword: (password: string) => string;
    sanitizeUrl: (url: string | any[]) => string | any[];
    /**
     * Takes in a keystore/password, then decrypts the keystore and stores it in memory so we can use it for sending.
     * Adds 'sendFunds' method to wallet....
     * @param {string} keystore
     * @param {string} password
     * @returns {AkaWallet} Wallet object with send method
     */
    loadWallet(keystore: string, password: string): Promise<AkromaWallet>;
    /**
     * Create a new keystore
     * @param {string} password
     * @returns {Promise<string>} JSON format keystore
     */
    createKeystore(password: string): Promise<string>;
    validateKeystoreCreds(keystore: String, password: String): Promise<Boolean>;
}
export { AkromaRn };
