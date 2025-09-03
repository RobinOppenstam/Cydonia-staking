'use client';

import { useState, useEffect } from 'react';
import { useAccount, useBalance, useContractRead } from 'wagmi';
import { parseEther, formatEther, parseUnits, formatUnits } from 'viem';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import StakingCard from '@/components/StakingCard';
import StatsCard from '@/components/StatsCard';
import ActiveStakes from '@/components/ActiveStakes';
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

interface ContractStats {
  totalRewardPool: bigint;
  totalDistributed: bigint;
  remainingRewards: bigint;
  totalETHStaked: bigint;
  totalCydoniaStaked: bigint;
  totalUSDTStaked: bigint;
  totalUSDCStaked: bigint;
}

const SUPPORTED_TOKENS = [
  { name: 'ETH', address: '0x0000000000000000000000000000000000000000', decimals: 18 },
  { name: 'Cydonia', address: contractAddresses.cydoniaToken, decimals: 18 },
  { name: 'USDT', address: contractAddresses.usdtToken, decimals: 6 },
  { name: 'USDC', address: contractAddresses.usdcToken, decimals: 6 },
];

export default function Home() {
  const { address, isConnected } = useAccount();
  const [userStakes, setUserStakes] = useState<StakeInfo[]>([]);
  const [contractStats, setContractStats] = useState<ContractStats | null>(null);
  const [selectedToken, setSelectedToken] = useState(SUPPORTED_TOKENS[0]);
  const [stakeAmount, setStakeAmount] = useState('');
  const [lockDuration, setLockDuration] = useState('28'); // 4 weeks in days

  // Contract reads
  const { data: stakesData } = useContractRead({
    address: contractAddresses.stakingContract,
    abi: stakingABI,
    functionName: 'getUserStakes',
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  const { data: statsData } = useContractRead({
    address: contractAddresses.stakingContract,
    abi: stakingABI,
    functionName: 'getContractStats',
    enabled: true,
  });

  const { data: cydoniaBalance } = useBalance({
    address: address,
    token: contractAddresses.cydoniaToken,
    enabled: !!address,
  });

  const { data: ethBalance } = useBalance({
    address: address,
    enabled: !!address,
  });

  const { data: usdtBalance } = useBalance({
    address: address,
    token: contractAddresses.usdtToken,
    enabled: !!address,
  });

  const { data: usdcBalance } = useBalance({
    address: address,
    token: contractAddresses.usdcToken,
    enabled: !!address,
  });

  // Update user stakes
  useEffect(() => {
    if (stakesData) {
      setUserStakes(stakesData as StakeInfo[]);
    }
  }, [stakesData]);

  // Update contract stats
  useEffect(() => {
    if (statsData) {
      const [
        totalRewardPool,
        totalDistributed,
        remainingRewards,
        totalETHStaked,
        totalCydoniaStaked,
        totalUSDTStaked,
        totalUSDCStaked,
      ] = statsData as readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint];

      setContractStats({
        totalRewardPool,
        totalDistributed,
        remainingRewards,
        totalETHStaked,
        totalCydoniaStaked,
        totalUSDTStaked,
        totalUSDCStaked,
      });
    }
  }, [statsData]);

  const getUserTokenBalance = () => {
    switch (selectedToken.name) {
      case 'ETH':
        return ethBalance;
      case 'Cydonia':
        return cydoniaBalance;
      case 'USDT':
        return usdtBalance;
      case 'USDC':
        return usdcBalance;
      default:
        return null;
    }
  };

  const formatTokenBalance = (balance: any, decimals: number) => {
    if (!balance) return '0';
    return Number(formatUnits(balance.value, decimals)).toFixed(decimals === 18 ? 4 : 2);
  };

  const handleMaxClick = () => {
    const balance = getUserTokenBalance();
    if (balance) {
      const formatted = formatTokenBalance(balance, selectedToken.decimals);
      setStakeAmount(formatted);
    }
  };

  const calculateAPR = (tokenName: string, durationDays: number) => {
    const baseAPRs = {
      ETH: 8,
      Cydonia: 12,
      USDT: 6,
      USDC: 6,
    };

    const baseAPR = baseAPRs[tokenName as keyof typeof baseAPRs] || 0;
    const minDuration = 28; // 4 weeks
    const maxDuration = 1825; // 5 years
    
    // Linear multiplier from 1x to 2.5x based on duration
    const multiplier = 1 + ((durationDays - minDuration) / (maxDuration - minDuration)) * 1.5;
    
    return (baseAPR * multiplier).toFixed(2);
  };

  const formatDuration = (days: number) => {
    if (days < 7) return `${days} days`;
    if (days < 365) return `${Math.round(days / 7)} weeks`;
    return `${(days / 365).toFixed(1)} years`;
  };

  if (!isConnected) {
    return (
      <div 
        className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/cydonia-backdrop.jpg')`
        }}
      >
        <div className="text-center animate-fade-in">
          <h1 className="text-6xl font-cyber font-bold text-gradient-cyber mb-8 text-glow ">
            CYDONIA PROTOCOL
          </h1>
          <p className="text-xl text-cyan-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Enter the future of DeFi staking. Stake ETH, USDT, USDC, and Cydonia tokens 
            for dynamic rewards in our protocol.
          </p>
          <div className="glass-strong rounded-lg p-6 inline-block border-neon animate-float">
            <ConnectButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('/cydonia-backdrop.jpg')`
      }}
    >
      {/* Header */}
      <div className="glass border-b border-cyan-500/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-cyber font-bold text-gradient-cyber text-glow">
            CYDONIA PROTOCOL
          </h1>
          <ConnectButton />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-up">
          <StatsCard
            title="Total Value Locked"
            value={contractStats ? `$${(
              Number(formatEther(contractStats.totalETHStaked)) * 2000 + // ETH at ~$2000
              Number(formatEther(contractStats.totalCydoniaStaked)) * 0.1 + // CDN at ~$0.1
              Number(formatUnits(contractStats.totalUSDTStaked, 6)) +
              Number(formatUnits(contractStats.totalUSDCStaked, 6))
            ).toLocaleString()}` : '$0'}
            gradient="from-green-400 to-blue-500"
          />
          <StatsCard
            title="Cydonia in Circulation"
            value={contractStats ? `${Number(formatEther(contractStats.totalDistributed)).toLocaleString()} CDN` : '0 CDN'}
            gradient="from-purple-400 to-pink-500"
          />
          <StatsCard
            title="Remaining Rewards"
            value={contractStats ? `${Number(formatEther(contractStats.remainingRewards)).toLocaleString()} CDN` : '0 CDN'}
            gradient="from-cyan-400 to-teal-500"
          />
          <StatsCard
            title="Your CDN Balance"
            value={cydoniaBalance ? `${Number(formatEther(cydoniaBalance.value)).toFixed(2)} CDN` : '0 CDN'}
            gradient="from-orange-400 to-red-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Staking Interface */}
          <div className="card-cyber animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-2xl font-cyber font-bold text-cyan-400 mb-6 text-glow">Stake Tokens</h2>
            
            {/* Token Selection */}
            <div className="mb-6">
              <label className="block text-cyan-300 mb-2 font-medium">Select Token</label>
              <div className="grid grid-cols-2 gap-2">
                {SUPPORTED_TOKENS.map((token) => (
                  <button
                    key={token.address}
                    onClick={() => setSelectedToken(token)}
                    className={`p-3 rounded-lg border transition-all duration-300 font-medium ${
                      selectedToken.address === token.address
                        ? 'border-cyan-400 bg-cyan-400/20 text-cyan-300 glow-cyan'
                        : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-cyan-500 hover:bg-cyan-500/10'
                    }`}
                  >
                    {token.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Input */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-cyan-300 font-medium">
                  Amount to Stake 
                </label>
                <div className="flex items-center space-x-2">
                {getUserTokenBalance() && (
                    <span className="text-gray-400 text-sm">
                      ({formatTokenBalance(getUserTokenBalance(), selectedToken.decimals)} {selectedToken.name})
                    </span>
                )}
                {getUserTokenBalance() && (
                  <button
                    onClick={handleMaxClick}
                    className="px-3 py-1 text-xs bg-cyan-500/20 text-cyan-400 rounded border border-cyan-500/50 hover:bg-cyan-500/30 transition-all duration-200"
                  >
                    MAX
                  </button>
                )}
                </div>
              </div>
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder={`Enter ${selectedToken.name} amount`}
                className="input-cyber"
              />
            </div>

            {/* Lock Duration */}
            <div className="mb-6">
              <label className="block text-cyan-300 mb-2 font-medium">
                Lock Duration: <span className="text-purple-400">{formatDuration(parseInt(lockDuration))}</span>
              </label>
              <input
                type="range"
                min="28"
                max="1825"
                value={lockDuration}
                onChange={(e) => setLockDuration(e.target.value)}
                className="slider-cyber"
              />
              <div className="flex justify-between text-sm text-gray-400 mt-1">
                <span>4 weeks</span>
                <span>5 years</span>
              </div>
            </div>

            {/* APR Display */}
            <div className="mb-6 p-4 glass-strong rounded-lg border-neon-purple">
              <div className="text-center">
                <p className="text-gray-300 mb-1">Estimated APR</p>
                <p className="text-3xl font-cyber font-bold text-gradient-cyber text-glow">
                  {calculateAPR(selectedToken.name, parseInt(lockDuration))}%
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {parseInt(lockDuration) > 28 ? `${((parseInt(lockDuration) - 28) / (1825 - 28) * 150).toFixed(1)}% bonus for longer lock` : 'Minimum lock period'}
                </p>
              </div>
            </div>

            {/* Stake Button */}
            <StakingCard
              token={selectedToken}
              amount={stakeAmount}
              lockDuration={parseInt(lockDuration)}
              onStakeSuccess={() => {
                setStakeAmount('');
                // Refresh data could be added here
              }}
            />
          </div>

          {/* Active Stakes */}
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <ActiveStakes stakes={userStakes} />
          </div>
        </div>

        {/* Protocol Information */}
        <div className="mt-8 card-cyber animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-2xl font-cyber font-bold text-cyan-400 mb-4 text-glow">Protocol Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-2 text-glow">Staking Rewards</h3>
              <ul className="text-gray-300 space-y-1 leading-relaxed">
                <li>• <span className="text-cyan-400">ETH Base APR:</span> 8% (higher with longer locks)</li>
                <li>• <span className="text-purple-400">Cydonia Base APR:</span> 12% (premium rewards)</li>
                <li>• <span className="text-green-400">USDT/USDC Base APR:</span> 6% (stable returns)</li>
                <li>• <span className="text-orange-400">Lock periods:</span> 4 weeks to 5 years</li>
                <li>• <span className="text-pink-400">Longer locks:</span> up to 2.5x APR multiplier</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-2 text-glow">Protocol Details</h3>
              <ul className="text-gray-300 space-y-1 leading-relaxed">
                <li>• <span className="text-cyan-400">Total Supply:</span> 1 Trillion CDN tokens</li>
                <li>• <span className="text-purple-400">Rewards distributed:</span> over 10 years</li>
                <li>• <span className="text-green-400">No early penalties:</span> flexible unstaking</li>
                <li>• <span className="text-orange-400">Claim rewards:</span> anytime during stake</li>
                <li>• <span className="text-pink-400">Built on:</span> Ethereum Sepolia testnet</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}