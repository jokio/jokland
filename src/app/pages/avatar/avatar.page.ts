import { Component, OnDestroy, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { Subject } from 'rxjs'
import { AccountService } from '../../services/account.service'
import { AvatarService } from '../../services/avatar.service'

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.page.html',
  styleUrls: ['./avatar.page.scss'],
})
export class AvatarPage implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>()

  constructor(
    private router: Router,
    private account: AccountService,
    private avatar: AvatarService,
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
    this.avatar.openAvatarBuilder(
      this.account.userAddress,
      this.account.isWalletConnected,
    )
  }
}
