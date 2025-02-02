import cn from 'classnames';

import { useI18n } from '@app/providers';
import NoConnection from '@shared/assets/images/misc/no-connection.webp';
import { Paths } from '@shared/routes';
import { ButtonLink, FootnoteText } from '@shared/ui';

type Props = {
  active: boolean;
  isLoading?: boolean;
  className?: string;
};

export const InactiveNetwork = ({ active, isLoading, className }: Props) => {
  const { t } = useI18n();

  if (!active || isLoading) {
    return null;
  }

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <img src={NoConnection} alt="" width="147" height="147" />
      <FootnoteText align="center" className="mt-4 w-[280px] text-text-tertiary">
        {t('general.title.inactiveNetwork')}
      </FootnoteText>

      <ButtonLink variant="text" size="md" to={Paths.NETWORK}>
        {t('general.button.networkSettingsLink')}
      </ButtonLink>
    </div>
  );
};
