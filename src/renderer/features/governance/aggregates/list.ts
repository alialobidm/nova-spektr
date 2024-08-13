import { combine, sample } from 'effector';
import { readonly } from 'patronum';

import { approveThresholdModel, referendumModel, supportThresholdModel, votingService } from '@entities/governance';
import { networkSelectorModel } from '../model/networkSelector';
import { titleModel } from '../model/title';
import { type AggregatedReferendum } from '../types/structs';

import { votingAggregate } from './voting';

const $referendums = combine(
  {
    referendums: referendumModel.$referendums,
    titles: titleModel.$titles,
    approvalThresholds: approveThresholdModel.$approvalThresholds,
    supportThresholds: supportThresholdModel.$supportThresholds,
    chain: networkSelectorModel.$governanceChain,
    voting: votingAggregate.$activeWalletVotes,
  },
  ({ referendums, chain, titles, approvalThresholds, supportThresholds, voting }): AggregatedReferendum[] => {
    if (!chain) {
      return [];
    }

    const referendumsInChain = referendums[chain.chainId] ?? [];
    const titlesInChain = titles[chain.chainId] ?? {};
    const approvalInChain = approvalThresholds[chain.chainId] ?? {};
    const supportInChain = supportThresholds[chain.chainId] ?? {};

    return referendumsInChain.map((referendum) => {
      return {
        ...referendum,
        title: titlesInChain[referendum.referendumId] ?? null,
        approvalThreshold: approvalInChain[referendum.referendumId] ?? null,
        supportThreshold: supportInChain[referendum.referendumId] ?? null,
        isVoted: votingService.isReferendumVoted(referendum.referendumId, voting),
      };
    });
  },
);

sample({
  clock: networkSelectorModel.$governanceChainApi,
  source: {
    chain: networkSelectorModel.$governanceChain,
    referendums: referendumModel.$referendums,
  },
  filter: ({ chain, referendums }, api) => !!api && !!chain && !referendums[chain.chainId]?.length,
  fn: ({ chain }, api) => ({ api: api!, chain: chain! }),
  target: referendumModel.events.requestReferendums,
});

export const listAggregate = {
  $referendums: readonly($referendums),
  $isLoading: referendumModel.$isReferendumsLoading,

  effects: {
    requestReferendumsFx: referendumModel.effects.requestReferendumsFx,
  },

  events: {
    requestDone: referendumModel.events.requestDone,
  },
};