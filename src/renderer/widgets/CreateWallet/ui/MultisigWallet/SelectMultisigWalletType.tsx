import { useState } from 'react';

import { useI18n } from '@app/providers';
import { BaseModal, BodyText, Button, HeaderTitleText, RadioGroup } from '@shared/ui';
import { MatrixAutoLogin, MatrixLogin } from '@features/matrix';

import { MultisigWalletType } from './common/constants';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onContinue: (walletType: MultisigWalletType) => void;
};

export const SelectMultisigWalletType = ({ isOpen, onClose, onContinue }: Props) => {
  const { t } = useI18n();

  const [walletType, setWalletType] = useState<MultisigWalletType>();

  const singleChainOption = {
    id: MultisigWalletType.SINGLE_CHAIN,
    value: MultisigWalletType.SINGLE_CHAIN,
    title: t('createMultisigAccount.singleChain.title'),
  };

  const multiChainOption = {
    id: MultisigWalletType.MULTI_CHAIN,
    value: MultisigWalletType.MULTI_CHAIN,
    title: t('createMultisigAccount.multiChain.title'),
  };

  return (
    <BaseModal
      title={<HeaderTitleText className="py-[3px]">{t('createMultisigAccount.title')}</HeaderTitleText>}
      isOpen={isOpen}
      panelClass="w-[664px]"
      onClose={onClose}
    >
      <RadioGroup
        className="mt-7 flex gap-6"
        activeId={walletType}
        options={[singleChainOption, multiChainOption]}
        onChange={(option) => setWalletType(option.value)}
      >
        <RadioGroup.CardOption option={singleChainOption}>
          <div className="flex flex-col gap-4 pl-3.5">
            <BodyText className="list-item list-disc text-text-primary">
              {t('createMultisigAccount.singleChain.featureOne')}
            </BodyText>
            <BodyText className="list-item list-disc text-text-primary">
              {t('createMultisigAccount.singleChain.featureTwo')}
            </BodyText>
            <BodyText className="list-item list-disc text-text-primary">
              {t('createMultisigAccount.singleChain.featureThree')}
            </BodyText>
            <BodyText className="list-item list-disc text-text-primary">
              {t('createMultisigAccount.singleChain.featureFour')}
            </BodyText>
          </div>
          <BodyText className="mt-8 text-text-tertiary">{t('createMultisigAccount.singleChain.description')}</BodyText>
        </RadioGroup.CardOption>
        <RadioGroup.CardOption option={multiChainOption}>
          <div className="flex flex-col gap-4 pl-3.5">
            <BodyText className="list-item list-disc text-text-primary">
              {t('createMultisigAccount.multiChain.featureOne')}
            </BodyText>
            <BodyText className="list-item list-disc text-text-primary">
              {t('createMultisigAccount.multiChain.featureTwo')}
            </BodyText>
            <BodyText className="list-item list-disc text-text-primary">
              {t('createMultisigAccount.multiChain.featureThree')}
            </BodyText>
            <BodyText className="list-item list-disc text-text-primary">
              {t('createMultisigAccount.multiChain.featureFour')}
            </BodyText>
          </div>
          <BodyText className="mt-8 text-text-tertiary">{t('createMultisigAccount.multiChain.description')}</BodyText>
        </RadioGroup.CardOption>
      </RadioGroup>

      <div className="mt-7 flex items-center justify-between">
        <Button variant="text" onClick={onClose}>
          {t('operation.goBackButton')}
        </Button>

        <Button disabled={!walletType} onClick={() => onContinue(walletType!)}>
          {t('signing.continueButton')}
        </Button>
      </div>

      <MatrixAutoLogin />
      <MatrixLogin zIndex="z-60" redirectStep="multisig_wallet" onClose={onClose} />
    </BaseModal>
  );
};
