import { render, screen, act } from '@testing-library/react';
import { fork } from 'effector';
import { Provider } from 'effector-react';

import { TEST_ACCOUNT_ID } from '@shared/lib/utils';
import { Operations } from './Operations';
import { networkModel } from '@entities/network';

jest.mock('@app/providers', () => ({
  useI18n: jest.fn().mockReturnValue({
    t: (key: string) => key,
  }),
}));

jest.mock('@entities/multisig', () => ({
  useMultisigTx: jest.fn().mockReturnValue({
    getLiveAccountMultisigTxs: () => [{ name: 'Test Wallet', accountId: TEST_ACCOUNT_ID, chainId: '0x00' }],
  }),
  useMultisigEvent: jest.fn().mockReturnValue({
    getLiveEventsByKeys: jest.fn().mockResolvedValue([]),
  }),
}));

jest.mock('./components/Operation', () => () => 'Operation');
jest.mock('@features/operation', () => ({
  OperationsFilter: () => 'filter',
}));

describe('pages/Operations', () => {
  test('should render component', async () => {
    const scope = fork({
      values: new Map().set(networkModel.$chains, {
        '0x00': {
          name: 'Westend',
        },
      }),
    });

    await act(async () => {
      render(
        <Provider value={scope}>
          <Operations />
        </Provider>,
      );
    });

    const title = screen.getByText('operations.title');
    const filter = screen.getByText('filter');

    expect(title).toBeInTheDocument();
    expect(filter).toBeInTheDocument();
  });
});
