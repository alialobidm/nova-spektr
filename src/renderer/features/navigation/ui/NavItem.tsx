import { type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

import { useI18n } from '@app/providers';
import { cnTw } from '@shared/lib/utils';
import { BodyText, Icon } from '@shared/ui';
import { type IconNames } from '@shared/ui/Icon/data';

export type Props = {
  title: string;
  link: string;
  icon: IconNames;
  badge?: ReactNode;
};

export const NavItem = ({ title, link, icon, badge }: Props) => {
  const { t } = useI18n();

  return (
    <NavLink
      to={link}
      className={({ isActive }) =>
        cnTw(
          'flex cursor-pointer select-none items-center rounded-md px-3.5 py-2.5 outline-offset-reduced hover:bg-tab-background',
          isActive && 'bg-tab-background',
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={cnTw(isActive ? 'text-tab-icon-active' : 'text-tab-icon-inactive')} name={icon} size={20} />
          <BodyText className={cnTw('ml-3', isActive ? 'text-text-primary' : 'text-text-secondary')}>
            {t(title)}
          </BodyText>
          {badge}
        </>
      )}
    </NavLink>
  );
};
