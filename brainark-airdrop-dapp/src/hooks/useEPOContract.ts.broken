import { useState, useEffect } from 'react';
import { usePublicClient, useWalletClient } from 'wagmi';
import { parseAbi, formatEther } from 'viem';
import { ContractFallbackHandler, FALLBACK_EPO_STATS } from '@/utils/contractFallbacks';

interface EPOContractStats {
  totalSold: string;
  totalRaised: string;
  remainingSupply: string;
  price: string;
  contractBalance: string;
}

interface EPOContractData {
  stats: EPOContractStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// BrainArkEPOComplete contract ABI (enhanced with fallback support)
const EPO_ABI = parseAbi([
  'function getContractStats() view returns (uint256 totalSold, uint256 totalRaised, uint256 remainingSupply, uint256 price, uint256 contractBalance)',
  'function purchaseTokens(address paymentTokenAddress, uint256 paymentAmount) payable',
  'function owner() view returns (address)',
  'function currentPrice() view returns (uint256)',
  'function totalBakSold() view returns (uint256)',
  'function TOTAL_BAK_FOR_SALE() view returns (uint256)',
  'function initialized() view returns (bool)',
  'function paused() view returns (bool)'
]);

export const useEPOContract = (contractAddress?: string) => {
  const [data, setData] = useState<EPOContractData>({
    stats: null,
    isLoading: true,
    error: null,
    refetch: async () => {}
  });

  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  // Use environment variable or provided address
  const epoAddress = (contractAddress || process.env.NEXT_PUBLIC_EPO_CONTRACT || '0xdE04886D4e89f48F73c1684f2e610b25D561DD48') as `0x${string}`;

  const fetchContractStats = async () => {
    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));

      // Try API endpoint first (includes fallback)
      const response = await fetch('/api/epo-stats');
      if (response.ok) {
        const { stats } = await response.json();
        setData(prev => ({ 
          ...prev, 
          stats: {
            totalSold: stats.totalSold,
            totalRaised: stats.totalRaised,
            remainingSupply: stats.remainingSupply,
            price: stats.currentPrice,
            contractBalance: stats.contractBalance
          },
          isLoading: false,
          error: stats.contractFound ? null : 'Using simulated data - contract connection failed'
        }));
        return;
      }

      // Fallback to direct contract call with error handling
      if (!publicClient) {
        console.warn('No public client available, using fallback stats');
        setData(prev => ({ 
          ...prev, 
          stats: FALLBACK_EPO_STATS,
          isLoading: false,
          error: 'No wallet connection - using fallback data'
        }));
        return;
      }

      // Use enhanced fallback handler for contract stats
      const fallbackStats = await ContractFallbackHandler.getEPOStatsWithFallback(
        publicClient,
        epoAddress
      );
      
      setData(prev => ({ 
        ...prev, 
        stats: {
          totalSold: fallbackStats.totalSold,
          totalRaised: fallbackStats.totalRaised,
          remainingSupply: fallbackStats.remainingSupply,
          price: fallbackStats.currentPrice,
          contractBalance: fallbackStats.contractBalance
        },
        isLoading: false,
        error: fallbackStats.isInitialized ? null : 'Contract not fully initialized - using safe fallback data'
      }));

