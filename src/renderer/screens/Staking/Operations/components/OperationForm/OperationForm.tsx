import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { useState, useEffect, ReactNode } from 'react';
import { Trans, TFunction } from 'react-i18next';

import { Identicon } from '@renderer/components/ui';
import { Button, AmountInput, InputHint, Combobox, RadioGroup, Input } from '@renderer/components/ui-redesign';
import { useI18n } from '@renderer/context/I18nContext';
import { RewardsDestination } from '@renderer/domain/stake';
import { validateAddress } from '@renderer/shared/utils/address';
import { Asset } from '@renderer/domain/asset';
import { Address, ChainId } from '@renderer/domain/shared-kernel';
import { RadioOption } from '@renderer/components/ui-redesign/RadioGroup/common/types';
import { DropdownOption } from '@renderer/components/ui/Dropdowns/common/types';
import { useAccount } from '@renderer/services/account/accountService';
import { useBalance } from '@renderer/services/balance/balanceService';
import { ComboboxOption } from '@renderer/components/ui-redesign/Dropdowns/common/types';
import { getPayoutAccountOption } from '../../common/utils';

const getDestinations = (t: TFunction): RadioOption<RewardsDestination>[] => {
  const options = [
    { value: RewardsDestination.RESTAKE, title: t('staking.bond.restakeRewards') },
    { value: RewardsDestination.TRANSFERABLE, title: t('staking.bond.transferableRewards') },
  ];

  return options.map((dest, index) => ({
    id: index.toString(),
    value: dest.value,
    title: dest.title,
  }));
};

type FormData<T extends Address | RewardsDestination> = {
  amount: string;
  destination?: T;
  description?: string;
};

type Field = {
  name: string;
  value?: string;
  disabled?: boolean;
};

type Props = {
  chainId: ChainId;
  canSubmit: boolean;
  addressPrefix: number;
  fields: Field[];
  balanceRange?: string | string[];
  asset: Asset;
  children: ((errorType: string) => ReactNode) | ReactNode;
  validateBalance?: (amount: string) => boolean;
  validateFee?: (amount: string) => boolean;
  validateDeposit?: (amount: string) => boolean;
  onAmountChange?: (amount: string) => void;
  onSubmit: (data: FormData<Address>) => void;
};

