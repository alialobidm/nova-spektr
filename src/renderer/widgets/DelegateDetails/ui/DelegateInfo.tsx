import { type DelegateAccount } from '@/shared/api/governance';
import { Markdown } from '@/shared/ui';
import { DelegateName } from '@/features/governance';

type Props = {
  delegate: DelegateAccount;
};

export const DelegateInfo = ({ delegate }: Props) => {
  return (
    <div className="flex flex-col gap-4">
      <DelegateName delegate={delegate} />

      {delegate.longDescription && <Markdown>{delegate.longDescription}</Markdown>}
    </div>
  );
};
