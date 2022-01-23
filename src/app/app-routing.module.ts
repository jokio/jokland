import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { AvatarPage } from './pages/avatar/avatar.page'
import { CommunityPage } from './pages/community/community.page'
import { GamesPage } from './pages/games/games.page'
import { PacksPage } from './pages/packs/packs.page'
import { RoadmapPage } from './pages/roadmap/roadmap.page'

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/avatar' },
  { path: 'avatar', pathMatch: 'full', component: AvatarPage },
  { path: 'packs', component: PacksPage },
  { path: 'roadmap', component: RoadmapPage },
  { path: 'community', component: CommunityPage },
  { path: 'games', component: GamesPage },
  { path: '**', redirectTo: '/avatar' },
]

@NgModule({
  imports: [CommonModule, RouterModule.forRoot(routes), IonicModule],
  declarations: [
    AvatarPage,
    PacksPage,
    RoadmapPage,
    CommunityPage,
    GamesPage,
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
