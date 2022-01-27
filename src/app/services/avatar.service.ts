import { EventEmitter, Injectable } from '@angular/core'
import { ModalController, ToastController } from '@ionic/angular'
import { ethers } from 'ethers'
import mergeImages from 'merge-images'
import { environment } from 'src/environments/environment'
import { AvatarBuilderComponent } from '../components/avatar-builder/avatar-builder.component'
import { commonAvatarLayers } from '../data/commonAvatarLayers.data'
import {
  AvatarBuilderTabs,
  AvatarCollectionGroup,
  AvatarItem,
  AvatarItemType,
} from '../domain/avatar.types'

@Injectable()
export class AvatarService {
  data: Map<AvatarItemType, AvatarCollectionGroup> = new Map()
  allItems: AvatarItem[] = []
  isDraft = false

  private defaultKeys = [
    'common/skin_1b',
    'common/hair_2',
    'common/eyes_1',
    'common/mouth_2',
    'common/clothes_22',
  ]
  private avatarCache: Map<string, string> = new Map()

  constructor(
    private modal: ModalController,
    private toast: ToastController,
  ) {
    this.loadData()
  }

  getItemKeys(address: string) {
    let selectedItemKeysString = localStorage.getItem(
      'config.' + address,
    )

    if (!selectedItemKeysString) {
      // fallback to "no account configuration", if such exists
      selectedItemKeysString = localStorage.getItem('config.')
    }

    const selectedItemKeys = selectedItemKeysString
      ? selectedItemKeysString.split(',')
      : address
      ? getDefaultAvatarKeysByAddress(address)
      : this.defaultKeys

    return selectedItemKeys
  }

  getAvatarImage(address: string) {
    let image = this.avatarCache.get(address) ?? null
    if (image) {
      return image
    }

    image = localStorage.getItem('image.' + address)
    this.avatarCache.set(address, image!)

    return image
  }

  async ensureAvatarImageExists(address: string) {
    if (!!localStorage.getItem('config.' + address)) {
      return
    }

    this.updateDraftState(address)

    const keys = this.getItemKeys(address)

    await this.setItemsByKeys(address, keys)
  }

  async setItemsByKeys(address: string, keys: string[]) {
    const items = this.allItems.filter(x => keys.includes(x.key))

    await this.setItems(address, items)

    return items
  }

  updateDraftState(address: string) {
    const lastSavedKeys = localStorage.getItem(
      'savedConfig.' + address,
    )
    let lastChangedKeys = localStorage.getItem('config.' + address)
    if (lastChangedKeys) {
      lastChangedKeys = lastChangedKeys.split(',').sort().join(',')
    }

    this.isDraft = !lastSavedKeys || lastSavedKeys !== lastChangedKeys
  }

  async setItems(address: string, items: AvatarItem[]) {
    localStorage.setItem(
      'config.' + address,
      items.map(x => x.key).join(','),
    )

    const avatarImage = await mergeImages(
      items
        .slice()
        .sort((a, b) => a.type - b.type)
        .map(x => x.url),
    )

    localStorage.setItem('image.' + address, avatarImage)
    this.avatarCache.set(address, avatarImage)
  }

  async openAvatarBuilder(address: string) {
    const savedKeysString = localStorage.getItem(
      'savedConfig.' + address,
    )

    const selectedItemKeys = this.getItemKeys(address)

    const onTabChange = new EventEmitter()
    onTabChange.subscribe(x => {
      localStorage.setItem('jok.builderTab', x)
    })

    const onAvatarChange = new EventEmitter<AvatarItem[]>()
    onAvatarChange.subscribe(items => {
      this.setItems(address, items)

      isSaved =
        savedKeysString ===
        items
          .map(x => x.key)
          .slice()
          .sort()
          .join(',')
    })

    const onClose = new EventEmitter<AvatarItem[]>()
    onClose.subscribe(() => modalView.dismiss())

    const onSave = new EventEmitter<AvatarItem[]>()
    onSave.subscribe(async () => {
      try {
        const isSuccess = await this.signAndSave(
          address,
          this.getItemKeys(address),
        )

        if (isSuccess) {
          isSaved = true
          const toastView = await this.toast.create({
            message: 'Saved Successfully!',
            position: 'top',
            duration: 2000,
            color: 'light',
          })

          toastView.onclick = () => toastView.dismiss()
          toastView.present()

          modalView.dismiss()
        }
      } catch (err) {
        console.error(err)
      }
    })

    const onUndo = new EventEmitter<AvatarItem[]>()
    onUndo.subscribe(async () => {
      const lastSavedKeys = localStorage.getItem(
        'savedConfig.' + address,
      )

      if (!lastSavedKeys) {
        return
      }

      localStorage.setItem('config.' + address, lastSavedKeys)
      this.setItemsByKeys(address, lastSavedKeys.split(','))

      modalView.dismiss()
    })

    const selectedTab =
      localStorage.getItem('jok.builderTab') ?? AvatarBuilderTabs.SKIN

    let isSaved =
      savedKeysString === selectedItemKeys.slice().sort().join(',')

    const modalView = await this.modal.create({
      component: AvatarBuilderComponent,
      swipeToClose: true,
      componentProps: {
        selectedItemKeys,
        selectedTab,
        data: this.data,
        allItems: this.allItems,
        isSaved: () => isSaved,
        selectedTabChange: onTabChange,
        avatarChange: onAvatarChange,
        closeClick: onClose,
        saveClick: onSave,
        undoClick: onUndo,
      },
    })

    modalView.addEventListener('willDismiss', () => {
      this.updateDraftState(address)
    })

    modalView.present()
  }

