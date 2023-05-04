import { useEffect, useState } from 'react';

import { MultisigEvent, MultisigTransaction } from '@renderer/domain/transaction';
import { MultisigAccount } from '@renderer/domain/account';
import { Icon } from '@renderer/components/ui';
import Details from '@renderer/screens/Operations/components/Details';
import RejectTx from '@renderer/screens/Operations/components/modals/RejectTx';
import ApproveTx from '@renderer/screens/Operations/components/modals/ApproveTx';
import { getMultisigExtrinsicLink } from '@renderer/screens/Operations/common/utils';
import { Signatory } from '@renderer/domain/signatory';
import CallDataModal from '@renderer/screens/Operations/components/modals/CallDataModal';
import { AccountId, CallData, ChainId } from '@renderer/domain/shared-kernel';
import { nonNullable } from '@renderer/shared/utils/functions';
import { useMatrix } from '@renderer/context/MatrixContext';
import { useMultisigTx } from '@renderer/services/multisigTx/multisigTxService';
import { useNetworkContext } from '@renderer/context/NetworkContext';
import { useToggle } from '@renderer/shared/hooks';
import { useI18n } from '@renderer/context/I18nContext';
import { Button, CaptionText, InfoLink, SmallTitleText } from '@renderer/components/ui-redesign';
import SignatoryCard from '@renderer/components/common/SignatoryCard/SignatoryCard';

type Props = {
  tx: MultisigTransaction;
  account?: MultisigAccount;
};

const OperationFullInfo = ({ tx, account }: Props) => {
  const { t } = useI18n();
  const { callData, events, signatories } = tx;

  const { matrix } = useMatrix();

  const { updateCallData } = useMultisigTx();
  const { connections } = useNetworkContext();
  const connection = connections[tx?.chainId as ChainId];
  const approvals = events.filter((e) => e.status === 'SIGNED');
  const cancellation = events.filter((e) => e.status === 'CANCELLED');

  const [isCallDataModalOpen, toggleCallDataModal] = useToggle();

  const [signatoriesList, setSignatories] = useState<Signatory[]>([]);
  const explorerLink = getMultisigExtrinsicLink(tx.callHash, tx.indexCreated, tx.blockCreated, connection?.explorers);

  const setupCallData = async (callData: CallData) => {
    const api = connection.api;

    if (!api || !tx) return;

    if (!account?.matrixRoomId) {
      updateCallData(api, tx, callData as CallData);

      return;
    }

    matrix.sendUpdate(account?.matrixRoomId, {
      senderAccountId: tx.depositor || '0x00',
      chainId: tx.chainId,
      callHash: tx.callHash,
      callData: callData,
      callTimepoint: {
        index: tx.indexCreated || 0,
        height: tx.blockCreated || 0,
      },
    });
  };

  useEffect(() => {
    const tempCancellation = [];

    if (cancellation.length) {
      const cancelSignatories = signatories.find((s) => s.accountId === cancellation[0].accountId);
      cancelSignatories && tempCancellation.push(cancelSignatories);
    }

    const tempApprovals = approvals
      .sort((a: MultisigEvent, b: MultisigEvent) => (a.eventBlock || 0) - (b.eventBlock || 0))
      .map((a) => signatories.find((s) => s.accountId === a.accountId))
      .filter(nonNullable);

    setSignatories([...new Set<Signatory>([...tempCancellation, ...tempApprovals, ...signatories])]);
  }, [signatories.length, approvals.length, cancellation.length]);

  const getSignatoryStatus = (signatory: AccountId) => {
    const event = events.find((e) => e.status === 'SIGNED' || (e.status === 'CANCELLED' && e.accountId === signatory));

    return event?.status;
  };

  return (
    <div className="flex flex-1">
      <div className="flex flex-col flex-1 pt-[19px] px-4 pb-4 border-r border-r-divider">
        <div className="flex justify-between items-center mb-3">
          <SmallTitleText>{t('operation.detailsTitle')}</SmallTitleText>

          {callData ? (
            explorerLink && (
              <InfoLink url={explorerLink} className="flex items-center gap-x-0.5">
                <span>{t('operation.explorerLink')}</span>
                <Icon name="right" size={16} />
              </InfoLink>
            )
          ) : (
            <>
              <Button pallet="primary" variant="text" size="sm" onClick={toggleCallDataModal}>
                {t('operation.addCallDataButton')}
              </Button>
            </>
          )}
        </div>

        <Details tx={tx} account={account} connection={connection} />

        <div className="flex justify-between items-center">
          {account && connection && <RejectTx tx={tx} account={account} connection={connection} />}
          {account && connection && <ApproveTx tx={tx} account={account} connection={connection} />}
        </div>
      </div>

      <div className="flex flex-col flex-1 pt-[19px] px-4 pb-4">
        <div className="flex justify-between items-center mb-3">
          <SmallTitleText>{t('operation.signatoriesTitle')}</SmallTitleText>

          <Button
            pallet="secondary"
            variant="fill"
            size="sm"
            prefixElement={<Icon name="chatRedesign" className="text-icon-default" size={16} />}
            suffixElement={
              <CaptionText
                className="text-button-text bg-primary-button-background-default rounded-full pt-[1px] pb-[2px] px-1.5"
                fontWeight="semibold"
              >
                {events.length}
              </CaptionText>
            }
          >
            {t('operation.logButton')}
          </Button>
        </div>

        <ul className="flex flex-col gap-y-0.5">
          {signatoriesList.map(({ accountId, name }) => {
            return (
              <li key={accountId}>
                <SignatoryCard accountId={accountId} name={name} status={getSignatoryStatus(accountId)} />
              </li>
            );
          })}
        </ul>
      </div>
      <CallDataModal isOpen={isCallDataModalOpen} tx={tx} onSubmit={setupCallData} onClose={toggleCallDataModal} />
    </div>
  );
};

export default OperationFullInfo;