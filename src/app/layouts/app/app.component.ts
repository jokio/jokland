import { Location } from '@angular/common'
import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  selectedTab = 'avatar'

  hideSeparatorLine = true

  constructor(private location: Location) {}

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
  }

  onTabChange(e: any) {
    this.selectedTab = e.detail.value
  }

  onScroll(e: any) {
    this.hideSeparatorLine = e.detail.currentY === 0
  }
}
