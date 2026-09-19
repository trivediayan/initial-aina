import { appConfig } from '@/constants/config'

export const appStatusService = {
  getPhaseLabel() {
    return appConfig.useMock ? 'Phase 1 scaffold (mock mode)' : 'Phase 1 scaffold (live mode)'
  },
}
