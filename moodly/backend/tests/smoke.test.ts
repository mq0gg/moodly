// v0.1 placeholder: proves the CI pipeline (lint → typecheck → test) is
// wired correctly (B-05). The real matching-function suite — T-01 to T-20,
// built by input space partitioning per the Test Plan — arrives in v0.2
// (B-16, B-17) once src/api/recipe/services/matching.ts exists.

describe('CI pipeline smoke test', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
