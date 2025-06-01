'use client';

import { useState } from 'react';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction, useContractRead, useAccount } from 'wagmi';
import { formatEther, formatUnits } from 'viem';
import { contractAddresses, stakingABI } from '@/contracts';

interface StakeInfo {
  amount: bigint;
  startTime: bigint;
  lockDuration: bigint;
  lastClaimTime: bigint;
  tokenAddress: string;
  rewardDebt: bigint;
  isActive: boolean;
}

interface ActiveStakesProps {
  stakes: StakeInfo[];
}

const SUPPORTED_TOKENS = [
  { name: 'ETH', address: '0x0000000000000000000000000000000000000000', decimals: 18 },
  { name: 'Cydonia', address: contractAddresses.cydoniaToken, decimals: 18 },
  { name: 'USDT', address: contractAddresses.usdtToken, decimals: 6 },
  { name: 'USDC', address: contractAddresses.usdcToken, decimals: 6 },
];

export default function ActiveStakes({ stakes }: ActiveStakesProps) {
  const [claimingStake, setClaimingStake] = useState<number | null>(null);
  const [unstakingStake, setUnstakingStake] = useState<number | null>(null);
  const { address } = useAccount(); // Add this to get the user's address

  const getTokenInfo = (address: string) => {
    return SUPPORTED_TOKENS.find(token => 
      token.address.toLowerCase() === address.toLowerCase()
    ) || SUPPORTED_TOKENS[0];
  };

  const formatTokenAmount = (amount: bigint, tokenAddress: string) => {
    const token = getTokenInfo(tokenAddress);
    if (token.decimals === 18) {
      return `${Number(formatEther(amount)).toFixed(4)} ${token.name}`;
    } else {
      return `${Number(formatUnits(amount, token.decimals)).toFixed(2)} ${token.name}`;
    }
  };

  const formatTimeRemaining = (startTime: bigint, lockDuration: bigint) => {
    const now = Math.floor(Date.now() / 1000);
    const endTime = Number(startTime) + Number(lockDuration);
    const remaining = endTime - now;
    
    if (remaining <= 0) return 'Unlocked';
    
    const days = Math.floor(remaining / (24 * 60 * 60));
    const hours = Math.floor((remaining % (24 * 60 * 60)) / (60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const isUnlocked = (startTime: bigint, lockDuration: bigint) => {
    const now = Math.floor(Date.now() / 1000);
    const endTime = Number(startTime) + Number(lockDuration);
    return now >= endTime;
  };

  const StakeCard = ({ stake, index }: { stake: StakeInfo; index: number }) => {
    const token = getTokenInfo(stake.tokenAddress);
    const unlocked = isUnlocked(stake.startTime, stake.lockDuration);
    
    // Get pending rewards for this stake
    const { data: pendingRewards } = useContractRead({
      address: contractAddresses.stakingContract,
      abi: stakingABI,
      functionName: 'pendingRewards',
      args: address ? [address, BigInt(index)] : undefined,
      enabled: stake.isActive && !!address,
    });

    // Claim rewards preparation
    const { config: claimConfig } = usePrepareContractWrite({
      address: contractAddresses.stakingContract,
      abi: stakingABI,
      functionName: 'claimRewards',
      args: [BigInt(index)],
      enabled: stake.isActive && !!pendingRewards && pendingRewards > 0n,
    });

    const { data: claimData, write: claimWrite } = useContractWrite(claimConfig);
    const { isLoading: isClaimLoading } = useWaitForTransaction({
      hash: claimData?.hash,
      onSuccess() {
        setClaimingStake(null);
      },
    });

    // Unstake preparation
    const { config: unstakeConfig } = usePrepareContractWrite({
      address: contractAddresses.stakingContract,
      abi: stakingABI,
      functionName: 'unstake',
      args: [BigInt(index)],
      enabled: stake.isActive && unlocked,
    });

    const { data: unstakeData, write: unstakeWrite } = useContractWrite(unstakeConfig);
    const { isLoading: isUnstakeLoading } = useWaitForTransaction({
      hash: unstakeData?.hash,
      onSuccess() {
        setUnstakingStake(null);
      },
    });

    const handleClaim = () => {
      if (!claimWrite) return;
      setClaimingStake(index);
      claimWrite();
    };

    const handleUnstake = () => {
      if (!unstakeWrite) return;
      setUnstakingStake(index);
      unstakeWrite();
    };

    if (!stake.isActive) return null;

    return (
      <div className="glass border border-gray-700 rounded-lg p-4 hover:border-cyan-500/50 transition-all duration-300 group animate-slide-up">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="text-lg font-cyber font-semibold text-cyan-300 text-glow">{token.name} Stake</h4>
            <p className="text-gray-400 font-mono">{formatTokenAmount(stake.amount, stake.tokenAddress)}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
            unlocked 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30 shadow-lg shadow-green-500/20' 
              : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
          }`}>
            {unlocked ? '✅ Unlocked' : `⏳ ${formatTimeRemaining(stake.startTime, stake.lockDuration)}`}
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Staked:</span>
            <span className="text-white font-mono">{new Date(Number(stake.startTime) * 1000).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Lock Duration:</span>
            <span className="text-white font-mono">{Math.floor(Number(stake.lockDuration) / (24 * 60 * 60))} days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Pending Rewards:</span>
            <span className="text-gradient-cyber font-mono font-semibold">
              {pendingRewards ? `${Number(formatEther(pendingRewards)).toFixed(4)} CDN` : '0 CDN'}
            </span>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={handleClaim}
            disabled={!pendingRewards || pendingRewards <= 0n || isClaimLoading || claimingStake === index}
            className="flex-1 py-2 px-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-500 hover:to-purple-600 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 font-cyber text-sm"
          >
            {claimingStake === index || isClaimLoading ? (
              <div className="flex items-center justify-center">
                <div className="loading-spinner h-4 w-4 mr-1"></div>
                Claiming...
              </div>
            ) : (
              '💎 Claim Rewards'
            )}
          </button>
          
          {unlocked && (
            <button
              onClick={handleUnstake}
              disabled={isUnstakeLoading || unstakingStake === index}
              className="flex-1 py-2 px-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-red-500 hover:to-red-600 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/25 font-cyber text-sm"
            >
              {unstakingStake === index || isUnstakeLoading ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner h-4 w-4 mr-1"></div>
                  Unstaking...
                </div>
              ) : (
                '🔓 Unstake'
              )}
            </button>
          )}
        </div>
        
        {/* Progress bar for lock duration */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Lock Progress</span>
            <span>
              {unlocked 
                ? '100%' 
                : `${Math.min(100, ((Date.now() / 1000 - Number(stake.startTime)) / Number(stake.lockDuration)) * 100).toFixed(1)}%`
              }
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                unlocked 
                  ? 'bg-gradient-to-r from-green-400 to-cyan-400 shadow-lg shadow-green-400/30' 
                  : 'bg-gradient-to-r from-orange-400 to-purple-400'
              }`}
              style={{ 
                width: unlocked 
                  ? '100%' 
                  : `${Math.min(100, ((Date.now() / 1000 - Number(stake.startTime)) / Number(stake.lockDuration)) * 100)}%`
              }}
            />
          </div>
        </div>

        {/* Additional stake details */}
        <div className="mt-3 pt-3 border-t border-gray-700/50">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="text-center">
              <p className="text-gray-500">Last Claim</p>
              <p className="text-cyan-400 font-mono">
                {new Date(Number(stake.lastClaimTime) * 1000).toLocaleDateString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-500">Unlock Date</p>
              <p className="text-purple-400 font-mono">
                {new Date((Number(stake.startTime) + Number(stake.lockDuration)) * 1000).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const activeStakes = stakes.filter(stake => stake.isActive);

  return (
    <div className="card-cyber">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-cyber font-bold text-cyan-400 text-glow">Your Active Stakes</h2>
        <div className="text-sm text-gray-400">
          {activeStakes.length} active position{activeStakes.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      {activeStakes.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 opacity-40">
            <svg className="w-full h-full text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1} 
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <div className="text-gray-400 mb-2 font-medium text-lg">No active stakes</div>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Start your DeFi journey by staking tokens on the left. Your active positions will appear here with real-time rewards tracking.
          </p>
          <div className="mt-4 text-xs text-gray-600">
            💡 Tip: Longer lock periods earn higher APR multipliers up to 2.5x
          </div>
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="mb-6 p-4 glass-strong rounded-lg border border-purple-500/30">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-400">Total Staked</p>
                <p className="text-lg font-cyber font-bold text-cyan-400">
                  {activeStakes.length}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Unlocked</p>
                <p className="text-lg font-cyber font-bold text-green-400">
                  {activeStakes.filter(stake => isUnlocked(stake.startTime, stake.lockDuration)).length}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Locked</p>
                <p className="text-lg font-cyber font-bold text-orange-400">
                  {activeStakes.filter(stake => !isUnlocked(stake.startTime, stake.lockDuration)).length}
                </p>
              </div>
            </div>
          </div>

          {/* Stakes list */}
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {activeStakes.map((stake, index) => (
              <StakeCard key={index} stake={stake} index={index} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}