        // Fallback: try individual function calls
        try {
          const [currentPrice, totalBakSold, totalSupply, balance] = await Promise.all([
            publicClient.readContract({
              address: epoAddress,
              abi: EPO_ABI,
              functionName: 'currentPrice',
            }).catch(() => BigInt(20000000000000000)), // Default $0.02

            publicClient.readContract({
              address: epoAddress,
              abi: EPO_ABI,
              functionName: 'totalBakSold',
            }).catch(() => BigInt(0)),

            publicClient.readContract({
              address: epoAddress,
              abi: EPO_ABI,
              functionName: 'TOTAL_BAK_FOR_SALE',
            }).catch(() => BigInt(100000000000000000000000000)), // 100M BAK

            publicClient.getBalance({ address: epoAddress }),
          ]);

          const remainingSupply = totalSupply - totalBakSold;

          const stats: EPOContractStats = {
            totalSold: formatEther(totalBakSold),
            totalRaised: '0', // Can't calculate without payment history
            remainingSupply: formatEther(remainingSupply),
            price: formatEther(currentPrice),
            contractBalance: formatEther(balance),
          };

          setData(prev => ({ ...prev, stats, isLoading: false, error: null }));

        } catch (fallbackError) {
          console.error('Fallback calls also failed:', fallbackError);
          throw fallbackError;
        }
      }

    } catch (error: any) {
      console.error('Error fetching EPO contract stats:', error);
      setData(prev => ({
        ...prev,
        error: error.message || 'Failed to fetch contract data',
        isLoading: false
      }));
    }
  };

  useEffect(() => {
    fetchContractStats();
  }, [publicClient, epoAddress]);

  // Purchase function for the EPO
  const purchaseBAK = async (paymentAmount: string) => {
    if (!walletClient || !walletClient.account) {
      throw new Error('Wallet not connected');
    }

    try {
      // Convert to BigInt safely by rounding to nearest integer to handle decimals
      const amount = Math.round(parseFloat(paymentAmount));
      
      // For BAK purchases, send directly to contract
      const hash = await walletClient.sendTransaction({
        account: walletClient.account,
        to: epoAddress,
        value: BigInt(amount),
        gas: 200000n,
      });

      return hash;
    } catch (error: any) {
      console.error('Purchase failed:', error);
      throw new Error(error.message || 'Purchase transaction failed');
    }
  };

  return {
    ...data,
    refetch: fetchContractStats,
    purchaseBAK,
    contractAddress: epoAddress,
  };
};

// Hook for Airdrop contract data
export const useAirdropContract = (contractAddress?: string) => {
  const [data, setData] = useState({
    stats: null as any,
    isLoading: true,
    error: null as string | null,
  });

  const publicClient = usePublicClient();
  const airdropAddress = (contractAddress || process.env.NEXT_PUBLIC_AIRDROP_CONTRACT || '0x1Df35D8e45E0192cD3C25B007a5417b2235642E5') as `0x${string}`;

  const AIRDROP_ABI = parseAbi([
    'function getAirdropStats() view returns (uint256 totalParticipants, uint256 totalClaimed, uint256 totalReferralBonuses, uint256 remainingSupply, bool distributionActive, uint256 distributionStartTime)',
    'function canClaim(address user) view returns (bool)',
    'function users(address) view returns (bool hasClaimed, bool twitterFollowed, bool twitterRetweeted, bool telegramJoined, address referrer, uint256 referralCount, uint256 totalEarned, uint256 claimTimestamp)',
  ]);

  const fetchAirdropStats = async () => {
    if (!publicClient) {
      setData(prev => ({ ...prev, error: 'No public client available', isLoading: false }));
      return;
    }

    try {
      setData(prev => ({ ...prev, isLoading: true, error: null }));

      const result = await publicClient.readContract({
        address: airdropAddress,
        abi: AIRDROP_ABI,
        functionName: 'getAirdropStats',
      });

      const [totalParticipants, totalClaimed, totalReferralBonuses, remainingSupply, distributionActive, distributionStartTime] = result as [bigint, bigint, bigint, bigint, boolean, bigint];

      const stats = {
        totalParticipants: totalParticipants.toString(),
        totalClaimed: formatEther(totalClaimed),
        totalReferralBonuses: formatEther(totalReferralBonuses),
        remainingSupply: formatEther(remainingSupply),
        distributionActive,
        distributionStartTime: new Date(Number(distributionStartTime) * 1000),
      };

      setData({ stats, isLoading: false, error: null });

    } catch (error: any) {
      console.error('Error fetching airdrop stats:', error);
      setData(prev => ({
        ...prev,
        error: error.message || 'Failed to fetch airdrop data',
        isLoading: false
      }));
    }
  };

  useEffect(() => {
    fetchAirdropStats();
  }, [publicClient, airdropAddress]);

  return {
    ...data,
    refetch: fetchAirdropStats,
    contractAddress: airdropAddress,
  };
};