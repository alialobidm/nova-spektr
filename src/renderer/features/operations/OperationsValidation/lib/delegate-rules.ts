import { BN } from '@polkadot/util';
import { type Store } from 'effector';

import { type Account } from '@shared/core';
import { formatAmount } from '@shared/lib/utils';
import {
  type BalanceMap,
  type DelegateFeeStore,
  type NetworkStore,
  type TransferAccountStore,
  type TransferSignatoryFeeStore,
} from '../types/types';

import { balanceValidation, descriptionValidation } from './validation';

export const DelegateRules = {
  account: {
    noProxyFee: (source: Store<TransferAccountStore>) => ({
      name: 'noProxyFee',
      errorText: 'transfer.noSignatoryError',
      source,
      validator: (_a: Account, _f: any, { isProxy, proxyBalance, fee }: TransferAccountStore) => {
        if (!isProxy) return true;

        return balanceValidation.isLteThanBalance(fee, proxyBalance.native);
      },
    }),
  },
  signatory: {
    noSignatorySelected: (source: Store<boolean>) => ({
      name: 'noSignatorySelected',
      errorText: 'transfer.noSignatoryError',
      source,
      validator: (signatory: Account, _: any, isMultisig: boolean) => {
        if (!isMultisig) return true;

        return Object.keys(signatory).length > 0;
      },
    }),
    notEnoughTokens: (source: Store<TransferSignatoryFeeStore>) => ({
      name: 'notEnoughTokens',
      errorText: 'proxy.addProxy.notEnoughMultisigTokens',
      source,
      validator: (_s: any, _f: any, { fee, isMultisig, multisigDeposit, balance }: TransferSignatoryFeeStore) => {
        if (!isMultisig) return true;

        const value = new BN(multisigDeposit).add(new BN(fee));

        return balanceValidation.isLteThanBalance(value, balance);
      },
    }),
  },
  amount: {
    required: {
      name: 'required',
      errorText: 'transfer.requiredAmountError',
      validator: Boolean,
    },

    notZero: {
      name: 'notZero',
      errorText: 'transfer.notZeroAmountError',
      validator: balanceValidation.isNonZeroBalance,
    },

    notEnoughBalance: (
      source: Store<{ network: NetworkStore | null; balance: BalanceMap }>,
      config: { withFormatAmount: boolean } = { withFormatAmount: true },
    ) => ({
      name: 'notEnoughBalance',
      errorText: 'transfer.notEnoughBalanceError',
      source,
      validator: (
        amount: string,
        _: any,
        { network, balance }: { network: NetworkStore | null; balance: BalanceMap },
      ) => {
        if (!network) return false;

        const value = config?.withFormatAmount ? formatAmount(amount, network.asset.precision) : amount;

        return balanceValidation.isLteThanBalance(value, balance.balance);
      },
    }),
    insufficientBalanceForFee: (
      source: Store<DelegateFeeStore>,
      config: { withFormatAmount: boolean } = { withFormatAmount: true },
    ) => ({
      name: 'insufficientBalanceForFee',
      errorText: 'transfer.notEnoughBalanceForFeeError',
      source,
      validator: (amount: string, _: any, { network, balance, fee, isMultisig }: DelegateFeeStore) => {
        if (!network) return false;

        return balanceValidation.insufficientBalanceForFee(
          {
            amount,
            asset: network.asset,
            balance: balance.native,
            fee,
            xcmFee: '0',
            isNative: true,
            isProxy: false,
            isMultisig,
            isXcm: false,
          },
          config,
        );
      },
    }),
  },
  description: {
    maxLength: {
      name: 'maxLength',
      errorText: 'transfer.descriptionLengthError',
      validator: descriptionValidation.isMaxLength,
    },
  },
};
