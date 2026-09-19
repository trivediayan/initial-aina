export function createService<TMock, TLive>(
  useMock: boolean,
  mockImpl: TMock,
  liveImpl: TLive,
): TMock | TLive {
  return useMock ? mockImpl : liveImpl
}
