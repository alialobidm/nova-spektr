import { useUnit } from 'effector-react';
import { groupBy, isEqual } from 'lodash';
import { useEffect, useState } from 'react';

import { useI18n } from '@app/providers';
import { type Account, type Chain, type Contact, type ShardAccount, type Wallet } from '@shared/core';
import { useToggle } from '@shared/lib/hooks';
import { RootExplorers, cnTw, includes, isEthereumAccountId, isStringsMatchQuery, toAddress } from '@shared/lib/utils';
import {
  Accordion,
  BodyText,
  Button,
  CaptionText,
  Checkbox,
  FootnoteText,
  HelpText,
  Icon,
  SearchInput,
  SmallTitleText,
  Tabs,
} from '@shared/ui';
import { type TabItem } from '@shared/ui/types';
import { EmptyContactList } from '@entities/contact';
import { matrixModel } from '@entities/matrix';
import { networkUtils } from '@entities/network';
import { ContactItem, ExplorersPopover, WalletCardMd } from '@entities/wallet';
import { CreateContactModal } from '@widgets/ManageContactModal';
import { type ExtendedAccount, type ExtendedContact } from '../common/types';

const enum SignatoryTabs {
  ACCOUNTS = 'accounts',
  CONTACTS = 'contacts',
}

type Props = {
  isActive: boolean;
  accounts: (Account | ShardAccount[])[];
  wallets: Record<Wallet['id'], Wallet>;
  contacts: Contact[];
  chain?: Chain;
  onSelect: (accounts: ExtendedAccount[], contacts: ExtendedContact[]) => void;
};

