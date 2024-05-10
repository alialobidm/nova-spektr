import { useUnit } from 'effector-react';
import { Link } from 'react-router-dom';

import { useI18n } from '@app/providers';
import { Icon, Tooltip, Accordion, BodyText, Shimmering, FootnoteText, Plate, HelpText } from '@shared/ui';
import { cnTw } from '@shared/lib/utils';
import type { TokenAsset } from '@shared/core';
import { Paths, createLink } from '@shared/routes';
import { CheckPermission, OperationType, walletModel } from '@entities/wallet';
import { priceProviderModel, AssetFiatBalance, TokenPrice } from '@entities/price';
import { balanceModel } from '@entities/balance';
import { AssetBalance, AssetIcon } from '@entities/asset';
import { networkModel } from '@entities/network';
import { ChainIcon } from '@entities/chain';
import { NetworkCard } from './NetworkCard';

type Props = {
  asset: TokenAsset;
};

export const TokenBalanceList = ({ asset }: Props) => {
  const { t } = useI18n();

  const fiatFlag = useUnit(priceProviderModel.$fiatFlag);

  const activeWallet = useUnit(walletModel.$activeWallet);
  const balances = useUnit(balanceModel.$balances);
  const chains = useUnit(networkModel.$chains);

  const hasFailedVerification = balances?.some((b) => b.verified !== undefined && !b.verified);

  // TODO WIP - delete it after sum balance function added
  const totalBalance = 1;

  return (
    <Plate className="p-0 shadow-shards border-b-4 border-double z-10">
      <Accordion>
        <Accordion.Button
          iconOpened="shelfDown"
          iconClosed="shelfRight"
          buttonClass={cnTw(
            'sticky top-0 px-2 py-1.5 z-10 justify-end flex-row-reverse bg-white',
            'transition-colors rounded hover:bg-block-background-hover focus-visible:bg-block-background-hover h-[52px]',
          )}
        >
          <div className="w-full items-center grid grid-cols-[1fr,100px,100px,60px]">
            <div className="flex items-center gap-x-2">
              <AssetIcon src={asset.icon} name={asset.name} />
              <div className="flex flex-col">
                <BodyText>{asset.symbol}</BodyText>
                <div className="flex items-center">
                  <FootnoteText className="text-text-tertiary mr-1.5">
                    {t('balances.availableNetworks', { count: asset.chains.length })}
                  </FootnoteText>
                  <ChainIcon src={chains[asset.chains[0].chainId].icon} name={asset.chains[0].name} size={18} />
                  <ChainIcon
                    className="mx-[-8px]"
                    src={chains[asset.chains[1].chainId].icon}
                    name={asset.chains[1].name}
                    size={18}
                  />
                  {asset.chains.length > 2 && (
                    <div className="b-r-2 w-6 rounded flex items-center justify-center bg-token-background p-0.5">
                      <HelpText className="text-white">+1</HelpText>
                    </div>
                  )}
                  {hasFailedVerification && (
                    <div className="flex items-center gap-x-2 text-text-warning ml-2.5">
                      <Tooltip content={t('balances.verificationTooltip')} pointer="up">
                        <Icon name="warn" className="cursor-pointer text-inherit" size={14} />
                      </Tooltip>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <TokenPrice
              assetId={asset.priceId}
              wrapperClassName="flex-col gap-0.5 items-end px-2"
              className="text-text-primar text-right"
            />
            <div className="flex flex-col items-end col-end-4">
              {totalBalance ? (
                <>
                  <AssetBalance value={'100000000'} asset={asset} showSymbol={false} />
                  <AssetFiatBalance amount={'200000000'} asset={asset} />
                </>
              ) : (
                <div className="flex flex-col gap-y-1 items-end">
                  <Shimmering width={82} height={20} />
                  {fiatFlag && <Shimmering width={56} height={18} />}
                </div>
              )}
            </div>

            <div className="flex gap-x-2 ml-3">
              <CheckPermission operationType={OperationType.TRANSFER} wallet={activeWallet}>
                <Link to={createLink(Paths.TRANSFER_ASSET, {})} onClick={(e) => e.stopPropagation()}>
                  <Icon name="sendArrow" size={20} />
                </Link>
              </CheckPermission>
              <CheckPermission operationType={OperationType.RECEIVE} wallet={activeWallet}>
                <Link to={createLink(Paths.RECEIVE_ASSET, {})} onClick={(e) => e.stopPropagation()}>
                  <Icon name="receiveArrow" size={20} />
                </Link>
              </CheckPermission>
            </div>
          </div>
        </Accordion.Button>

        <Accordion.Content className="mt-1">
          <ul className="flex flex-col gap-y-1.5 pl-6">
            {asset.chains.map((chain) => (
              <NetworkCard key={chain.chainId + chain.assetId} chain={chain} asset={asset} />
            ))}
          </ul>
        </Accordion.Content>
      </Accordion>
    </Plate>
  );
};
