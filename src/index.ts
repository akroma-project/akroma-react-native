import { NativeModules } from "react-native";
import { typeCheck } from "type-check";

const { Web3: RNWeb3 } = NativeModules;

enum EthUnits {
  wei = "WEI",
  kwei = "KWEI",
  mwei = "MWEI",
  gwei = "GWEI",
  finney = "FINNEY",
  eth = "ETHER",
}

interface AkromaWallet {
  address: string;
  sendFunds: (toAddress: string, amount: number, units: EthUnits) => {};
}

class AkromaRn {
  constructor(private url: string = "https://boot2.akroma.org"){}

  public sanitizeKeystore = (keystore: string): string => {
    if (typeCheck("Object", keystore)) {
      return keystore;
    } else if (typeCheck("String", keystore)) {
      return JSON.parse(keystore);
    }
    throw new Error(
      `Expected Object|String keystore, encountered ${keystore}.`
    );
  };

  public sanitizePassword = (password: string) => {
    if (typeCheck("String", password) && password.length > 0) {
      return password;
    }
    throw new Error(
      `Expected non-null non-empty String password, encountered ${typeof password}.`
    );
  };

  public sanitizeUrl = (url: string | any[]) => {
    if (typeCheck("String", url) && url.length > 0) {
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
  public async loadWallet(
    keystore: string,
    password: string
  ): Promise<AkromaWallet> {
    this.sanitizeKeystore(keystore);
    this.sanitizePassword(password);
    const wallet: any = await RNWeb3.loadWallet(keystore, password);
    console.debug("AKA: load-wallet: ", wallet);
    const akaWallet: AkromaWallet = {
      address: wallet.address,
      sendFunds: async (toAddress: string, amount: number, units: EthUnits) => {
        console.debug("AKA: send-funds");
        await RNWeb3.sendFunds(
          wallet,
          this.url,
          password,
          toAddress,
          amount,
          units
        );
      },
    };
    return akaWallet;
  }

  /**
   * Create a new keystore
   * @param {string} password
   * @returns {Promise<string>} JSON format keystore
   */
  public async createKeystore(password: string): Promise<string> {
    const keystore = await RNWeb3.createKeystore(password);
    console.debug("AKA: create-keystore: ", keystore);
    return keystore;
  }

  public async validateKeystoreCreds(
    keystore: String,
    password: String
  ): Promise<Boolean> {
    try {
      const wallet: String = await RNWeb3.testWallet(keystore, password);
      console.debug("AKA: load-wallet: ", wallet);
      return true;
    } catch (error) {
      console.error("AKA: load-wallet: ", error);
      return false;
    }
  }
}

export { AkromaRn };
