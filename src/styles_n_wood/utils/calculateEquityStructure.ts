import { ShareholderStake, ShareholderStructureRow } from '../types'

export interface CalculateEquityStructureInput {
  managementRolloverRate: string
  equityPlug: number | undefined
  equityValue: number | undefined
  preDealShareholders: ShareholderStake[]
  ownershipPercentTotal?: number
}

export interface EquityStructureCalculationResult {
  managementRolloverPercent: number
  managementRolloverAmount: number | undefined
  sponsorEquityAmount: number | undefined
  managementPostDealOwnershipPct: number | undefined
  sponsorPostDealOwnershipPct: number | undefined
  preDealStructure: ShareholderStructureRow[]
  postDealStructure: ShareholderStructureRow[]
  totalPreDealEquityValue: number
  totalRolledEquityAmount: number | undefined
}

const clampPercentage = (value: number) => Math.min(Math.max(value, 0), 100)
const sortByOwnershipDesc = (a: ShareholderStructureRow, b: ShareholderStructureRow) =>
  (b.ownershipPercent ?? 0) - (a.ownershipPercent ?? 0)
const getStakeId = (stake: ShareholderStake) => stake.id ?? stake.name

export function calculateEquityStructure({
  managementRolloverRate,
  equityPlug,
  equityValue,
  preDealShareholders,
  ownershipPercentTotal,
}: CalculateEquityStructureInput): EquityStructureCalculationResult {
  const parsedRate = parseFloat(managementRolloverRate)
  const managementRolloverPercent = clampPercentage(Number.isNaN(parsedRate) ? 0 : parsedRate)

  const totalOwnershipPercent = preDealShareholders.reduce((sum, shareholder) => sum + (shareholder.ownershipPercent ?? 0), 0)
  const ownershipPercentDenominator =
    typeof ownershipPercentTotal === 'number' && ownershipPercentTotal > 0 ? ownershipPercentTotal : totalOwnershipPercent
  const hasOwnershipPercents = ownershipPercentDenominator > 0

  const shareholderEntries = preDealShareholders.map((shareholder) => {
    let derivedValue = shareholder.equityValue ?? 0
    if (shareholder.equityValue === undefined && equityValue !== undefined && hasOwnershipPercents && shareholder.ownershipPercent !== undefined) {
      derivedValue = (shareholder.ownershipPercent / ownershipPercentDenominator) * equityValue
    }
    return { shareholder, derivedValue }
  })

  let totalPreDealEquityValue = shareholderEntries.reduce((sum, entry) => sum + entry.derivedValue, 0)
  if (totalPreDealEquityValue === 0 && typeof equityValue === 'number') {
    totalPreDealEquityValue = equityValue
  }

  const preDealStructure: ShareholderStructureRow[] = shareholderEntries
    .map(({ shareholder, derivedValue }) => {
      const percentFromInput = shareholder.ownershipPercent
      const ownershipPercent =
        percentFromInput !== undefined
          ? percentFromInput
          : totalPreDealEquityValue > 0
            ? (derivedValue / totalPreDealEquityValue) * 100
            : undefined

      return {
        id: getStakeId(shareholder),
        name: shareholder.name,
        equityValue: derivedValue,
        ownershipPercent,
        isManagement: shareholder.isManagement,
        exitsFully: shareholder.exitsFully,
      }
    })
    .sort(sortByOwnershipDesc)

  const normalizedEquityPlug = equityPlug === undefined ? undefined : Math.max(equityPlug, 0)

  const lockedEntries = shareholderEntries.filter((entry) => entry.shareholder.lockedPostDealPercent !== undefined)
  const lockedPercentTotal = lockedEntries.reduce((sum, entry) => sum + (entry.shareholder.lockedPostDealPercent ?? 0), 0)
  const lockedContributionAmount =
    normalizedEquityPlug === undefined ? undefined : Math.min((lockedPercentTotal / 100) * normalizedEquityPlug, normalizedEquityPlug)

  const rolloverPoolEntries = shareholderEntries.filter(
    (entry) => !entry.shareholder.exitsFully && entry.shareholder.lockedPostDealPercent === undefined
  )
  const rolloverPoolValue = rolloverPoolEntries.reduce((sum, entry) => sum + entry.derivedValue, 0)
  const managementRolloverBase = (managementRolloverPercent / 100) * rolloverPoolValue

  const equityAvailableForRollover =
    normalizedEquityPlug === undefined ? undefined : Math.max(normalizedEquityPlug - (lockedContributionAmount ?? 0), 0)

  const managementRolloverAmount =
    equityAvailableForRollover === undefined ? undefined : Math.min(managementRolloverBase, rolloverPoolValue, equityAvailableForRollover)

  const sponsorEquityAmount =
    normalizedEquityPlug === undefined
      ? undefined
      : Math.max(normalizedEquityPlug - (managementRolloverAmount ?? 0) - (lockedContributionAmount ?? 0), 0)

  const rolloverDistribution = new Map<string, number | undefined>()
  if (managementRolloverAmount !== undefined) {
    rolloverPoolEntries.forEach((entry) => {
      const share =
        rolloverPoolValue > 0 ? (entry.derivedValue / rolloverPoolValue) * managementRolloverAmount : managementRolloverAmount / rolloverPoolEntries.length || 0
      rolloverDistribution.set(getStakeId(entry.shareholder), share)
    })
  }

  const postDealStructure: ShareholderStructureRow[] = shareholderEntries
    .map(({ shareholder }) => {
      if (shareholder.exitsFully) {
        return undefined
      }

      const lockedPercent = shareholder.lockedPostDealPercent
      const lockedAmount =
        lockedPercent !== undefined && normalizedEquityPlug !== undefined ? (lockedPercent / 100) * normalizedEquityPlug : undefined
      const rolloverAmount = rolloverDistribution.get(getStakeId(shareholder))

      let equityContribution: number | undefined
      if (lockedAmount !== undefined) {
        equityContribution = lockedAmount
      } else if (rolloverAmount !== undefined) {
        equityContribution = rolloverAmount
      } else if (normalizedEquityPlug === undefined) {
        equityContribution = undefined
      } else {
        equityContribution = 0
      }

      const ownershipPercent =
        lockedPercent !== undefined
          ? lockedPercent
          : normalizedEquityPlug && normalizedEquityPlug > 0 && equityContribution !== undefined
            ? (equityContribution / normalizedEquityPlug) * 100
            : undefined

      return {
        id: getStakeId(shareholder),
        name: shareholder.name,
        equityValue: equityContribution,
        ownershipPercent,
        isManagement: shareholder.isManagement,
      }
    })
    .filter((row): row is ShareholderStructureRow => row !== undefined)

  const totalRolledEquityAmount =
    normalizedEquityPlug === undefined ? undefined : normalizedEquityPlug - (sponsorEquityAmount ?? 0)

  postDealStructure.push({
    id: 'sponsor-equity',
    name: 'Sponsor equity',
    equityValue: sponsorEquityAmount,
    ownershipPercent:
      normalizedEquityPlug && normalizedEquityPlug > 0 && sponsorEquityAmount !== undefined
        ? (sponsorEquityAmount / normalizedEquityPlug) * 100
        : undefined,
    isSponsor: true,
  })

  postDealStructure.sort(sortByOwnershipDesc)

  const managementPostDealOwnershipPct =
    normalizedEquityPlug && normalizedEquityPlug > 0 && totalRolledEquityAmount !== undefined
      ? (totalRolledEquityAmount / normalizedEquityPlug) * 100
      : undefined

  const sponsorPostDealOwnershipPct =
    normalizedEquityPlug && normalizedEquityPlug > 0 && sponsorEquityAmount !== undefined
      ? (sponsorEquityAmount / normalizedEquityPlug) * 100
      : managementPostDealOwnershipPct !== undefined
        ? Math.max(100 - managementPostDealOwnershipPct, 0)
        : undefined

  return {
    managementRolloverPercent,
    managementRolloverAmount,
    sponsorEquityAmount,
    managementPostDealOwnershipPct,
    sponsorPostDealOwnershipPct,
    preDealStructure,
    postDealStructure,
    totalPreDealEquityValue,
    totalRolledEquityAmount,
  }
}


