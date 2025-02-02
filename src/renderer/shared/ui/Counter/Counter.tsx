import { type PropsWithChildren } from 'react';

import { cnTw } from '@shared/lib/utils';
import { CaptionText } from '../Typography';

import { BadgeStyles } from './common/constants';
import { type Variant } from './common/types';

type Props = {
  variant: Variant;
  className?: string;
};

export const Counter = ({ variant, className, children }: PropsWithChildren<Props>) => (
  <div className={cnTw('flex h-4 items-center justify-center rounded-[30px] px-1.5', BadgeStyles[variant], className)}>
    {['string', 'number'].includes(typeof children) ? (
      <CaptionText className="text-white">{children}</CaptionText>
    ) : (
      children
    )}
  </div>
);
