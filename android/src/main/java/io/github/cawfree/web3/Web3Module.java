package io.github.cawfree.web3;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;

import org.web3j.crypto.Credentials;
import org.web3j.crypto.CipherException;
import org.web3j.crypto.WalletUtils;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.Transfer;
import org.web3j.utils.Convert;

import org.json.JSONObject;

import java.security.Security;
import java.security.Provider;
import org.bouncycastle.jce.provider.BouncyCastleProvider;

import java.io.File;
import java.io.IOException;
import java.io.FileReader;
import java.io.BufferedReader;
import java.util.Map;
import java.util.HashMap;
import java.math.BigDecimal;
import java.lang.StringBuilder;

// TODO: Remove this!
import android.util.Log;

// Heavily influenced by (thanks guys!):
// https://github.com/web3j/sample-project-gradle/blob/master/src/main/java/org/web3j/sample/Application.java
public final class Web3Module extends ReactContextBaseJavaModule {

  /* Static Declarations */
  public static final String TAG = "Web3Module";

  /** A simple utility method to print via ADB. */
  private static void debug(final String pString) {
    Log.d(TAG, pString);
  }

  /* Member Variables. */
  private Map<String, Credentials> credentialsMap;

  // https://github.com/web3j/web3j/issues/915#issuecomment-483145928
  private static void setupBouncyCastle() {
    final Provider p = Security.getProvider(BouncyCastleProvider.PROVIDER_NAME);
    if (p == null || p.getClass().equals(BouncyCastleProvider.class)) {
      return;
    }
    Security.removeProvider(BouncyCastleProvider.PROVIDER_NAME);
    Security.insertProviderAt(new BouncyCastleProvider(), 1);
  }

  /** Constructor */
  public Web3Module(final ReactApplicationContext pReactApplicationContext) {
    super(pReactApplicationContext);
    // Initialize Member Variables.
    this.credentialsMap = new HashMap<>();
  }

  /** Module name when imported via NativeModules. **/
  @Override public String getName() { return "Web3"; }

  @ReactMethod
  public final void createKeystore(final String pPassword, final Promise pPromise) {
    try {
      // Setup Bouncy Castle.
      Web3Module.setupBouncyCastle();
      // Fetch the cache directory.
      final File dir = this.getReactApplicationContext().getCacheDir();
      // Generate the new Wallet.
      final String name = WalletUtils.generateNewWalletFile(pPassword, dir);
      final File f = new File(dir.getAbsolutePath() + File.separator + name);
      // Parse the Keystore into a JSONObject.
      final JSONObject ks = new JSONObject(Web3Module.readFile(f));
      // Delete the temporary file.
      f.delete();
      // Propagate the keystore back to the caller.
      pPromise.resolve(Arguments.fromBundle(new BundleJSONConverter().convertToBundle(ks)));
    }
    catch (final Exception pException) {
      pPromise.reject(pException);
    }
    return;
  }


  @ReactMethod
  public void testWallet(String keystore, String password, Promise promise) {
    try {
      Credentials credentials = WalletUtils.loadJsonCredentials(password, keystore);
      String address = credentials.getAddress();

      WritableMap response = Arguments.createMap();
      response.putString("address", address);
      promise.resolve(response);
    }
    catch (Exception e) {
      promise.reject(e);
    }
    return;
  }

  @ReactMethod
  public final void loadWallet(String keystore, String password, Promise promise) {
    try {
      String address = this.addWallet(keystore, password);
      WritableMap args = Arguments.createMap();
      args.putString("address", address);
      promise.resolve(args);
    }
    catch (final Exception pException) {
      promise.reject(pException);
    }
  }

  @ReactMethod
  public final void sendFunds(final ReadableMap pWallet, final String pUrl, final String pPassword, final String pToAddress, final String pAmount, final String pUnits, final Promise pPromise) {
    try {
      // Fetch the Credentials.
      final Credentials c = this.getWallets().get(pWallet.getString("address"));
      if (c != null) {
        // XXX: Allocate the HttpService we'll use for this transaction.
        // TODO: Does this need to be destroyed? Is it worth caching?
        final Web3j web3j = Web3j.build(new HttpService(pUrl));
        final TransactionReceipt tr = Transfer.sendFunds(
          web3j,
          c,
          pToAddress,
          new BigDecimal(pAmount),
          Convert.Unit.valueOf(pUnits)
        )
        .send();
        // Declare the callback parameters.
        final WritableMap args = Arguments.createMap();
        // Buffer the hash for the transaction.
        args.putString("transactionHash", tr.getTransactionHash());
        // Propagate the arguments to the caller.
        pPromise.resolve(args);
        return;
      }
      throw new IllegalStateException("No credentials found!");
    }
    catch (final Exception pException) {
      pPromise.reject(pException);
    }
    return;
  }

  /** Reads the string contents of a File. **/
  private static String readFile(final File pFile) throws IOException {
    final StringBuilder sb = new StringBuilder();
    final BufferedReader br = new BufferedReader(new FileReader(pFile));
    String s;
    while ((s = br.readLine()) != null) {
      sb.append(s);
      sb.append('\n');
    }
    br.close();
    return sb.toString();
  }


  /** Adds a Wallet to the in-memory map. */
  private String addWallet(String keystore, String password) throws IOException, CipherException {
    Credentials credentials = WalletUtils.loadJsonCredentials(password, keystore);
    String address = credentials.getAddress();
    this.getWallets().put(address, credentials);
    return address;
  }

  private Map<String, Credentials> getWallets() {
    return this.credentialsMap;
  }
  
}
