import { allSettled, fork } from 'effector';

import { contactModel } from '@entities/contact';
import { filterModel } from '../contact-filter';

const contacts = [
  {
    id: 1,
    name: 'name 1',
    address: '222',
    accountId: '0x333',
    matrixId: '@444',
  },
  {
    id: 5,
    name: 'name 6',
    address: '777',
    accountId: '0x888',
    matrixId: '@999',
  },
];

describe('features/contacts/model/contact-filter-model', () => {
  test('should return all contacts if no search query', () => {
    const scope = fork({
      values: new Map().set(contactModel.$contacts, contacts),
    });

    expect(scope.getState(filterModel.$contactsFiltered)).toEqual(contacts);
  });

  test('should return nothing if there is no match', async () => {
    const scope = fork({
      values: new Map().set(contactModel.$contacts, contacts),
    });

    await allSettled(filterModel.events.queryChanged, { scope, params: 'nothing' });

    expect(scope.getState(filterModel.$contactsFiltered)).toHaveLength(0);
  });

  test('should search by name', async () => {
    const scope = fork({
      values: new Map().set(contactModel.$contacts, contacts),
    });

    await allSettled(filterModel.events.queryChanged, { scope, params: contacts[0].name });

    expect(scope.getState(filterModel.$contactsFiltered)).toEqual([contacts[0]]);
  });

  test('should search by address', async () => {
    const scope = fork({
      values: new Map().set(contactModel.$contacts, contacts),
    });

    await allSettled(filterModel.events.queryChanged, { scope, params: contacts[0].address });

    expect(scope.getState(filterModel.$contactsFiltered)).toEqual([contacts[0]]);
  });

  test('should search by matrix id', async () => {
    const scope = fork({
      values: new Map().set(contactModel.$contacts, contacts),
    });

    await allSettled(filterModel.events.queryChanged, { scope, params: contacts[1].matrixId });

    expect(scope.getState(filterModel.$contactsFiltered)).toEqual([contacts[1]]);
  });
});
