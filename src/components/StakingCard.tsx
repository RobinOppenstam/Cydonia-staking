'use client';

import { useState } from 'react';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { parseEther, parseUnits } from 'viem';
import { contractAddresses, stakingABI } from '@/contracts';

interface Token {
  name: string;
  address: string;
  decimals: number;
}

interface StakingCardProps {
  token: Token;
  amount: string;
  lockDuration: number;
  onStakeSuccess: () => void;
}

export default function StakingCard({ token, amount, lockDuration, onStakeSuccess }: StakingCardProps) {
  const [isStaking, setIsStaking] = useState(false);

  // Convert lock duration from days to seconds
  const lockDurationSeconds = lockDuration * 24 * 60 * 60;

  // Parse amount based on token decimals
  const parsedAmount = amount ? 
    (token.decimals === 18 ? parseEther(amount) : parseUnits(amount, token.decimals)) : 0n;

  // Prepare contract write
  const { config } = usePrepareContractWrite({
    address: contractAddresses.stakingContract,
    abi: stakingABI,
    functionName: 'stake',
    args: [token.address as `0x${string}`, parsedAmount, BigInt(lockDurationSeconds)],
    value: token.name === 'ETH' ? parsedAmount : 0n,
    enabled: !!amount && parsedAmount > 0n,
  });

  const { data, write } = useContractWrite(config);

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
    onSuccess() {
      setIsStaking(false);
      onStakeSuccess();
    },
  });

  const handleStake = async () => {
    if (!write || !amount || parsedAmount <= 0n) return;
    
    setIsStaking(true);
    try {
      write();
    } catch (error) {
      console.error('Staking error:', error);
      setIsStaking(false);
    }
  };

  const isButtonDisabled = !amount || parsedAmount <= 0n || isStaking || isLoading;

  return (
    <button
      onClick={handleStake}
      disabled={isButtonDisabled}
      className={`w-full py-4 px-6 rounded-lg font-cyber font-semibold text-lg transition-all duration-300 ${
        isButtonDisabled
          ? 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-60'
          : 'btn-cyber text-white hover:glow-cyan transform hover:scale-105 shadow-lg hover:shadow-cyan-500/25'
      }`}
    >
      {isStaking || isLoading ? (
        <div className="flex items-center justify-center">
          <div className="loading-spinner h-6 w-6 mr-2"></div>
          {isStaking ? 'Preparing...' : 'Staking...'}
        </div>
      ) : (
        <span className="flex items-center justify-center">
          <span>Stake {token.name}</span>
          <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </span>
      )}
    </button>
  );
}