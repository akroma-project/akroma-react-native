"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EthUnits = exports.AkromaRn = void 0;
const react_native_1 = require("react-native");
const type_check_1 = require("type-check");
const { Web3: RNWeb3 } = react_native_1.NativeModules;
var EthUnits;
(function (EthUnits) {
    EthUnits["wei"] = "WEI";
    EthUnits["kwei"] = "KWEI";
    EthUnits["mwei"] = "MWEI";
    EthUnits["gwei"] = "GWEI";
    EthUnits["finney"] = "FINNEY";
    EthUnits["eth"] = "ETHER";
})(EthUnits || (EthUnits = {}));
exports.EthUnits = EthUnits;
class AkromaRn {
    url;
    constructor(url = "https://boot2.akroma.org") {
        this.url = url;
    }
    sanitizeKeystore = (keystore) => {
        if ((0, type_check_1.typeCheck)("Object", keystore)) {
            return keystore;
        }
        else if ((0, type_check_1.typeCheck)("String", keystore)) {
            return JSON.parse(keystore);
        }
        throw new Error(`Expected Object|String keystore, encountered ${keystore}.`);
    };
    sanitizePassword = (password) => {
        if ((0, type_check_1.typeCheck)("String", password) && password.length > 0) {
            return password;
        }
        throw new Error(`Expected non-null non-empty String password, encountered ${typeof password}.`);
    };
    sanitizeUrl = (url) => {
        if ((0, type_check_1.typeCheck)("String", url) && url.length > 0) {
            return url;
        }
        throw new Error(`Expected non-null, non-empty String, encountered ${url}.`);
    };
    /**
     * Takes in a keystore/password, then decrypts the keystore and stores it in memory so we can use it for sending.
     * Adds 'sendFunds' method to wallet....
     * @param {string} keystore
     * @param {string} password
     * @returns {AkaWallet} Wallet object with send method
     */
    async loadWallet(keystore, password) {
        this.sanitizeKeystore(keystore);
        this.sanitizePassword(password);
        const wallet = await RNWeb3.loadWallet(keystore, password);
        console.debug("AKA: load-wallet: ", wallet);
        const akaWallet = {
            address: wallet.address,
            sendFunds: async (toAddress, amount, units) => {
                console.debug("AKA: send-funds");
                await RNWeb3.sendFunds(wallet, this.url, password, toAddress, amount, units);
            },
        };
        return akaWallet;
    }
    async sendFunds(address, password, to, amount, units) {
        console.debug("AKA: send-funds");
        const transactionHash = await RNWeb3.sendFunds(address, this.url, password, to, amount.toString(), units);
        console.debug("AKA: transaction-hash", transactionHash);
        return transactionHash;
    }
    /**
     * Create a new keystore
     * @param {string} password
     * @returns {Promise<string>} JSON format keystore
     */
    async createKeystore(password) {
        const keystore = await RNWeb3.createKeystore(password);
        console.debug("AKA: create-keystore: ", keystore);
        return keystore;
    }
    async validateKeystoreCreds(keystore, password) {
        try {
            const wallet = await RNWeb3.testWallet(keystore, password);
            console.debug("AKA: load-wallet: ", wallet);
            return true;
        }
        catch (error) {
            console.error("AKA: load-wallet: ", error);
            return false;
        }
    }
}
exports.AkromaRn = AkromaRn;
