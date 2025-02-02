import { type OngoingReferendum, ReferendumType } from '@shared/core';
import { type AggregatedReferendum, VoteStatus } from '@features/governance';
import { governancePageUtils } from '../governancePageUtils';

describe('pages/Governance/lib/governancePageUtils', () => {
  const referendums: AggregatedReferendum[] = [
    {
      type: ReferendumType.Approved,
      referendumId: '111',
      since: 0,
      title: 'Referendum Title 1',
      approvalThreshold: null,
      supportThreshold: null,
      isVoted: false,
      submissionDeposit: null,
    },
    {
      type: ReferendumType.Approved,
      referendumId: '222',
      since: 0,
      title: 'Referendum Title 2',
      approvalThreshold: null,
      supportThreshold: null,
      isVoted: false,
      submissionDeposit: null,
    },
  ];

  const createVotingReferendum = (isVoted: boolean) => {
    return {
      isVoted,
      type: ReferendumType.Ongoing,
      track: '1',
    } as AggregatedReferendum<OngoingReferendum>;
  };

  const referendum = {
    isVoted: true,
    type: ReferendumType.Ongoing,
    track: '1',
  } as AggregatedReferendum<OngoingReferendum>;

  test.each([
    { referendums, query: '', expected: referendums },
    { referendums, query: '111', expected: referendums.filter(({ referendumId }) => referendumId === '111') },
    { referendums, query: '222', expected: referendums.filter(({ referendumId }) => referendumId === '222') },
    { referendums, query: 'none', expected: [] },
  ])('should return correct referendums if query is "$query"', ({ referendums, query, expected }) => {
    const result = governancePageUtils.filteredByQuery({ referendums, query });
    expect(result).toEqual(expected);
  });

  test.each([
    { referendum: createVotingReferendum(true), selectedVoteId: VoteStatus.VOTED, expected: true },
    { referendum: createVotingReferendum(false), selectedVoteId: VoteStatus.VOTED, expected: false },
    { referendum: createVotingReferendum(true), selectedVoteId: VoteStatus.NOT_VOTED, expected: false },
    { referendum: createVotingReferendum(false), selectedVoteId: VoteStatus.NOT_VOTED, expected: true },
  ])(
    'should return $expected if selectedVoteId is $selectedVoteId and referendum.isVoted is $referendum.isVoted',
    ({ referendum, selectedVoteId, expected }) => {
      const result = governancePageUtils.isReferendumVoted({ selectedVoteId, referendum });
      expect(result).toEqual(expected);
    },
  );

  test('should return true if selectedTrackIds is empty', () => {
    const result = governancePageUtils.isReferendumInTrack([], referendum);
    expect(result).toEqual(true);
  });

  test('should return true if referendum track is in selectedTrackIds', () => {
    const result = governancePageUtils.isReferendumInTrack(['0', '1'], referendum);
    expect(result).toEqual(true);
  });

  test('should return false if referendum track is not in selectedTrackIds', () => {
    const result = governancePageUtils.isReferendumInTrack(['999'], referendum);
    expect(result).toEqual(false);
  });
});
