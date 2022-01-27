import {
  AfterViewInit,
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core'
import { IonSegment } from '@ionic/angular'
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
export class AvatarBuilderComponent implements OnInit, AfterViewInit {
  @Input()
  selectedItemKeys: string[] = []

  @Input()
  selectedTab = AvatarBuilderTabs.SKIN

  @Input()
  data: Map<AvatarItemType, AvatarCollectionGroup> = new Map()

  @Input()
  allItems: AvatarItem[] = []

  @Input()
  isWalletConnected = false

  @Input()
  isSaved = () => false

  @Output()
  selectedTabChange = new EventEmitter<AvatarBuilderTabs>()

  @Output()
  avatarChange = new EventEmitter<AvatarItem[]>()

  @Output()
  closeClick = new EventEmitter<void>()

  @Output()
  saveClick = new EventEmitter()

  @Output()
  undoClick = new EventEmitter()

  @Output()
  shareClick = new EventEmitter()

  @Output()
  downloadClick = new EventEmitter()

  @ViewChild(IonSegment, { read: ElementRef })
  ionSegment!: ElementRef

  menuItems: MenuItem[] = []

  selectedItems: AvatarItem[] = []

  isMenuLoaded = false

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

  constructor(
    private hostElement: ElementRef,
    private zone: NgZone,
    private appRef: ApplicationRef,
  ) {}

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

  ngAfterViewInit() {
    setTimeout(() => {
      this.scrollMenu()
      this.isMenuLoaded = true
    }, 100)

    setTimeout(() => {
      this.scrollMenu()
    }, 300)
  }

  onTabChange(e: any) {
    this.selectedTab = e.detail.value

    this.selectedTabChange.emit(this.selectedTab)

    this.scrollMenu()
  }

  scrollMenu() {
    if (!this.hostElement.nativeElement || !this.ionSegment) {
      return
    }

    const leftOffset =
      385 - this.hostElement.nativeElement.clientWidth / 2 + 95 / 2

    const itemOffset =
      leftOffset +
      this.menuItems.findIndex(x => x.tab === this.selectedTab) * 95

    this.ionSegment.nativeElement.scroll(itemOffset, 0)
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

  undo() {
    this.undoClick.emit()
  }

  close() {
    this.closeClick.emit()
  }

  share() {
    this.shareClick.emit()
  }

  download() {
    this.downloadClick.emit()
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
