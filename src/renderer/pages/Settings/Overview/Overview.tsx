import { Outlet } from 'react-router-dom';

import { useI18n } from '@app/providers';
import { Header } from '@shared/ui';

import { GeneralActions, MatrixAction, SocialLinks, Version } from './components';

export const Overview = () => {
  const { t } = useI18n();

  return (
    <>
      <div className="flex h-full flex-col">
        <Header title={t('settings.title')} />

        <section className="mt-4 h-full w-full overflow-y-auto">
          <div className="mx-auto flex w-[546px] flex-col gap-y-4">
            <GeneralActions />
            <MatrixAction />
            <SocialLinks />
            <Version />
          </div>
        </section>
      </div>

      <Outlet />
    </>
  );
};