export const SelectAccountSignatories = ({ isActive, accounts, wallets, contacts, chain, onSelect }: Props) => {
  const { t } = useI18n();

  const matrix = useUnit(matrixModel.$matrix);
  const loginStatus = useUnit(matrixModel.$loginStatus);

  const [query, setQuery] = useState('');
  const [accountsQuery, setAccountsQuery] = useState('');
  const [contactList, setContactList] = useState<ExtendedContact[]>([]);
  const [accountsList, setAccountsList] = useState<Record<Wallet['id'], Array<ExtendedAccount | ExtendedAccount[]>>>(
    {},
  );
  const [isContactModalOpen, toggleContactModalOpen] = useToggle();

  const [selectedAccounts, setSelectedAccounts] = useState<Record<string, ExtendedAccount>>({});
  const [selectedContacts, setSelectedContacts] = useState<Record<string, ExtendedContact>>({});

  const selectedAccountsList = Object.values(selectedAccounts);
  const selectedContactsList = Object.values(selectedContacts);

  useEffect(() => {
    const addressBookContacts = contacts
      .filter((c) => {
        const isEthereumContact = isEthereumAccountId(c.accountId);
        const isEthereumChain = networkUtils.isEthereumBased(chain?.options);

        return c.matrixId && isEthereumContact === isEthereumChain;
      })
      .map((contact, index) => ({ ...contact, index: index.toString() }));

    setContactList(addressBookContacts);
  }, [contacts.length, chain, loginStatus]);

  useEffect(() => {
    setSelectedAccounts({});
    setSelectedContacts({});
  }, [chain]);

  useEffect(() => {
    const extendedAccounts = accounts.reduce<Array<ExtendedAccount | ExtendedAccount[]>>((acc, account) => {
      if (Array.isArray(account)) {
        const toAdd = [] as ExtendedAccount[];

        (account as ShardAccount[]).forEach((a) => {
          const address = toAddress(a.accountId, { prefix: chain?.addressPrefix });

          if (!accountsQuery || isStringsMatchQuery(accountsQuery, [a.accountId, a.name, address])) {
            toAdd.push({
              ...a,
              index: a.accountId.toString(),
              matrixId: matrix.userId,
              address,
            });
          }
        });

        if (toAdd.length > 0) {
          acc.push(toAdd);
        }
      } else {
        const address = toAddress(account.accountId, { prefix: chain?.addressPrefix });

        if (!accountsQuery || isStringsMatchQuery(accountsQuery, [account.accountId, account.name, address])) {
          acc.push({
            ...account,
            index: account.accountId.toString(),
            address: toAddress(account.accountId),
            matrixId: matrix.userId,
          });
        }
      }

      return acc;
    }, []);

    const groupedWithWallet = groupBy(
      extendedAccounts,
      (account) => (account as ExtendedAccount).walletId || (account as ExtendedAccount[])[0].walletId,
    );

    setAccountsList(groupedWithWallet);
  }, [accounts.length, chain?.chainId, accountsQuery, loginStatus]);

  useEffect(() => {
    onSelect(selectedAccountsList, selectedContactsList);
  }, [selectedAccountsList.length, selectedContactsList.length]);

  const selectAccount = (account: ExtendedAccount) => {
    setSelectedAccounts((selectedAccounts) => {
      if (selectedAccounts[account.id]) {
        const { [account.id]: _removedWallet, ...newWallets } = selectedAccounts;

        return newWallets;
      }

      return { ...selectedAccounts, [account.id]: account };
    });
  };

  const selectContact = (contact: ExtendedContact) => {
    setSelectedContacts((selectedContacts) => {
      if (selectedContacts[contact.index]) {
        const { [contact.index]: _removedWallet, ...newContacts } = selectedContacts;

        return newContacts;
      }

      return { ...selectedContacts, [contact.index]: contact };
    });
  };

  const isDisabledContact = (contact: ExtendedContact): boolean => {
    const isThisContact = selectedContactsList.includes(contact);
    const isSameContactSelected = selectedContactsList.some((c) => c.accountId === contact.accountId);
    const isSameAccountSelected = selectedAccountsList.some((w) => w.accountId === contact.accountId);

    return !isThisContact && (isSameContactSelected || isSameAccountSelected);
  };

  const isDisabledAccount = (account: ExtendedAccount): boolean => {
    const isThisAccount = selectedAccountsList.find((a) => isEqual(a, account));
    const isSameContactSelected = selectedContactsList.some((c) => c.accountId === account.accountId);
    const isSameWalletSelected = selectedAccountsList.some((w) => w.accountId === account.accountId);

    return !isThisAccount && (isSameContactSelected || isSameWalletSelected);
  };

  const searchedContactList = contactList.filter((c) => {
    return includes(c.address, query) || includes(c.matrixId, query) || includes(c.name, query);
  });

  const hasAccounts = Boolean(accounts.length);
  const hasContacts = Boolean(contactList.length);

  const selectedAccountsLength = Object.values(selectedAccounts).length;
  const selectedContactsLength = Object.values(selectedContacts).length;

  const AccountsTab = hasAccounts ? (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-y-2">
        <SearchInput
          wrapperClass="mx-2"
          placeholder={t('createMultisigAccount.searchContactPlaceholder')}
          value={accountsQuery}
          onChange={setAccountsQuery}
        />

        {Object.entries(accountsList).map(([walletId, accounts]) => {
          const wallet = wallets[Number(walletId)];

          return (
            <li key={walletId}>
              <WalletCardMd className="px-2 py-[7px]" wallet={wallet} />

              <div className="pl-6">
                {accounts.map((account) => {
                  if (Array.isArray(account)) {
                    return (
                      //eslint-disable-next-line i18next/no-literal-string
                      <Accordion key={`${walletId}_sharded_${account[0].id}`} className="pl-8">
                        <Accordion.Button buttonClass="px-1.5 py-2">
                          <div className="flex items-center gap-x-2">
                            <div
                              className={cnTw(
                                'flex h-4 items-center justify-center rounded-[30px] px-1.5',
                                'bg-input-background-disabled',
                              )}
                            >
                              <CaptionText className="text-text-secondary">{account.length}</CaptionText>
                            </div>
                            <BodyText className="text-text-secondary">{account[0].name}</BodyText>
                          </div>
                        </Accordion.Button>
                        <Accordion.Content as="ul">
                          {account.map((a) => {
                            const disabled = isDisabledAccount(a);

                            return (
                              <li
                                key={`${a.id}_shard_${walletId}`}
                                className={cnTw(
                                  'rounded-md py-1.5 pl-8',
                                  !disabled && 'hover:bg-action-background-hover',
                                )}
                              >
                                <Checkbox
                                  checked={!!selectedAccounts[a.id]}
                                  disabled={disabled}
                                  onChange={() => selectAccount(a)}
                                >
                                  <ExplorersPopover
                                    address={a.accountId}
                                    explorers={RootExplorers}
                                    button={
                                      <ContactItem
                                        addressPrefix={chain?.addressPrefix}
                                        hideAddress
                                        name={toAddress(a.accountId, { prefix: chain?.addressPrefix, chunk: 7 })}
                                        address={a.accountId}
                                      />
                                    }
                                  />
                                </Checkbox>
                              </li>
                            );
                          })}
                        </Accordion.Content>
                      </Accordion>
                    );
                  }

                  const disabled = isDisabledAccount(account);

                  return (
                    <li
                      key={`${account.id}_${walletId}`}
                      className={cnTw('rounded-md px-2 py-1.5', !disabled && 'hover:bg-action-background-hover')}
                    >
                      <Checkbox
                        checked={!!selectedAccounts[account.id]}
                        disabled={disabled}
                        onChange={() => selectAccount(account)}
                      >
                        <ExplorersPopover
                          address={account.accountId}
                          explorers={RootExplorers}
                          button={
                            <ContactItem
                              addressPrefix={chain?.addressPrefix}
                              name={account.name}
                              address={account.accountId}
                            />
                          }
                        />
                      </Checkbox>
                    </li>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  ) : (
    <EmptyContactList description={t('createMultisigAccount.noWalletsLabel')} />
  );

  const ContactsTab = (
    <div>
      <div className="mb-4 flex items-center gap-x-4 px-2">
        <SearchInput
          wrapperClass="flex-1"
          placeholder={t('createMultisigAccount.searchContactPlaceholder')}
          value={query}
          onChange={setQuery}
        />
        {hasContacts && (
          <Button variant="text" suffixElement={<Icon name="add" size={16} />} onClick={toggleContactModalOpen}>
            {t('createMultisigAccount.addContact')}
          </Button>
        )}
      </div>

      {hasContacts ? (
        <ul className="flex flex-col gap-y-2">
          {searchedContactList.map((contact) => {
            const disabled = isDisabledContact(contact);

            return (
              <li
                key={contact.index + '_contacts'}
                className={cnTw('rounded-md px-2 py-1.5', !disabled && 'hover:bg-action-background-hover')}
              >
                <Checkbox
                  checked={Boolean(selectedContacts[contact.index]) || false}
                  disabled={disabled}
                  onChange={() => selectContact(contact)}
                >
                  <ExplorersPopover
                    address={contact.accountId}
                    explorers={RootExplorers}
                    button={
                      <ContactItem
                        addressPrefix={chain?.addressPrefix}
                        name={contact.name}
                        address={contact.accountId}
                      />
                    }
                  >
                    <ExplorersPopover.Group
                      active={Boolean(contact.matrixId)}
                      title={t('general.explorers.matrixIdTitle')}
                    >
                      <HelpText className="break-all text-text-secondary">{contact.matrixId}</HelpText>
                    </ExplorersPopover.Group>
                  </ExplorersPopover>
                </Checkbox>
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyContactList onNewContact={toggleContactModalOpen} />
      )}
    </div>
  );

  const TabItems: TabItem[] = [
    {
      id: SignatoryTabs.ACCOUNTS,
      panel: AccountsTab,
      title: (
        <>
          {t('createMultisigAccount.accountsTab')}
          {selectedAccountsLength > 0 && (
            <FootnoteText as="span" className="ml-1 text-text-tertiary">
              {selectedAccountsLength}
            </FootnoteText>
          )}
        </>
      ),
    },
    {
      id: SignatoryTabs.CONTACTS,
      panel: ContactsTab,
      title: (
        <>
          {t('createMultisigAccount.contactsTab')}
          {selectedContactsLength > 0 && (
            <FootnoteText as="span" className="ml-1 text-text-tertiary">
              {selectedContactsLength}
            </FootnoteText>
          )}
        </>
      ),
    },
  ];

  return (
    <>
      <div className={cnTw('flex max-h-full flex-1 flex-col', !isActive && 'hidden')}>
        <SmallTitleText className="mb-4 px-2 py-2">{t('createMultisigAccount.signatoryTitle')}</SmallTitleText>

        <Tabs
          items={TabItems}
          unmount={false}
          panelClassName="mt-4 flex-1 overflow-y-auto"
          tabClassName="flex-inline"
          tabsClassName="mx-2"
        />
      </div>

      <CreateContactModal isOpen={isContactModalOpen} onClose={toggleContactModalOpen} />
    </>
  );
};
