import { createEffect, createEvent, createStore, sample } from 'effector';
import { once } from 'patronum';

import { Account, Balance, Chain, ChainId, AssetByChains, Wallet } from '@shared/core';
import { networkModel, networkUtils } from '@entities/network';
import { accountUtils, walletModel, walletUtils } from '@entities/wallet';
import { AssetsListView } from '@entities/asset';
import { balanceModel } from '@entities/balance';
import { tokensService } from '../lib/tokensService';

const activeViewSet = createEvent<AssetsListView>();
const accountsSet = createEvent<Account[]>();
const hideZeroBalancesSet = createEvent<boolean>();

const $activeView = createStore<AssetsListView | null>(null);
const $accounts = createStore<Account[]>([]);
const $hideZeroBalances = createStore<boolean>(false);
const $tokens = createStore<AssetByChains[]>([]);
const $activeTokens = createStore<AssetByChains[]>([]);

type UpdateTokenParams = {
  activeWallet?: Wallet;
  chains: Record<ChainId, Chain>;
};

const updateTokensFx = createEffect(({ activeWallet, chains }: UpdateTokenParams): AssetByChains[] => {
  const tokens = tokensService.getTokensData();

  return tokens.reduce((acc, token) => {
    const filteredChains = token.chains.filter((chain) => {
      return activeWallet?.accounts.some((account) => {
        return (
          accountUtils.isNonBaseVaultAccount(account, activeWallet) &&
          accountUtils.isChainAndCryptoMatch(account, chains[chain.chainId])
        );
      });
    });

    if (filteredChains.length > 0) {
      acc.push({ ...token, chains: filteredChains });
    }

    return acc;
  }, [] as AssetByChains[]);
});

type PopulateBalanceParams = {
  activeTokens: AssetByChains[];
  balances: Balance[];
  accounts: Account[];
  hideZeroBalances: boolean;
};

const populateTokensBalanceFx = createEffect(
  ({ activeTokens, balances, accounts, hideZeroBalances }: PopulateBalanceParams): AssetByChains[] => {
    return activeTokens.reduce((acc, token) => {
      const [chainsWithBalance, totalBalance] = tokensService.getChainWithBalance(
        balances,
        token.chains,
        hideZeroBalances,
        accounts,
      );

      if (chainsWithBalance.length > 0) {
        acc.push({ ...token, chains: chainsWithBalance, totalBalance });
      }

      return acc;
    }, [] as AssetByChains[]);
  },
);

sample({
  clock: activeViewSet,
  target: $activeView,
});

sample({
  clock: accountsSet,
  target: $accounts,
});
sample({
  clock: hideZeroBalancesSet,
  target: $hideZeroBalances,
});

sample({
  clock: [walletModel.$activeWallet, $activeView, once(networkModel.events.networkStarted)],
  source: {
    activeView: $activeView,
    activeWallet: walletModel.$activeWallet,
    chains: networkModel.$chains,
  },
  filter: ({ activeView, activeWallet }) => {
    return Boolean(activeView === AssetsListView.TOKEN_CENTRIC && activeWallet);
  },
  target: updateTokensFx,
});

sample({
  clock: updateTokensFx.doneData,
  target: $tokens,
});

sample({
  clock: [networkModel.$connections, $tokens, $hideZeroBalances],
  source: {
    activeView: $activeView,
    activeWallet: walletModel.$activeWallet,
    connections: networkModel.$connections,
    chains: networkModel.$chains,
    tokens: $tokens,
  },
  filter: ({ connections, activeWallet, activeView }) => {
    return Boolean(activeView === AssetsListView.TOKEN_CENTRIC && Object.keys(connections).length && activeWallet);
  },
  fn: ({ connections, chains, tokens, activeWallet }): AssetByChains[] => {
    const isMultisigWallet = walletUtils.isMultisig(activeWallet);

    return tokens.reduce((acc, token) => {
      const filteredChains = token.chains.filter((c) => {
        if (!connections[c.chainId]) return false;
        const isDisabled = networkUtils.isDisabledConnection(connections[c.chainId]);
        const hasMultiPallet = networkUtils.isMultisigSupported(chains[c.chainId].options);

        return !isDisabled && (!isMultisigWallet || hasMultiPallet);
      });

      if (filteredChains.length > 0) {
        acc.push({ ...token, chains: filteredChains });
      }

      return acc;
    }, [] as AssetByChains[]);
  },

  target: $activeTokens,
});

sample({
  clock: [balanceModel.$balances, networkModel.$connections, $accounts, $tokens, $hideZeroBalances],
  source: {
    activeView: $activeView,
    activeTokens: $activeTokens,
    accounts: $accounts,
    balances: balanceModel.$balances,
    hideZeroBalances: $hideZeroBalances,
  },
  filter: ({ activeView, balances }) => {
    return Boolean(activeView === AssetsListView.TOKEN_CENTRIC && balances.length > 0);
  },
  target: populateTokensBalanceFx,
});

sample({
  clock: populateTokensBalanceFx.doneData,
  target: $activeTokens,
});

export const portfolioModel = {
  $activeTokens,
  $activeView,
  events: {
    activeViewSet,
    accountsSet,
    hideZeroBalancesSet,
  },
};
