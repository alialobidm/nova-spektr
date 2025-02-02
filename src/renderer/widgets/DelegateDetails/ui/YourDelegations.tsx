import { BN } from '@polkadot/util';
import { useUnit } from 'effector-react';
import { Trans } from 'react-i18next';

import { useI18n } from '@/app/providers';
import { toAddress } from '@/shared/lib/utils';
import { BaseModal, BodyText, FootnoteText, Icon, Tooltip } from '@/shared/ui';
import { AssetBalance } from '@/entities/asset';
import { votingService } from '@/entities/governance';
import { ContactItem, ExplorersPopover, accountUtils, walletModel } from '@/entities/wallet';
import { allTracks } from '@/widgets/DelegateModal/lib/constants';
import { delegateDetailsModel } from '../model/delegate-details-model';

export const YourDelegations = () => {
  const { t } = useI18n();

  const isOpen = useUnit(delegateDetailsModel.$isDelegationsOpen);
  const chain = useUnit(delegateDetailsModel.$chain);
  const activeAccounts = useUnit(delegateDetailsModel.$activeAccounts);
  const activeDelegations = useUnit(delegateDetailsModel.$activeDelegations);
  const activeTracks = useUnit(delegateDetailsModel.$activeTracks);
  const wallet = useUnit(walletModel.$activeWallet);

  if (!chain) return null;

  return (
    <BaseModal
      closeButton
      headerClass="px-5 py-3"
      panelClass="flex h-[672px] w-[784px] flex-col bg-white"
      contentClass="scrollbar-stable flex min-h-0 w-full flex-1 flex-col gap-6 overflow-y-auto bg-white py-4"
      isOpen={isOpen}
      title={t('governance.addDelegation.yourDelegationsTitle')}
      onClose={delegateDetailsModel.events.closeDelegationsModal}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center">
          <FootnoteText className="flex-1 px-3 text-text-tertiary">
            {t('governance.addDelegation.accountsLabel', { count: 1 })}
          </FootnoteText>
          <FootnoteText className="flex w-[168px] justify-end px-3 text-text-tertiary">
            {t('governance.addDelegation.votesLabel')}
          </FootnoteText>
          <FootnoteText className="w-[62px] px-3 text-text-tertiary">
            {t('governance.addDelegation.tracksLabel')}
          </FootnoteText>
        </div>
        {activeAccounts.map((address) => {
          const account = wallet?.accounts.find((a) => toAddress(a.accountId) === address);
          const activeDelegation = activeDelegations[address];

          if (!account || !activeDelegation) return null;

          const convictionMultiplier = votingService.getConvictionMultiplier(activeDelegation.conviction);

          return (
            <div key={address} className="flex h-[52px] items-center">
              <div className="flex-1 px-3">
                <ExplorersPopover
                  address={account.accountId}
                  explorers={chain.explorers}
                  button={
                    <ContactItem
                      name={account.name}
                      address={account.accountId}
                      keyType={
                        accountUtils.isShardAccount(account) || accountUtils.isChainAccount(account)
                          ? account.keyType
                          : undefined
                      }
                    />
                  }
                />
              </div>
              <div className="flex w-[168px] flex-col items-end justify-center px-3">
                <BodyText>
                  <Trans
                    t={t}
                    i18nKey="governance.addDelegation.votesValue"
                    components={{
                      votes: (
                        <AssetBalance
                          value={activeDelegation.balance.mul(new BN(convictionMultiplier))}
                          asset={chain.assets[0]}
                          showSymbol={false}
                        />
                      ),
                    }}
                  />
                </BodyText>
                <FootnoteText>
                  <Trans
                    t={t}
                    i18nKey="governance.addDelegation.balanceValue"
                    values={{ conviction: convictionMultiplier }}
                    components={{
                      balance: <AssetBalance value={activeDelegation.balance} asset={chain.assets[0]} />,
                    }}
                  />
                </FootnoteText>
              </div>
              <div className="w-[62px] px-3">
                <Tooltip
                  content={[...activeTracks[address]]
                    .map((trackId) => t(allTracks.find((track) => track.id === trackId)!.value))
                    .join(', ')}
                  pointer="up"
                >
                  <div className="flex gap-1">
                    <FootnoteText>{activeTracks[address]?.size || 0}</FootnoteText>

                    <Icon className="group-hover:text-icon-hover" name="info" size={16} />
                  </div>
                </Tooltip>
              </div>
            </div>
          );
        })}
      </div>
    </BaseModal>
  );
};
