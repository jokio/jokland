import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
} from '@angular/core'
import { Router } from '@angular/router'
import { ModalController } from '@ionic/angular'
import { Subject } from 'rxjs'
import { AvatarBuilderComponent } from '../../components/avatar-builder/avatar-builder.component'
import { AvatarItemType } from '../../domain/avatar.types'

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.page.html',
  styleUrls: ['./avatar.page.scss'],
})
export class AvatarPage implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>()

  constructor(
    private router: Router,
    private modal: ModalController,
  ) {}

  ngOnInit() {
    this.openBuilder()
  }

  ngOnDestroy() {
    this.unsubscribe$.next()
    this.unsubscribe$.complete()
  }

  goToPacks() {
    this.router.navigate(['/packs'])
  }

  async openBuilder() {
    const onTabChange = new EventEmitter()
    onTabChange.subscribe(x => {
      localStorage.setItem('jok.builderTab', x)
    })

    const selectedTab =
      localStorage.getItem('jok.builderTab') ?? AvatarItemType.SKIN

    const modalView = await this.modal.create({
      component: AvatarBuilderComponent,
      swipeToClose: true,
      componentProps: {
        selectedItemKeys: [
          'common/skin_1b',
          'common/hair_2',
          'common/eyes_1',
          'common/mouth_2',
          'common/clothes_22',
        ],
        selectedTab,
        selectedTabChange: onTabChange,
      },
    })

    modalView.present()
  }
}
