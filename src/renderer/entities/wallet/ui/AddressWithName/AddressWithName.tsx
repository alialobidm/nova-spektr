import { cnTw, copyToClipboard, toShortAddress } from '@shared/lib/utils';
import { IconButton, Truncate } from '@shared/ui';
import { type AccountAddressProps, getAddress } from '../AccountAddress/AccountAddress';
import { AddressWithTwoLines } from '../AddressWithTwoLines/AddressWithTwoLines';

type Props = {
  canCopySubName?: boolean;
} & AccountAddressProps;

export const AddressWithName = ({
  className,
  symbols,
  name,
  size = 16,
  addressFont,
  nameFont,
  type = 'full',
  canCopy = true,
  showIcon = true,
  canCopySubName = false,
  ...props
}: Props) => {
  const currentAddress = getAddress(props);
  const typeIsAdaptive = type === 'adaptive';
  const addressToShow = type === 'short' ? toShortAddress(currentAddress, symbols) : currentAddress;

  const nameContent = name && <p className={cnTw('w-full truncate', addressFont, nameFont)}>{name}</p>;

  const addressContent = typeIsAdaptive ? (
    <Truncate className={cnTw(addressFont)} ellipsis="..." start={4} end={4} text={addressToShow} />
  ) : (
    <p className="inline-block break-all">{addressToShow}</p>
  );

  const firstLine = (
    <div className={cnTw('w-full text-body text-text-primary', addressFont)}>{nameContent || addressContent}</div>
  );
  const secondLine = nameContent && addressContent && (
    <div className="w-full text-help-text text-text-tertiary">
      {canCopySubName ? (
        <div className="flex w-full items-center gap-1">
          {addressContent}
          <IconButton name="copy" className="p-0 text-text-tertiary" onClick={() => copyToClipboard(currentAddress)} />
        </div>
      ) : (
        addressContent
      )}
    </div>
  );

  return (
    <AddressWithTwoLines
      showIcon={showIcon}
      size={size}
      canCopy={canCopy}
      firstLine={firstLine}
      secondLine={secondLine}
      className={className}
      {...props}
    />
  );
};
