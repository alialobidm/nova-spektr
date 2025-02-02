import { type ApiPromise } from '@polkadot/api';
import { combine, createEvent, restore, sample } from 'effector';
import { once } from 'patronum';

import { type ChainId, type HexString } from '@shared/core';
import { networkModel } from '@entities/network';
import { walletModel, walletUtils } from '@entities/wallet';
import { type SigningPayload } from '../lib/types';

// TODO: Use it for signing
type Input = {
  signingPayloads: SigningPayload[];
};

export type SignatureData = {
  signatures: HexString[];
  txPayloads: Uint8Array[];
};

const formInitiated = createEvent<Input>();
const dataReceived = createEvent<SignatureData>();
const formSubmitted = createEvent<SignatureData>();

const $signStore = restore<Input>(formInitiated, null);

const $apis = combine(
  {
    apis: networkModel.$apis,
    store: $signStore,
  },
  ({ apis, store }) => {
    if (!store) return {};

    return store.signingPayloads.reduce<Record<ChainId, ApiPromise>>((acc, payload) => {
      const chainId = payload.chain.chainId;
      const api = apis[chainId];

      if (!api) return acc;

      return {
        ...acc,
        [chainId]: api,
      };
    }, {});
  },
);

const $signerWallet = combine(
  {
    store: $signStore,
    wallets: walletModel.$wallets,
  },
  ({ store, wallets }) => {
    if (!store) return undefined;

    return walletUtils.getWalletById(
      wallets,
      (store.signingPayloads[0].signatory || store.signingPayloads[0].account).walletId,
    );
  },
  { skipVoid: false },
);

sample({
  clock: once({ source: dataReceived, reset: formInitiated }),
  target: formSubmitted,
});

export const signModel = {
  $signStore,
  $apis,
  $signerWallet,

  events: {
    formInitiated,
    dataReceived,
  },
  output: {
    formSubmitted,
  },
};
