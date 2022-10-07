import { act, render, renderHook, screen } from '@testing-library/react';

import { ConnectionType } from '@renderer/domain/connection';
import { useBalance } from '@renderer/services/balance/balanceService';
import { useNetwork } from '@renderer/services/network/networkService';
import { NetworkContext, NetworkProvider, useNetworkContext } from './NetworkContext';

jest.mock('@renderer/services/network/networkService', () => ({
  useNetwork: jest.fn().mockReturnValue({
    connections: {},
    setupConnections: jest.fn(),
  }),
}));

jest.mock('@renderer/services/balance/balanceService', () => ({
  useBalance: jest.fn().mockReturnValue({
    subscribeBalances: jest.fn(),
    subscribeLockBalances: jest.fn(),
  }),
}));

jest.mock('@renderer/services/wallet/walletService', () => ({
  useWallet: jest.fn().mockReturnValue({
    getActiveWallets: jest.fn(),
  }),
}));

describe('context/NetworkContext', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should render children', async () => {
    await act(async () => {
      render(<NetworkProvider>children</NetworkProvider>);
    });

    expect(screen.getByText('children')).toBeInTheDocument();
  });

  test('should setup connections', async () => {
    const spySetupConnections = jest.fn();
    (useNetwork as jest.Mock).mockImplementation(() => ({
      connections: {},
      setupConnections: spySetupConnections,
    }));

    await act(async () => {
      render(<NetworkProvider>children</NetworkProvider>);
    });

    expect(spySetupConnections).toBeCalled();
  });

  test('should connect to available networks', async () => {
    const spyConnectToNetwork = jest.fn();
    const connection = { chainId: '0x123', connectionType: ConnectionType.RPC_NODE };

    (useNetwork as jest.Mock).mockImplementation(() => ({
      connections: { [connection.chainId]: { connection } },
      setupConnections: jest.fn(),
      connectToNetwork: spyConnectToNetwork,
    }));

    await act(async () => {
      render(<NetworkProvider>children</NetworkProvider>);
    });

    expect(spyConnectToNetwork).toBeCalledTimes(1);
    expect(spyConnectToNetwork).toBeCalledWith(connection.chainId, connection.connectionType, undefined);
  });

  test('should start balance subscription', async () => {
    const spySubscribeBalances = jest.fn();
    const spySubscribeLockBalances = jest.fn();
    const connection = { chainId: '0x123', connectionType: ConnectionType.RPC_NODE };

    (useNetwork as jest.Mock).mockImplementation(() => ({
      connections: { [connection.chainId]: { api: { isConnected: true }, connection } },
      setupConnections: jest.fn(),
      connectToNetwork: jest.fn(),
    }));
    (useBalance as jest.Mock).mockImplementation(() => ({
      subscribeBalances: spySubscribeBalances,
      subscribeLockBalances: spySubscribeLockBalances,
    }));

    await act(async () => {
      render(<NetworkProvider>children</NetworkProvider>);
    });

    expect(spySubscribeBalances).toBeCalled();
    expect(spySubscribeLockBalances).toBeCalled();
  });
});

describe('context/NetworkContext/useNetworkContext', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should have defined functions', () => {
    (useNetwork as jest.Mock).mockImplementation(() => ({
      connections: {},
      connectToNetwork: jest.fn(),
      addRpcNode: jest.fn(),
      removeRpcNode: jest.fn(),
      validateRpcNode: jest.fn(),
    }));
    const wrapper = ({ children }: any) => {
      const { setupConnections, ...rest } = useNetwork();

      return <NetworkContext.Provider value={rest}>{children}</NetworkContext.Provider>;
    };

    const { result } = renderHook(() => useNetworkContext(), { wrapper });
    const { connections, connectToNetwork, addRpcNode, removeRpcNode, validateRpcNode } = result.current;
    expect(connections).toBeDefined();
    expect(connectToNetwork).toBeDefined();
    expect(addRpcNode).toBeDefined();
    expect(removeRpcNode).toBeDefined();
    expect(validateRpcNode).toBeDefined();
  });
});