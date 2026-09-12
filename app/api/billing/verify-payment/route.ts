import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getChainById } from '@/lib/registry';
import { ethers } from 'ethers';

const PLATFORM_FEE_USD = 0.50;
const PAYMENT_WALLET = process.env.PAYMENT_WALLET!;

async function verifyDeploymentFee(
  txHash: string,
  chainId: string
): Promise<{ valid: boolean; from?: string; amount?: number }> {
  try {
    const chain = getChainById(chainId);
    if (!chain) return { valid: false };

    let apiUrl = '';

    if (chainId === 'bnb') {
      apiUrl = `https://api.bscscan.com/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${process.env.BSCSCAN_API_KEY}`;
    } else if (chainId === 'ethereum') {
      apiUrl = `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${process.env.ETHERSCAN_API_KEY}`;
    } else if (chainId === 'base') {
      apiUrl = `https://api.basescan.org/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${process.env.ETHERSCAN_API_KEY}`;
    } else if (chainId === 'polygon') {
      apiUrl = `https://api.polygonscan.com/api?module=proxy&action=eth_getTransactionByHash&txhash=${txHash}&apikey=${process.env.POLYGONSCAN_API_KEY}`;
    } else {
      const provider = new ethers.JsonRpcProvider(chain.rpc);
      const tx = await provider.getTransaction(txHash);
      if (!tx) return { valid: false };
      const valueInEth = parseFloat(ethers.formatEther(tx.value));
      return {
        valid: tx.to?.toLowerCase() === PAYMENT_WALLET.toLowerCase(),
        from: tx.from,
        amount: valueInEth,
      };
    }

    const response = await fetch(apiUrl);
    const result = await response.json();
    if (!result.result) return { valid: false };

    const tx = result.result;
    const valueInEth = parseFloat(ethers.formatEther(BigInt(tx.value)));
    const toAddress = tx.to?.toLowerCase();

    return {
      valid: toAddress === PAYMENT_WALLET.toLowerCase(),
      from: tx.from,
      amount: valueInEth,
    };
  } catch (error) {
    console.error('Fee verification error:', error);
    return { valid: false };
  }
}

export async function POST(request: NextRequest) {
  try {
    const { txHash, chainId, userEmail, documentId } = await request.json();

    if (!txHash || !chainId || !userEmail) {
      return NextResponse.json(
        { error: 'Transaction hash, chain and email are required' },
        { status: 400 }
      );
    }

    // Check if tx already used
    const { data: existingPayment } = await supabaseAdmin
      .from('payments')
      .select('id')
      .eq('tx_hash', txHash)
      .single();

    if (existingPayment) {
      return NextResponse.json(
        { error: 'This transaction has already been used.' },
        { status: 400 }
      );
    }

    // Verify the fee payment
    const verification = await verifyDeploymentFee(txHash, chainId);

    if (!verification.valid) {
      return NextResponse.json(
        { error: 'Fee payment not verified. Please check your transaction hash and ensure you sent to the correct wallet.' },
        { status: 400 }
      );
    }

    // Record the payment
    await supabaseAdmin.from('payments').insert({
      tx_hash: txHash,
      plan: 'blockchain_deployment',
      payment_method: chainId,
      amount: verification.amount,
      user_email: userEmail,
      from_address: verification.from,
      document_id: documentId || null,
      verified: true,
      fee_usd: PLATFORM_FEE_USD,
    });

       // Send blockchain deployment notification
    try {
      const { sendBlockchainDeploymentEmail } = await import('@/lib/notifications');
      await sendBlockchainDeploymentEmail(
        userEmail,
        userEmail.split('@')[0],
        documentId || 'Your document',
        chainId,
        txHash,
        documentId || 'N/A'
      );
    } catch (notifError) {
      console.error('Deployment notification error:', notifError);
    }

    return NextResponse.json({
      success: true,
      message: `Deployment fee verified. Your document is now being deployed to the blockchain.`,
      txHash,
      chainId,
      feeUsd: PLATFORM_FEE_USD,
    });
  } catch (error) {
    console.error('Fee verify error:', error);
    return NextResponse.json(
      { error: 'Fee verification failed. Please try again.' },
      { status: 500 }
    );
  }
}