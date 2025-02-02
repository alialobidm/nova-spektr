import { Shimmering } from '@shared/ui';

type Props = {
  fiatFlag?: boolean;
};

export const FeeLoader = ({ fiatFlag }: Props) => (
  <div className="flex flex-col items-end gap-y-0.5">
    <Shimmering width={90} height={20} data-testid="fee-loader" />
    {fiatFlag && <Shimmering width={70} height={18} data-testid="fee-loader" />}
  </div>
);
