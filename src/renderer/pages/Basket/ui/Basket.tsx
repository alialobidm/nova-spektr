import { useUnit } from 'effector-react';
import { useEffect } from 'react';

import { useI18n } from '@app/providers';
import { Button, Checkbox, ConfirmModal, FootnoteText, Header, Icon, SmallTitleText } from '@shared/ui';
import { BasketFilter, basketFilterModel } from '@features/basket/BasketFilter';
import { basketPageUtils } from '../lib/basket-page-utils';
import { basketPageModel } from '../model/basket-page-model';

import { EmptyBasket } from './EmptyBasket';
import { Operation } from './Operation';
import { SignOperation } from './SignOperation';
import { SignOperations } from './SignOperations';

export const Basket = () => {
  const { t } = useI18n();

  const basketTxs = useUnit(basketPageModel.$basketTransactions);
  const selectedTxs = useUnit(basketPageModel.$selectedTxs);
  const invalidTxs = useUnit(basketPageModel.$invalidTxs);
  const validTxs = useUnit(basketPageModel.$validTxs);
  const validatingTxs = useUnit(basketPageModel.$validatingTxs);
  const alreadyValidatedTxs = useUnit(basketPageModel.$alreadyValidatedTxs);
  const validationWarningShown = useUnit(basketPageModel.$validationWarningShown);
  const txToRemove = useUnit(basketPageModel.$txToRemove);
  const step = useUnit(basketPageModel.$step);

  const filteredTxs = useUnit(basketFilterModel.$filteredTxs);

  const isSignAvailable =
    validatingTxs.filter((tx) => selectedTxs.includes(tx)).length > 0 ||
    (selectedTxs.length === 0 && basketPageUtils.isSelectStep(step));

  useEffect(() => {
    return basketPageModel.events.selectedTxsReset();
  }, []);

  return (
    <section className="relative flex h-full flex-col items-center">
      <Header title={t('basket.title')} />

      <div className="mt-4">
        <BasketFilter />
      </div>

      {filteredTxs.length > 0 && (
        <>
          <div className="mt-4 flex w-full flex-col items-center gap-4">
            <div className="flex w-[736px] items-center justify-between">
              <Checkbox
                className="ml-3"
                checked={basketTxs.length === selectedTxs.length}
                semiChecked={selectedTxs.length > 0 && basketTxs.length !== selectedTxs.length}
                onChange={() => basketPageModel.events.allSelected()}
              >
                <FootnoteText className="text-text-secondary">
                  {t('basket.selectedStatus', { count: basketTxs.length, selected: selectedTxs.length })}
                </FootnoteText>
              </Checkbox>

              <div className="flex items-center gap-4">
                <Button variant="text" size="sm" onClick={() => basketPageModel.events.refreshValidationStarted()}>
                  <div className="flex items-center gap-1">
                    <Icon className="text-icon-accent" name="refresh" />
                    {t('basket.refreshButton')}
                  </div>
                </Button>
                <Button
                  size="sm"
                  className="w-[125px]"
                  disabled={isSignAvailable}
                  onClick={() => basketPageModel.events.signStarted()}
                >
                  {t(selectedTxs.length === 0 ? 'basket.emptySignButton' : 'basket.signButton')}
                </Button>
              </div>
            </div>
          </div>

          <div className="scrollbar-stable mt-4 flex w-full flex-col items-center gap-4 overflow-y-auto">
            <ul className="flex w-[736px] flex-col gap-y-1.5 divide-y rounded-md">
              {filteredTxs.map((tx) => (
                <li key={tx.id} className="flex gap-x-4 bg-block-background-default px-3">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      disabled={
                        Boolean(invalidTxs.get(tx.id)) ||
                        validatingTxs.includes(tx.id) ||
                        !alreadyValidatedTxs.includes(tx.id)
                      }
                      checked={selectedTxs.includes(tx.id)}
                      onChange={() =>
                        basketPageModel.events.txSelected({ id: tx.id, value: !selectedTxs.includes(tx.id) })
                      }
                    />
                  </div>

                  <Operation
                    tx={tx}
                    validating={validatingTxs.includes(tx.id) || !alreadyValidatedTxs.includes(tx.id)}
                    errorText={invalidTxs.get(tx.id)?.errorText}
                    onClick={() => basketPageModel.events.txClicked(tx)}
                    onTxRemoved={() => basketPageModel.events.removeTxStarted(tx)}
                  />
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {filteredTxs.length === 0 && <EmptyBasket />}

      {validTxs.length === 1 ? <SignOperation /> : <SignOperations />}

      <ConfirmModal
        panelClass="w-[300px]"
        isOpen={validationWarningShown}
        confirmText={t('basket.validationWarning.proceedButton')}
        cancelText={t('basket.validationWarning.cancelButton')}
        onClose={basketPageModel.events.cancelValidationWarning}
        onConfirm={() => basketPageModel.events.proceedValidationWarning({ invalid: [], valid: validTxs })}
      >
        <SmallTitleText align="center">{t('basket.validationWarning.title')}</SmallTitleText>
        <FootnoteText className="mt-2 text-text-tertiary" align="center">
          {t('basket.validationWarning.description')}
        </FootnoteText>
      </ConfirmModal>

      <ConfirmModal
        panelClass="w-[240px]"
        isOpen={Boolean(txToRemove)}
        confirmText={t('basket.removeConfirm.proceedButton')}
        confirmPallet="error"
        cancelText={t('basket.removeConfirm.cancelButton')}
        onClose={basketPageModel.events.removeTxCancelled}
        onConfirm={() => txToRemove && basketPageModel.events.txRemoved(txToRemove)}
      >
        <SmallTitleText align="center">{t('basket.removeConfirm.title')}</SmallTitleText>
        <FootnoteText className="mt-2 text-text-tertiary" align="center">
          {t('basket.removeConfirm.description')}
        </FootnoteText>
      </ConfirmModal>
    </section>
  );
};
