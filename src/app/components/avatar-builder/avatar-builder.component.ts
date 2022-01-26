import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core'
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

  @Input()
  data: Map<AvatarItemType, AvatarCollectionGroup> = new Map()

  @Input()
  allItems: AvatarItem[] = []

  @Output()
  selectedTabChange = new EventEmitter<AvatarBuilderTabs>()

  @Output()
  avatarChange = new EventEmitter<AvatarItem[]>()

  @Output()
  closeClick = new EventEmitter<void>()

  @Output()
  saveClick = new EventEmitter()

  menuItems: MenuItem[] = []

  selectedItems: AvatarItem[] = []

  get selectedCollectionGroups() {
    const menuItem = this.menuItems.find(
      x => x.tab === this.selectedTab,
    )

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

    this.selectedItems = this.allItems.filter(x =>
      this.selectedItemKeys.includes(x.key),
    )
  }

  onTabChange(e: any) {
    this.selectedTab = e.detail.value

    this.selectedTabChange.emit(this.selectedTab)
  }

  selectItem(item: AvatarItem) {
    this.selectedItems = this.selectedItems.filter(
      x => x.type !== item.type,
    )
    this.selectedItems.push(item)

    const items = getOrderedAvatarLayers(this.selectedItems)

    this.avatarChange.emit(items)
  }

  save() {
    this.saveClick.emit()
  }

  close() {
    this.closeClick.emit()
  }

  // helper methods
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
