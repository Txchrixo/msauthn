import fs from 'fs';
import { V4 } from 'paseto';

async function generateKeys() {
  try {
    const keyDirectory = './keys/';
    const privateKeyPath = `${keyDirectory}privateKey.key`;
    const publicKeyPath = `${keyDirectory}publicKey.key`;

    // Check if key files already exist
    if (fs.existsSync(privateKeyPath) && fs.existsSync(publicKeyPath)) {
      console.log('Keys already exist. Skipping key generation.');
      console.log('Private Key (PASERK):', fs.readFileSync(privateKeyPath, 'utf8'));
      console.log('Public Key (PASERK):', fs.readFileSync(publicKeyPath, 'utf8'));
      return;
    }

    // Generate a new PASETO V4 key pair with 'public' mode for asymmetric encryption
    const keys = await V4.generateKey('public', { format: 'paserk' });
    const publicKey = keys.publicKey;
    const privateKey = keys.secretKey;

    if (!fs.existsSync(keyDirectory)) {
      fs.mkdirSync(keyDirectory);
    }

    // Save the private key in PASERK format
    fs.writeFileSync(privateKeyPath, privateKey);

    // Save the public key in PASERK format
    fs.writeFileSync(publicKeyPath, publicKey);

    console.log('Keys have been successfully generated and saved.');
    console.log('Private Key (PASERK):', privateKey); // PASERK formatted private key
    console.log('Public Key (PASERK):', publicKey); // PASERK formatted public key
  } catch (error) {
    console.error('Error during key generation:', error);
  }
}

generateKeys();