export const OperationForm = ({
  chainId,
  canSubmit,
  addressPrefix,
  fields,
  balanceRange,
  asset,
  children,
  validateBalance = () => true,
  validateFee = () => true,
  validateDeposit = () => true,
  onAmountChange,
  onSubmit,
}: Props) => {
  const { t } = useI18n();
  const { getLiveAccounts } = useAccount();
  const { getLiveAssetBalances } = useBalance();

  const dbAccounts = getLiveAccounts();
  const destinations = getDestinations(t);

  const [activePayout, setActivePayout] = useState<Address>('');
  const [payoutAccounts, setPayoutAccounts] = useState<ComboboxOption<Address>[]>([]);

  const destAccounts = dbAccounts.filter((a) => !a.chainId || a.chainId === chainId);
  const payoutIds = destAccounts.map((a) => a.accountId);
  const balances = getLiveAssetBalances(payoutIds, chainId, asset.assetId.toString());

  const amountField = fields.find((f) => f.name === 'amount');
  const destinationField = fields.find((f) => f.name === 'destination');
  const descriptionField = fields.find((f) => f.name === 'description');

  const {
    handleSubmit,
    control,
    setValue,
    trigger,
    watch,
    formState: { isValid, errors },
  } = useForm<FormData<RewardsDestination>>({
    mode: 'onChange',
    defaultValues: {
      amount: amountField?.value || '0',
      destination: destinations[0].value,
      description: descriptionField?.value || '',
    },
  });

  const destination = watch('destination');

  useEffect(() => {
    if (!amountField?.value || amountField.value === '') return;

    setValue('amount', amountField.value);
    trigger('amount');
  }, [amountField]);

  useEffect(() => {
    const payoutAccounts = destAccounts.reduce<DropdownOption<Address>[]>((acc, account) => {
      if (!account.chainId || account.chainId === chainId) {
        const balance = balances.find((b) => b.accountId === account.accountId);
        const option = getPayoutAccountOption(account, { asset, addressPrefix, balance });

        acc.push(option);
      }

      return acc;
    }, []);

    setPayoutAccounts(payoutAccounts);
  }, [destAccounts.length, balances]);

  const validateDestination = (): boolean => {
    if (destination === RewardsDestination.RESTAKE) return true;

    return Boolean(activePayout) && validateAddress(activePayout);
  };

  const submitForm: SubmitHandler<FormData<RewardsDestination>> = ({ amount, destination, description }) => {
    const destinationValue = destination === RewardsDestination.TRANSFERABLE ? activePayout : '';

    onSubmit({ amount, description, destination: destinationValue });
  };

  const submitDisabled = !isValid || !canSubmit || !validateDestination();

  const errorType = errors.amount?.type || errors.destination?.type || errors.description?.type || '';

  return (
    <form className="w-full" onSubmit={handleSubmit(submitForm)}>
      <div className="flex flex-col gap-y-5">
        {amountField && (
          <Controller
            name="amount"
            control={control}
            rules={{
              required: true,
              validate: {
                notZero: (v) => Number(v) > 0,
                insufficientBalance: validateBalance,
                insufficientBalanceForFee: validateFee,
                insufficientBalanceForDeposit: validateDeposit,
              },
            }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <>
                <AmountInput
                  name="amount"
                  placeholder={t('staking.bond.amountPlaceholder')}
                  balancePlaceholder={t('staking.bond.availableBalancePlaceholder')}
                  value={value}
                  disabled={amountField.disabled}
                  balance={balanceRange}
                  asset={asset}
                  invalid={Boolean(error)}
                  onChange={(value) => {
                    onAmountChange?.(value);
                    onChange(value);
                  }}
                />
                <InputHint active={error?.type === 'insufficientBalance'} variant="error">
                  {t('staking.notEnoughBalanceError')}
                </InputHint>
                <InputHint active={error?.type === 'insufficientBalanceForFee'} variant="error">
                  {t('staking.notEnoughBalanceForFeeError')}
                </InputHint>
                <InputHint active={error?.type === 'insufficientBalanceForDeposit'} variant="error">
                  {t('staking.notEnoughBalanceForDepositError')}
                </InputHint>
                <InputHint active={error?.type === 'required'} variant="error">
                  {t('staking.requiredAmountError')}
                </InputHint>
                <InputHint active={error?.type === 'notZero'} variant="error">
                  {t('staking.requiredAmountError')}
                </InputHint>
              </>
            )}
          />
        )}

        {destinationField && (
          <Controller
            name="destination"
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <RadioGroup
                label={t('staking.bond.rewardsDestinationLabel')}
                className="col-span-2"
                activeId={destinations.find((d) => d.value === value)?.id}
                options={destinations}
                onChange={(option) => onChange(option.value)}
              >
                <RadioGroup.Option option={destinations[0]} />
                <RadioGroup.Option option={destinations[1]}>
                  <Combobox
                    placeholder={t('staking.bond.payoutAccountPlaceholder')}
                    options={payoutAccounts}
                    disabled={destinationField.disabled}
                    invalid={Boolean(error)}
                    prefixElement={
                      <Identicon className="mr-1" address={activePayout} size={20} background={false} canCopy={false} />
                    }
                    onChange={(option) => setActivePayout(option.value)}
                  />
                  <InputHint className="mt-1" active={!validateDestination()} variant="error">
                    {t('staking.bond.incorrectAddressError')}
                  </InputHint>
                </RadioGroup.Option>
              </RadioGroup>
            )}
          />
        )}

        {descriptionField && (
          <Controller
            name="description"
            control={control}
            rules={{ maxLength: 120 }}
            render={({ field: { onChange, value }, fieldState: { error } }) => (
              <div className="flex flex-col gap-y-2.5">
                <Input
                  label={t('staking.bond.descriptionLabel')}
                  className="w-full"
                  placeholder={t('staking.bond.descriptionPlaceholder')}
                  invalid={Boolean(error)}
                  disabled={descriptionField.disabled}
                  value={value}
                  onChange={onChange}
                />
                <InputHint active={error?.type === 'maxLength'} variant="error">
                  <Trans t={t} i18nKey="transfer.descriptionLengthError" values={{ maxLength: 120 }} />
                </InputHint>
              </div>
            )}
          />
        )}

        {typeof children === 'function' ? children(errorType) : children}
      </div>

      <Button className="w-fit flex-0 mt-7 ml-auto" type="submit" disabled={submitDisabled}>
        {t('staking.bond.continueButton')}
      </Button>
    </form>
  );
};
