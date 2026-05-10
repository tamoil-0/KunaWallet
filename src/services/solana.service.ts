import {
  clusterApiUrl,
  Connection,
  LAMPORTS_PER_SOL,
  PublicKey,
} from "@solana/web3.js";

type PhantomProvider = {
  isPhantom?: boolean;
  publicKey?: PublicKey;
  connect: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: PublicKey }>;
  disconnect?: () => Promise<void>;
};

declare global {
  interface Window {
    solana?: PhantomProvider;
  }
}

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

export function isValidSolanaAddress(address: string): boolean {
  try {
    const publicKey = new PublicKey(address.trim());
    return PublicKey.isOnCurve(publicKey.toBytes());
  } catch {
    return false;
  }
}

export function getSolanaExplorerUrl(address: string): string {
  return `https://explorer.solana.com/address/${address}?cluster=devnet`;
}

export async function getDevnetSolBalance(address: string): Promise<number> {
  const publicKey = new PublicKey(address.trim());
  const lamports = await connection.getBalance(publicKey);
  return lamports / LAMPORTS_PER_SOL;
}

export async function connectPhantomWallet(): Promise<string> {
  const provider = window.solana;
  if (!provider?.isPhantom) {
    throw new Error("Phantom no esta instalado en este navegador");
  }
  const response = await provider.connect();
  return response.publicKey.toBase58();
}

export function hasPhantomWallet(): boolean {
  return Boolean(window.solana?.isPhantom);
}
