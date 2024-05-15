import { AssetBalance, ChainId } from '@shared/core';

export type AssetChain = {
  chainId: ChainId;
  name: string;
  assetId: number;
  assetSymbol: string;
  balance?: AssetBalance;
};
