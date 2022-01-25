import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core'
import { commonAvatarLayers } from '../../data/commonAvatarLayers.data'
import {
  AvatarBuilderTabs,
  AvatarCollectionGroup,
  AvatarItem,
  AvatarItemType,
} from '../../domain/avatar.types'
import { getOrderedAvatarLayers } from '../../domain/getOrderedAvatarLayers'

@Component({
  selector: 'app-avatar-builder',
  templateUrl: './avatar-builder.component.html',
  styleUrls: ['./avatar-builder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarBuilderComponent implements OnInit {
  @Input()
  selectedItemKeys: string[] = []

  @Input()
  selectedTab = AvatarBuilderTabs.SKIN

  @Output()
  selectedTabChange = new EventEmitter<AvatarBuilderTabs>()

  data: Map<AvatarItemType, AvatarCollectionGroup> = new Map()
  allItems: AvatarItem[] = []

  menuItems: MenuItem[] = []

  selectedItems: AvatarItem[] = []

  get selectedCollectionGroups() {
    const menuItem = this.menuItems.find(
      x => x.tab === this.selectedTab,
    )

    console.log(menuItem, this.selectedTab)

    return <AvatarCollectionGroup[]>(
      (
        menuItem?.avatarLayerTypes.map(x => this.data.get(x)) ?? []
      ).filter(x => !!x)
    )
  }

  get layers() {
    const items = getOrderedAvatarLayers(this.selectedItems)

    return items.map(x => x.url)
  }

  constructor() {}

  ngOnInit() {
    this.menuItems = [
      {
        tab: AvatarBuilderTabs.SKIN,
        title: 'Skin',
        avatarLayerTypes: [AvatarItemType.SKIN],
      },
      {
        tab: AvatarBuilderTabs.HAIR,
        title: 'Hair',
        avatarLayerTypes: [
          AvatarItemType.HAIR,
          AvatarItemType.FACIAL_HAIR,
        ],
      },
      {
        tab: AvatarBuilderTabs.EYES,
        title: 'Eyes',
        avatarLayerTypes: [
          AvatarItemType.EYES,
          AvatarItemType.EYEBROWS,
        ],
      },
      {
        tab: AvatarBuilderTabs.MOUTH,
        title: 'Mouth',
        avatarLayerTypes: [AvatarItemType.MOUTH],
      },
      {
        tab: AvatarBuilderTabs.CLOTHES,
        title: 'Clothes',
        avatarLayerTypes: [AvatarItemType.CLOTHES],
      },
      {
        tab: AvatarBuilderTabs.ACCESSORIES,
        title: 'Accessories',
        avatarLayerTypes: [AvatarItemType.ACCESSORIES],
      },
    ]

    this.loadData()

    this.allItems = [...this.data.values()].flatMap(x =>
      x.collections.flatMap(y => y.items),
    )

    this.selectedItems = this.allItems.filter(x =>
      this.selectedItemKeys.includes(x.key),
    )
  }

  onTabChange(e: any) {
    console.log(e.detail.value)
    this.selectedTab = e.detail.value

    this.selectedTabChange.emit(this.selectedTab)
  }

  selectItem(item: AvatarItem) {
    this.selectedItems = this.selectedItems.filter(
      x => x.type !== item.type,
    )
    this.selectedItems.push(item)
  }

  // helper methods
  loadData() {
    this.data.clear()

    this.loadCommonItems()
  }

  loadCommonItems() {
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

  isSelected(item: AvatarItem) {
    return !!this.selectedItems.find(x => x.key === item.key)
  }

  getBackgroundImage(item: AvatarItem) {
    return `url('${item.url}')`
  }
}

type MenuItem = {
  tab: AvatarBuilderTabs
  title: string
  avatarLayerTypes: AvatarItemType[]
}
