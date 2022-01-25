import { AvatarItem } from './avatar.types'

export function getOrderedAvatarLayers(items: AvatarItem[]) {
  return items.slice().sort((a, b) => a.type - b.type)
}
