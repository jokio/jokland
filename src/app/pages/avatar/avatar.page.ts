import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.page.html',
  styleUrls: ['./avatar.page.scss'],
})
export class AvatarPage implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {}

  goToPacks() {
    this.router.navigate(['/packs'])
  }
}
