import { type AccountId } from '@shared/core';

import {
  type AccountToggleParams,
  type ChainToggleParams,
  type CheckedCounter,
  type RootToggleParams,
  type SelectedStruct,
  type ShardToggleParams,
  type ShardedToggleParams,
} from './types';

export const selectorUtils = {
  getSelectedAll,
  getSelectedRoot,
  getSelectedChain,
  getSelectedSharded,
  getSelectedShard,
  getSelectedAccount,
  isChecked,
  isSemiChecked,
};

function getSelectedAll(struct: SelectedStruct, value: boolean): SelectedStruct {
  return Object.keys(struct).reduce<SelectedStruct>((acc, root) => {
    return getSelectedRoot(acc, { root: Number(root), value });
  }, struct);
}

function getSelectedRoot(struct: SelectedStruct, { root, value }: RootToggleParams): SelectedStruct {
  const { checked: _checked, total, ...chains } = struct[root];
  struct[root].checked = value ? total : 0;

  Object.values(chains).forEach((chains) => {
    const { accounts, sharded } = chains;
    chains.checked = value ? chains.total : 0;

    Object.keys(accounts).forEach((accountId) => {
      accounts[accountId as AccountId] = value;
    });

    Object.values(sharded).forEach((group) => {
      const { total, checked: _checked, ...rest } = group;
      group.checked = value ? total : 0;

      Object.keys(rest).forEach((accountId) => {
        group[accountId as AccountId] = value;
      });
    });
  });

  return { ...struct };
}

function getSelectedChain(struct: SelectedStruct, { root, chainId, value }: ChainToggleParams): SelectedStruct {
  const chain = struct[root][chainId];
  Object.keys(chain.accounts).forEach((accountId) => {
    chain.accounts[accountId as AccountId] = value;
  });

  Object.values(chain.sharded).forEach((group) => {
    const { total, checked: _checked, ...rest } = group;
    group.checked = value ? total : 0;

    Object.keys(rest).forEach((accountId) => {
      group[accountId as AccountId] = value;
    });
  });

  struct[root].checked += value ? chain.total - chain.checked : -1 * chain.checked;
  chain.checked = value ? chain.total : 0;

  return { ...struct };
}

function getSelectedSharded(
  struct: SelectedStruct,
  { root, chainId, groupId, value }: ShardedToggleParams,
): SelectedStruct {
  const shardedGroup = struct[root][chainId].sharded[groupId];

  const { total, checked, ...shards } = shardedGroup;
  Object.keys(shards).forEach((accountId) => {
    shardedGroup[accountId as AccountId] = value;
  });

  const addition = value ? total - checked : -1 * checked;
  struct[root].checked += addition;
  struct[root][chainId].checked += addition;
  shardedGroup.checked = value ? total : 0;

  return { ...struct };
}

function getSelectedShard(
  struct: SelectedStruct,
  { root, chainId, groupId, accountId, value }: ShardToggleParams,
): SelectedStruct {
  const addition = value ? 1 : -1;
  const chain = struct[root][chainId];

  chain.sharded[groupId][accountId] = value;
  chain.sharded[groupId].checked += addition;
  chain.checked += addition;
  struct[root].checked += addition;

  return { ...struct };
}

function getSelectedAccount(
  struct: SelectedStruct,
  { root, chainId, accountId, value }: AccountToggleParams,
): SelectedStruct {
  struct[root][chainId].accounts[accountId] = value;
  struct[root][chainId].checked += value ? 1 : -1;
  struct[root].checked += value ? 1 : -1;

  return { ...struct };
}

function isChecked(counter: CheckedCounter): boolean {
  return counter.checked === counter.total;
}

function isSemiChecked(counter: CheckedCounter): boolean {
  return counter.checked > 0 && counter.checked !== counter.total;
}
