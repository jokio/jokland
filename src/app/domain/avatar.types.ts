export type AvatarCollectionGroup = {
  name: string
  collections: AvatarCollection[]
}

export type AvatarCollection = {
  name: string
  items: AvatarItem[]
}

export type AvatarItem = {
  type: AvatarItemType
  level: AvatarItemLevel
  key: string
  url: string
}

export enum AvatarBuilderTabs {
  SKIN = 'SKIN',
  EYES = 'EYES',
  HAIR = 'HAIR',
  MOUTH = 'MOUTH',
  CLOTHES = 'CLOTHES',
  ACCESSORIES = 'ACCESSORIES',
}

export enum AvatarItemType {
  SKIN = 10,
  TATTOO = 20,
  EYES = 30,
  MOUTH = 40,
  EYEBROWS = 50,
  CLOTHES = 60,
  FACIAL_HAIR = 70,
  HAIR = 80,
  ACCESSORIES = 90,
  EARRING = 100,
  HAT = 110,
  GLASSES = 120,
  FACE_MASK = 130,
  FACE_OVERLAY = 140,
  CORNER_ITEM = 150,
}

export type AvatarItemLevel = 'COMMON'
