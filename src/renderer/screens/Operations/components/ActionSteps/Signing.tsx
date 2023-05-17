import { useEffect, useState } from 'react';
import { BN } from '@polkadot/util';
import { ApiPromise } from '@polkadot/api';

import { useI18n } from '@renderer/context/I18nContext';
import { Button } from '@renderer/components/ui';
import ParitySignerSignatureReader from '@renderer/screens/Signing/ParitySignerSignatureReader/ParitySignerSignatureReader';
import { ValidationErrors } from '@renderer/shared/utils/validation';
import { toAccountId } from '@renderer/shared/utils/address';
import { transferableAmount } from '@renderer/shared/utils/balance';
import { Transaction } from '@renderer/domain/transaction';
import { useBalance } from '@renderer/services/balance/balanceService';
import { ChainId, HexString } from '@renderer/domain/shared-kernel';
import { useTransaction } from '@renderer/services/transaction/transactionService';
import { Balance } from '@renderer/domain/balance';

type Props = {
  api: ApiPromise;
  chainId: ChainId;
  transaction: Transaction;
  assetId: string;
  countdown: number;
  onQrExpired: () => void;
  onStartOver: () => void;
  onResult: (signature: HexString) => void;
};

export const Signing = ({
  api,
  chainId,
  transaction,
  assetId,
  countdown,
  onQrExpired,
  onStartOver,
  onResult,
}: Props) => {
  const { t } = useI18n();
  const { getBalance } = useBalance();
  const { getTransactionFee } = useTransaction();

  const [validationError, setValidationError] = useState<ValidationErrors>();

  const getTokenBalance = (): Promise<Balance | undefined> => {
    return getBalance(toAccountId(transaction.address), chainId, assetId.toString());
  };

  const getNativeTokenBalance = (): Promise<Balance | undefined> => {
    if (assetId === '0') return Promise.resolve(undefined);

    return getBalance(toAccountId(transaction.address), chainId, '0');
  };

  const validateBalance = async (): Promise<boolean> => {
    const amount = transaction.args.value;
    const transferableBalance = transferableAmount(await getTokenBalance());

    return new BN(transferableBalance).gt(new BN(amount));
  };

  const validateBalanceForFee = async (): Promise<boolean> => {
    const amount = transaction.args.value;
    const nativeTokenBalance = await getNativeTokenBalance();
    const transferableBalance = transferableAmount(await getTokenBalance());
    const transferableNativeTokenBalance = transferableAmount(nativeTokenBalance);
    const fee = await getTransactionFee(transaction, api);

    return nativeTokenBalance
      ? new BN(transferableNativeTokenBalance).gt(new BN(fee))
      : new BN(transferableBalance).gt(new BN(fee).add(new BN(amount)));
  };

  const handleResult = async (signature: string): Promise<void> => {
    const [balanceIsEnough, feeIsEnough] = await Promise.all([validateBalance(), validateBalanceForFee()]);

    if (!balanceIsEnough) {
      setValidationError(ValidationErrors.INSUFFICIENT_BALANCE);
    } else if (!feeIsEnough) {
      setValidationError(ValidationErrors.INSUFFICIENT_BALANCE_FOR_FEE);
    } else {
      onResult(signature as HexString);
    }
  };

  useEffect(() => {
    if (countdown === 0) {
      onQrExpired();
    }
  }, [countdown]);

  return (
    <div className="flex flex-col items-center gap-y-2.5 w-full">
      <ParitySignerSignatureReader
        className="w-full"
        countdown={countdown}
        header={t('signing.scanSignatureTitle')}
        size={[440, 496]}
        validationError={validationError}
        onResult={handleResult}
      />

      {validationError && (
        <Button className="w-max mb-5" weight="lg" variant="fill" pallet="primary" onClick={onStartOver}>
          {t('transfer.editOperationButton')}
        </Button>
      )}
    </div>
  );
};