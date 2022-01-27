import { Location } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import MetamaskOnboarding from '@metamask/onboarding'
import { environment } from '../../../environments/environment'
import { AccountService } from '../../services/account.service'
import { AvatarService } from '../../services/avatar.service'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  selectedTab = 'avatar'

  hideSeparatorLine = true

  onboarding = new MetamaskOnboarding()

  constructor(
    private location: Location,
    public account: AccountService,
    public avatar: AvatarService,
  ) {}

  ngOnInit() {
    const path = this.location.path(false)

    switch (path) {
      case '/packs':
        this.selectedTab = 'packs'
        break

      case '/roadmap':
        this.selectedTab = 'roadmap'
        break

      case '/games':
        this.selectedTab = 'games'
        break
    }

    this.account.activeAccountUpdate$.subscribe(async address => {
      this.avatar.ensureAvatarImageExists(address)

      try {
        const data = await fetch(
          `${environment.avatarServiceUrl}/config/${address}`,
        ).then(x => x.json())

        if (data?.length) {
          await this.avatar.loadRemoteKeys(address, data.keys)
        }
      } catch (err) {
        console.error(err)
      }
    })

    this.account.initializeWallet()
  }

  onTabChange(e: any) {
    this.selectedTab = e.detail.value
  }

  onScroll(e: any) {
    this.hideSeparatorLine = e.detail.currentY === 0
  }

  async connect() {
    if (!this.account.isConnectEnabled) {
      this.onboarding.startOnboarding()
      return
    }

    this.onboarding.stopOnboarding()

    const accounts = await (window as any).ethereum.request({
      method: 'eth_requestAccounts',
    })
    const account = accounts[0]

    await this.account.loadAccount(account)
  }
}
