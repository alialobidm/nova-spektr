import { type ApiPromise } from '@polkadot/api';
import { BN, BN_ZERO } from '@polkadot/util';
import { combine, createEvent, createStore, sample } from 'effector';
import { readonly } from 'patronum';

import { type Address, type TrackId } from '@shared/core';
import { nonNullable } from '@shared/lib/utils';
import { createSubscriber, governanceSubscribeService } from '@/entities/governance';
import { accountUtils, walletModel } from '@entities/wallet';

import { networkSelectorModel } from './networkSelector';

const subscribeLocks = createEvent();

const $trackLocks = createStore<Record<Address, Record<TrackId, BN>>>({});

const $totalLock = $trackLocks.map((trackLocks) => {
  let maxLockTotal = new BN(0);

  for (const lock of Object.values(trackLocks)) {
    const totalLock = Object.values(lock).reduce<BN>((acc, lock) => BN.max(lock, acc), BN_ZERO);
    maxLockTotal = maxLockTotal.iadd(totalLock);
  }

  return maxLockTotal;
});

const $isLoading = createStore(true);

const $walletAddresses = combine(walletModel.$activeWallet, networkSelectorModel.$governanceChain, (wallet, chain) => {
  if (!wallet || !chain) return [];

  return accountUtils.getAddressesForWallet(wallet, chain);
});

type SubscribeParams = {
  api: ApiPromise;
  addresses: Address[];
};

const {
  subscribe,
  received: receiveLocks,
  unsubscribe: unsubscribeLocks,
} = createSubscriber<SubscribeParams, Record<Address, Record<TrackId, BN>>>(({ api, addresses }, cb) => {
  return governanceSubscribeService.subscribeTrackLocks(api, addresses, (locks) => {
    if (locks) cb(locks);
  });
});

sample({
  clock: [networkSelectorModel.$governanceChain, networkSelectorModel.$governanceChainApi, $walletAddresses],
  target: subscribeLocks,
});

sample({
  clock: subscribeLocks,
  source: {
    api: networkSelectorModel.$governanceChainApi,
    addresses: $walletAddresses,
  },
  filter: ({ api }) => nonNullable(api),
  fn: ({ api, addresses }) => ({ api: api!, addresses }),
  target: subscribe,
});

sample({
  clock: subscribeLocks,
  fn: () => true,
  target: $isLoading,
});

sample({
  clock: receiveLocks,
  fn: () => false,
  target: $isLoading,
});

sample({
  clock: receiveLocks,
  fn: ({ result }) => result,
  target: $trackLocks,
});

export const locksModel = {
  $isLoading: readonly($isLoading),
  $totalLock: readonly($totalLock),
  $trackLocks: readonly($trackLocks),
  events: {
    subscribeLocks,
    unsubscribeLocks,
  },
};