  private async signAndSave(address: string, keys: string[]) {
    const provider = new ethers.providers.Web3Provider(
      (window as any).ethereum,
    )

    const signer = provider.getSigner()

    const message = [address, ...keys].join('\n')

    const signature = await signer.signMessage(message)

    // const signerAddr = await ethers.utils.verifyMessage(
    //   message,
    //   signature,
    // )

    const result = await fetch(
      `${environment.avatarServiceUrl}/config`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          address,
          keys,
          signature,
        }),
      },
    )

    if (result.status === 200) {
      localStorage.setItem(
        'savedConfig.' + address,
        keys.slice().sort().join(','),
      )

      return true
    }

    return true
  }

  private loadData() {
    this.data.clear()

    this.loadCommonItems()

    this.allItems = [...this.data.values()].flatMap(x =>
      x.collections.flatMap(y => y.items),
    )
  }

  private loadCommonItems() {
    this.data.set(AvatarItemType.SKIN, {
      name: 'Skin',
      collections: [
        {
          name: '',
          items: commonAvatarLayers.skin.map(x => ({
            type: AvatarItemType.SKIN,
            level: 'COMMON',
            key: `common/skin_${x[0]}`,
            url: x[1],
          })),
        },
      ],
    })

    this.data.set(AvatarItemType.HAIR, {
      name: 'Hair',
      collections: [
        {
          name: '',
          items: commonAvatarLayers.hair.map(x => ({
            type: AvatarItemType.HAIR,
            level: 'COMMON',
            key: `common/hair_${x[0]}`,
            url: x[1],
          })),
        },
      ],
    })

    this.data.set(AvatarItemType.FACIAL_HAIR, {
      name: 'Facial Hair',
      collections: [
        {
          name: '',
          items: commonAvatarLayers.facialHair.map(x => ({
            type: AvatarItemType.FACIAL_HAIR,
            level: 'COMMON',
            key: `common/facialHair_${x[0]}`,
            url: x[1],
          })),
        },
      ],
    })

    this.data.set(AvatarItemType.EYES, {
      name: 'Eyes',
      collections: [
        {
          name: '',
          items: commonAvatarLayers.eyes.map(x => ({
            type: AvatarItemType.EYES,
            level: 'COMMON',
            key: `common/eyes_${x[0]}`,
            url: x[1],
          })),
        },
      ],
    })

    this.data.set(AvatarItemType.EYEBROWS, {
      name: 'Eyebrows',
      collections: [
        {
          name: '',
          items: commonAvatarLayers.eyebrows.map(x => ({
            type: AvatarItemType.EYEBROWS,
            level: 'COMMON',
            key: `common/eyebrows_${x[0]}`,
            url: x[1],
          })),
        },
      ],
    })

    this.data.set(AvatarItemType.MOUTH, {
      name: 'Mouth',
      collections: [
        {
          name: '',
          items: commonAvatarLayers.mouth.map(x => ({
            type: AvatarItemType.MOUTH,
            level: 'COMMON',
            key: `common/mouth_${x[0]}`,
            url: x[1],
          })),
        },
      ],
    })

    this.data.set(AvatarItemType.CLOTHES, {
      name: 'Clothes',
      collections: [
        {
          name: '',
          items: commonAvatarLayers.clothes.map(x => ({
            type: AvatarItemType.CLOTHES,
            level: 'COMMON',
            key: `common/clothes_${x[0]}`,
            url: x[1],
          })),
        },
      ],
    })

    this.data.set(AvatarItemType.ACCESSORIES, {
      name: 'Accessories',
      collections: [
        {
          name: '',
          items: commonAvatarLayers.accessories.map(x => ({
            type: AvatarItemType.ACCESSORIES,
            level: 'COMMON',
            key: `common/accessories_${x[0]}`,
            url: x[1],
          })),
        },
      ],
    })
  }
}

function getDefaultAvatarKeysByAddress(address: string): string[] {
  let addressNumber = parseInt(address.slice(2), 16)

  const eyesOptions = [
    'common/eyes_1',
    'common/eyes_2',
    'common/eyes_3',
    'common/eyes_4',
    'common/eyes_5',
    'common/eyes_6',
    'common/eyes_7',
    'common/eyes_8',
  ]

  const hairOptions = [
    'common/hair_2',
    'common/hair_4',
    'common/hair_7',
  ]

  const mouthOptions = [
    'common/mouth_2',
    'common/mouth_5',
    'common/mouth_6',
    'common/mouth_9',
    'common/mouth_12',
    'common/mouth_13',
    'common/mouth_15',
  ]

  console.log('addressNumber', addressNumber)

  const eyesKey = eyesOptions[addressNumber % eyesOptions.length]

  addressNumber = Math.round(addressNumber / 10000)
  const hairKey = hairOptions[addressNumber % hairOptions.length]

  addressNumber = Math.round(addressNumber / 10000)
  const mouthKey = mouthOptions[addressNumber % mouthOptions.length]

  return [
    'common/skin_1b',
    hairKey,
    eyesKey,
    mouthKey,
    'common/clothes_22',
  ]
}
