import { useUnit } from 'effector-react';

import { useConfirmContext, useI18n } from '@app/providers';
import { FootnoteText, Icon, Plate, Shimmering, SmallTitleText } from '@shared/ui';
import { walletModel, walletUtils } from '@/entities/wallet';
import { AssetBalance } from '@entities/asset';
import { EmptyAccountMessage } from '@/features/emptyList';
import { walletSelectModel } from '@/features/wallets';
import { delegationAggregate } from '../../aggregates/delegation';

type Props = {
  onClick: () => void;
};

export const TotalDelegation = ({ onClick }: Props) => {
  const { t } = useI18n();
  const { confirm } = useConfirmContext();

  const totalDelegation = useUnit(delegationAggregate.$totalDelegations);
  const asset = useUnit(delegationAggregate.$asset);
  const isLoading = useUnit(delegationAggregate.$isLoading);
  const hasAccount = useUnit(delegationAggregate.$hasAccount);
  const canDelegate = useUnit(delegationAggregate.$canDelegate);

  const activeWallet = useUnit(walletModel.$activeWallet);

  const handleClick = () => {
    if (hasAccount && canDelegate) {
      onClick();

      return;
    }

    let message = <EmptyAccountMessage walletType={activeWallet?.type} />;

    if (hasAccount && !canDelegate) {
      if (walletUtils.isWatchOnly(activeWallet)) {
        message = t('governance.addDelegation.walletTypeRestrictionError');
      } else {
        message = (
          <>
            {t('emptyState.accountDescription')} {t('governance.addDelegation.proxyRestrictionMessage')}
          </>
        );
      }
    }

    confirm({
      title: t('governance.addDelegation.cantAddDelegationTitle'),
      message,
      cancelText: t('general.button.closeButton'),
      confirmText: walletUtils.isPolkadotVault(activeWallet) ? t('emptyState.addAccountButton') : undefined,
    }).then((result) => {
      if (result && activeWallet) {
        walletSelectModel.events.walletIdSet(activeWallet.id);
      }
    });
  };

  return (
    <button onClick={handleClick}>
      <Plate className="flex h-[90px] w-[240px] items-center justify-between px-4 pb-4.5 pt-3">
        <div className="flex flex-col items-start gap-y-2">
          <div className="flex items-center gap-x-1">
            <Icon size={16} name="opengovDelegations" />
            <FootnoteText>{t('governance.delegations')}</FootnoteText>
          </div>

          {isLoading && <Shimmering width={120} height={20} />}
          {!isLoading &&
            asset &&
            (totalDelegation !== '0' ? (
              <AssetBalance className="text-small-title" value={totalDelegation} asset={asset} />
            ) : (
              <SmallTitleText>{t('governance.addDelegation.actionButton')}</SmallTitleText>
            ))}
        </div>

        <Icon name="arrowRight" />
      </Plate>
    </button>
  );
};
