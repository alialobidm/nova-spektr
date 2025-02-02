import { useUnit } from 'effector-react';
import { useEffect, useState } from 'react';

import { useI18n } from '@app/providers';
import {
  type AccountId,
  type MultisigAccount,
  type MultisigEvent,
  type MultisigTransaction,
  type Signatory,
  type SigningStatus,
  type Wallet,
} from '@shared/core';
import { useToggle } from '@shared/lib/hooks';
import { nonNullable } from '@shared/lib/utils';
import { BodyText, Button, CaptionText, FootnoteText, Icon, SmallTitleText } from '@shared/ui';
import { contactModel } from '@entities/contact';
import { useMultisigEvent } from '@entities/multisig';
import { type ExtendedChain } from '@entities/network';
import { SignatoryCard, signatoryUtils } from '@entities/signatory';
import { AddressWithName, WalletIcon, walletModel } from '@entities/wallet';
import { getSignatoryName } from '@pages/Operations/common/utils';

import LogModal from './LogModal';

type WalletSignatory = Signatory & { wallet: Wallet };

type Props = {
  tx: MultisigTransaction;
  connection: ExtendedChain;
  account: MultisigAccount;
};

export const OperationSignatories = ({ tx, connection, account }: Props) => {
  const { t } = useI18n();
  const { getLiveTxEvents } = useMultisigEvent({});

  const { signatories, accountId, chainId, callHash, blockCreated, indexCreated } = tx;
  const events = getLiveTxEvents(accountId, chainId, callHash, blockCreated, indexCreated);

  const wallets = useUnit(walletModel.$wallets);
  const contacts = useUnit(contactModel.$contacts);

  const [isLogModalOpen, toggleLogModal] = useToggle();
  const [signatoriesList, setSignatories] = useState<Signatory[]>([]);

  const approvals = events.filter((e) => e.status === 'SIGNED');
  const cancellation = events.filter((e) => e.status === 'CANCELLED');

  const walletSignatories: WalletSignatory[] = signatoriesList.reduce((acc: WalletSignatory[], signatory) => {
    const signatoryWallet = signatoryUtils.getSignatoryWallet(wallets, signatory.accountId);

    if (signatoryWallet) {
      acc.push({ ...signatory, wallet: signatoryWallet });
    }

    return acc;
  }, []);

  const walletSignatoriesIds = walletSignatories.map((a) => a.accountId);
  const contactSignatories = signatories.filter((s) => !walletSignatoriesIds.includes(s.accountId));

  useEffect(() => {
    const tempCancellation = [];

    if (cancellation.length) {
      const cancelSignatories = signatories.find((s) => s.accountId === cancellation[0].accountId);
      if (cancelSignatories) {
        tempCancellation.push(cancelSignatories);
      }
    }

    const tempApprovals = approvals
      .sort((a: MultisigEvent, b: MultisigEvent) => (a.eventBlock || 0) - (b.eventBlock || 0))
      .map((a) => signatories.find((s) => s.accountId === a.accountId))
      .filter(nonNullable);

    setSignatories([...new Set<Signatory>([...tempCancellation, ...tempApprovals, ...signatories])]);
  }, [signatories.length, approvals.length, cancellation.length]);

  const getSignatoryStatus = (signatory: AccountId): SigningStatus | undefined => {
    const cancelEvent = events.find((e) => e.status === 'CANCELLED' && e.accountId === signatory);
    if (cancelEvent) {
      return cancelEvent.status;
    }
    const signedEvent = events.find((e) => e.status === 'SIGNED' && e.accountId === signatory);

    return signedEvent?.status;
  };

  return (
    <div className="flex w-[320px] flex-col px-2 py-4">
      <div className="mb-3 flex items-center justify-between">
        <SmallTitleText>{t('operation.signatoriesTitle')}</SmallTitleText>

        <Button
          pallet="secondary"
          variant="fill"
          size="sm"
          prefixElement={<Icon name="chat" size={16} />}
          suffixElement={
            <CaptionText className="rounded-full bg-chip-icon px-1.5 pb-[2px] pt-[1px] !text-white">
              {events.length}
            </CaptionText>
          }
          onClick={toggleLogModal}
        >
          {t('operation.logButton')}
        </Button>
      </div>

      <div className="flex flex-col gap-y-2">
        {Boolean(walletSignatories.length) && (
          <>
            <FootnoteText className="mb-2 text-text-tertiary" as="h4">
              {t('operation.walletSignatoriesTitle')}
            </FootnoteText>
            <ul className="flex flex-col gap-y-2">
              {walletSignatories.map((signatory) => (
                <SignatoryCard
                  key={signatory.accountId}
                  accountId={signatory.accountId}
                  addressPrefix={connection.addressPrefix}
                  status={getSignatoryStatus(signatory.accountId)}
                  explorers={connection.explorers}
                >
                  <WalletIcon type={signatory.wallet.type} size={20} />
                  <BodyText className="mr-auto text-inherit">{signatory.wallet.name}</BodyText>
                </SignatoryCard>
              ))}
            </ul>
          </>
        )}

        {Boolean(contactSignatories.length) && (
          <>
            <FootnoteText className="mb-2 text-text-tertiary" as="h4">
              {t('operation.contactSignatoriesTitle')}
            </FootnoteText>
            <ul className="flex flex-col gap-y-2">
              {contactSignatories.map((signatory) => (
                <SignatoryCard
                  key={signatory.accountId}
                  accountId={signatory.accountId}
                  matrixId={signatory.matrixId}
                  addressPrefix={connection.addressPrefix}
                  status={getSignatoryStatus(signatory.accountId)}
                  explorers={connection.explorers}
                >
                  <AddressWithName
                    name={getSignatoryName(
                      signatory.accountId,
                      signatories,
                      contacts,
                      wallets,
                      connection.addressPrefix,
                    )}
                    symbols={8}
                    type="short"
                    addressFont="text-inherit text-left"
                    accountId={signatory.accountId}
                    className="flex-1"
                    addressPrefix={connection.addressPrefix}
                  />
                </SignatoryCard>
              ))}
            </ul>
          </>
        )}
      </div>

      <LogModal
        isOpen={isLogModalOpen}
        tx={tx}
        account={account}
        connection={connection}
        contacts={contacts}
        onClose={toggleLogModal}
      />
    </div>
  );
};
