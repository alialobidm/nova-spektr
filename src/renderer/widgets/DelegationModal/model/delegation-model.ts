import { BN } from '@polkadot/util';
import { combine, createEvent, restore, sample } from 'effector';
import { groupBy, sortBy } from 'lodash';
import { readonly } from 'patronum';

import { type DelegateAccount } from '@/shared/api/governance';
import { type Address } from '@/shared/core';
import { Step, includesMultiple, toAccountId, toAddress, validateAddress } from '@/shared/lib/utils';
import { votingService } from '@/entities/governance';
import { walletModel } from '@/entities/wallet';
import {
  delegateRegistryAggregate,
  delegationAggregate,
  networkSelectorModel,
  votingAggregate,
} from '@/features/governance';
import { delegateModel } from '@/widgets/DelegateModal/model/delegate-model';
import { DelegationErrors, SortProp, SortType } from '../common/constants';

const flowFinished = createEvent();
const flowStarted = createEvent();
const stepChanged = createEvent<Step>();
const queryChanged = createEvent<string>();
const sortTypeChanged = createEvent<SortType>();
const selectDelegate = createEvent<DelegateAccount>();
const customDelegateChanged = createEvent<Address>();
const openCustomModal = createEvent();
const closeCustomModal = createEvent();
const createCustomDelegate = createEvent();

const $step = restore(stepChanged, Step.NONE);
const $query = restore(queryChanged, '');
const $sortType = restore(sortTypeChanged, null);
const $customDelegate = restore(customDelegateChanged, '').reset(openCustomModal);

const $delegateList = combine(
  {
    list: delegateRegistryAggregate.$delegateRegistry,
    activeVotes: votingAggregate.$activeWalletVotes,
    query: $query,
    sortType: $sortType,
  },
  ({ list, activeVotes, query, sortType }) => {
    const activeDelegationsSet = new Set<Address>();

    for (const voteList of Object.values(activeVotes)) {
      for (const vote of Object.values(voteList)) {
        if (votingService.isDelegating(vote)) {
          activeDelegationsSet.add(vote.target);
        }
      }
    }

    const activeDelegationsList = [...activeDelegationsSet];
    const addresses = new Set(list.map((d) => d.accountId));

    const delegationsList = [
      ...list,
      ...activeDelegationsList.filter((d) => !addresses.has(d)).map((d) => ({ accountId: d }) as DelegateAccount),
    ];

    const delegatedList = activeDelegationsList.length
      ? delegationsList.filter((delegate) => activeDelegationsList.includes(delegate.accountId))
      : delegationsList;

    if (!sortType && !query) {
      const grouped = groupBy(delegatedList, (delegate) => !!delegate.name);

      return [
        ...sortBy(grouped['true'], (delegate) => delegate[SortProp[SortType.DELEGATIONS]] || 0).reverse(),
        ...sortBy(grouped['false'], (delegate) => delegate[SortProp[SortType.DELEGATIONS]] || 0).reverse(),
      ];
    }

    const searched = delegationsList.filter((delegate) =>
      includesMultiple([delegate.accountId, delegate.address, delegate.name, delegate.shortDescription], query),
    );

    const sortProp = SortProp[sortType || SortType.DELEGATIONS];

    return searched.sort((a, b) => (new BN(a[sortProp] || 0).lt(new BN(b[sortProp] || 0)) ? 1 : -1));
  },
);

const $customError = combine(
  {
    delegate: $customDelegate,
    votes: votingAggregate.$activeWalletVotes,
    wallet: walletModel.$activeWallet,
    chain: delegationAggregate.$chain,
  },
  ({ delegate, votes, wallet, chain }): DelegationErrors | undefined => {
    if (!wallet || !chain || !delegate || !validateAddress(delegate)) return DelegationErrors.INVALID_ADDRESS;

    const isSameAccount = wallet.accounts.some((a) => a.accountId === toAccountId(delegate));

    if (isSameAccount) return DelegationErrors.YOUR_ACCOUNT;

    const isAlreadyDelegated = wallet.accounts.some((a) => {
      const address = toAddress(a.accountId, { prefix: chain.addressPrefix });

      return Object.keys(votes[address]).length > 0;
    });

    if (isAlreadyDelegated) return DelegationErrors.ALREADY_DELEGATED;

    return;
  },
);

sample({
  clock: flowStarted,
  source: networkSelectorModel.$governanceChain,
  filter: (chain) => !!chain,
  target: delegateRegistryAggregate.events.requestDelegateRegistry,
});

sample({
  clock: flowStarted,
  fn: () => Step.LIST,
  target: stepChanged,
});

sample({
  clock: flowFinished,
  fn: () => Step.NONE,
  target: stepChanged,
});

sample({
  clock: selectDelegate,
  target: delegateModel.events.flowStarted,
});

sample({
  clock: openCustomModal,
  fn: () => Step.CUSTOM_DELEGATION,
  target: $step,
});

sample({
  clock: closeCustomModal,
  fn: () => Step.LIST,
  target: $step,
});

sample({
  clock: createCustomDelegate,
  source: $customDelegate,
  fn: (delegate) =>
    ({
      accountId: delegate,
      delegators: [],
      delegatorVotes: [],
      delegateVotes: 0,
    }) as DelegateAccount,
  target: delegateModel.events.flowStarted,
});

export const delegationModel = {
  $isListLoading: delegateRegistryAggregate.$isRegistryLoading,
  $delegateList: readonly($delegateList),
  $step: readonly($step),
  $query: readonly($query),
  $sortType: readonly($sortType),
  $customDelegate: readonly($customDelegate),
  $customError: readonly($customError),

  events: {
    flowStarted,
    queryChanged,
    sortTypeChanged,
    sortTypeReset: $sortType.reinit,
    selectDelegate,

    customDelegateChanged,
    openCustomModal,
    closeCustomModal,
    createCustomDelegate,
  },

  output: {
    flowFinished,
  },
};
