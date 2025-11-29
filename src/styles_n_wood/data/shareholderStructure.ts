import { ShareholderStake } from '../types'

/**
 * Default pre-deal shareholder breakdown based on the provided cap table.
 * Ownership percentages will be scaled to 100% if needed.
 */
export const preDealShareholders: ShareholderStake[] = [
  { id: '3i', name: '3i Group', ownershipPercent: 36.5, isManagement: false, exitsFully: true },
  { id: 'g-quiligotti', name: 'Gerard Quiligotti', ownershipPercent: 37.465, isManagement: true },
  { id: 'astle', name: 'Astle Holdings (Fawcett)', ownershipPercent: 12.7, isManagement: true },
  { id: 'g-clark', name: 'Graham Clark', ownershipPercent: 4.445, isManagement: true },
  { id: 'm-raftery', name: 'Martin Raftery', ownershipPercent: 4.445, isManagement: true },
  { id: 'd-howarth', name: 'David Howarth', ownershipPercent: 4.445, isManagement: true },
  { id: 'employee-pool', name: 'Employee Pool (authorised not issued)', ownershipPercent: 5.0, isManagement: true, lockedPostDealPercent: 5 },
]

export const preDealShareholderMeta = {
  dateLabel: 'Pre-2004 Secondary Buyout',
  ownershipPercentTotal: 100,
  equitySponsorName: 'Aberdeen',
}


