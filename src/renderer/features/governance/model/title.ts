import { combine, createStore, sample } from 'effector';
import isEmpty from 'lodash/isEmpty';

import { type GovernanceApi } from '@shared/api/governance';
import { type Chain, type ChainId, type ReferendumId } from '@shared/core';
import { nonNullable } from '@shared/lib/utils';
import { governanceModel } from '@entities/governance';
import { createChunksEffect } from '../utils/createChunksEffect';

import { networkSelectorModel } from './networkSelector';

const $titles = createStore<Record<ChainId, Record<ReferendumId, string>>>({});

const $referendumTitles = combine(
  {
    titles: $titles,
    chain: networkSelectorModel.$governanceChain,
  },
  ({ titles, chain }) => (chain ? (titles[chain.chainId] ?? {}) : {}),
);

const $loading = createStore<Record<ChainId, true>>({});
const $loaded = createStore<Record<ChainId, true>>({});

type TitlesRequestParams = {
  chain: Chain;
  service: GovernanceApi;
};

type TitlesResponse = Record<ReferendumId, string>;

const {
  request: requestReferendumTitles,
  received: receiveReferendumTitles,
  $pending: $isTitlesLoading,
  done: requestReferendumTitlesDone,
} = createChunksEffect<TitlesRequestParams, TitlesResponse>(({ chain, service }, fn) => {
  return service.getReferendumList(chain, fn);
});

sample({
  clock: networkSelectorModel.$governanceChainApi,
  source: {
    chain: networkSelectorModel.$governanceChain,
    governanceApi: governanceModel.$governanceApi,
    loading: $loading,
    loaded: $loaded,
  },
  filter: ({ chain, governanceApi, loading, loaded }, referendums) => {
    return (
      nonNullable(chain) &&
      nonNullable(governanceApi) &&
      !isEmpty(referendums) &&
      (!(chain.chainId in loading) || !(chain.chainId in loaded))
    );
  },
  fn: ({ chain, governanceApi }) => ({
    chain: chain!,
    service: governanceApi!.service,
  }),
  target: requestReferendumTitles,
});

sample({
  clock: requestReferendumTitles,
  source: $loading,
  filter: (loading, { chain }) => !(chain.chainId in loading),
  fn: (loading, { chain }) => {
    return { ...loading, [chain.chainId]: true };
  },
  target: $loading,
});

sample({
  clock: receiveReferendumTitles,
  source: $titles,
  fn: (referendumsDetails, { params, result }) => {
    const { [params.chain.chainId]: chainToUpdate, ...rest } = referendumsDetails;

    return { ...rest, [params.chain.chainId]: { ...chainToUpdate, ...result } };
  },
  target: $titles,
});

sample({
  clock: requestReferendumTitlesDone,
  source: $loaded,
  filter: (loaded, { params }) => !(params.chain.chainId in loaded),
  fn: (titles, { params }) => {
    return { ...titles, [params.chain.chainId]: true };
  },
  target: $loaded,
});

sample({
  clock: requestReferendumTitlesDone,
  source: $loading,
  fn: (loading, { params }) => {
    return { ...loading, [params.chain.chainId]: false };
  },
  target: $loading,
});

export const titleModel = {
  $titles,
  $referendumTitles,
  $isTitlesLoading,
  $loadingTitles: $loading,
  $loadedTitles: $loaded,
};
