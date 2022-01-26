import { EventEmitter, Injectable } from '@angular/core'
import { ModalController } from '@ionic/angular'
import mergeImages from 'merge-images'
import { AvatarBuilderComponent } from '../components/avatar-builder/avatar-builder.component'
import { AvatarBuilderTabs, AvatarItem } from '../domain/avatar.types'

@Injectable()
export class AvatarService {
  private defaultKeys = [
    'common/skin_1b',
    'common/hair_2',
    'common/eyes_1',
    'common/mouth_2',
    'common/clothes_22',
  ]
  private avatarCache: Map<string, string> = new Map()

  constructor(private modal: ModalController) {}

  getItemKeys(address: string) {
    let selectedItemKeysString = localStorage.getItem(
      'avatarConfig.' + address,
    )

    if (!selectedItemKeysString) {
      // fallback to "no account configuration", if such exists
      selectedItemKeysString = localStorage.getItem('avatarConfig.')
    }

    const selectedItemKeys = selectedItemKeysString
      ? selectedItemKeysString.split(',')
      : this.defaultKeys

    return selectedItemKeys
  }

  getAvatarImage(address: string) {
    let image = this.avatarCache.get(address) ?? null
    if (image) {
      return image
    }

    image = localStorage.getItem('avatarImage.' + address)
    this.avatarCache.set(address, image!)

    return image
  }

  async setItems(address: string, items: AvatarItem[]) {
    localStorage.setItem(
      'avatarConfig.' + address,
      items.map(x => x.key).join(','),
    )

    const avatarImage = await mergeImages(items.map(x => x.url))

    localStorage.setItem('avatarImage.' + address, avatarImage)
    this.avatarCache.set(address, avatarImage)
  }

  async openAvatarBuilder(address: string) {
    const onTabChange = new EventEmitter()
    onTabChange.subscribe(x => {
      localStorage.setItem('jok.builderTab', x)
    })

    const onAvatarChange = new EventEmitter<AvatarItem[]>()
    onAvatarChange.subscribe(items => this.setItems(address, items))

    const selectedTab =
      localStorage.getItem('jok.builderTab') ?? AvatarBuilderTabs.SKIN

    const selectedItemKeys = this.getItemKeys(address)

    const modalView = await this.modal.create({
      component: AvatarBuilderComponent,
      swipeToClose: true,
      componentProps: {
        selectedItemKeys,
        selectedTab,
        selectedTabChange: onTabChange,
        avatarChange: onAvatarChange,
      },
    })

    modalView.present()
  }
}
