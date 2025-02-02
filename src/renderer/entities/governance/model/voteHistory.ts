import { createEffect, createEvent, createStore, sample } from 'effector';
import { readonly } from 'patronum';

import { type GovernanceApi } from '@/shared/api/governance';
import { type Address, type Chain, type ChainId, type Referendum, type ReferendumId } from '@/shared/core';
import { setNestedValue } from '@/shared/lib/utils';

import { governanceModel } from './governanceApi';

const $voteHistory = createStore<Record<ChainId, Record<ReferendumId, Address[]>>>({});

const requestVoteHistory = createEvent<{ chain: Chain; referendum: Referendum }>();

type RequestVoteHistoryParams = {
  service: GovernanceApi;
  chain: Chain;
  referendum: Referendum;
};

const requestVoteHistoryFx = createEffect(({ chain, referendum, service }: RequestVoteHistoryParams) => {
  return service.getReferendumVotes(chain, referendum.referendumId, () => {});
});

sample({
  clock: requestVoteHistory,
  source: {
    service: governanceModel.$governanceApi,
  },
  filter: ({ service }) => !!service,
  fn: ({ service }, { chain, referendum }) => ({
    chain,
    referendum,
    service: service!.service,
  }),
  target: requestVoteHistoryFx,
});

sample({
  clock: requestVoteHistoryFx.done,
  source: $voteHistory,
  fn: (history, { params, result }) => {
    return setNestedValue(history, params.chain.chainId, params.referendum.referendumId, result);
  },
  target: $voteHistory,
});

export const voteHistoryModel = {
  $voteHistory: readonly($voteHistory),
  $isLoading: requestVoteHistoryFx.pending,

  events: {
    requestVoteHistory,
    voteHistoryRequestDone: requestVoteHistoryFx.done,
  },
};
