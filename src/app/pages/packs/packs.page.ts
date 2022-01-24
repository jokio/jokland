import { Component, OnInit } from '@angular/core'
import { packs } from '../../data/packs.data'

@Component({
  selector: 'app-packs',
  templateUrl: './packs.page.html',
  styleUrls: ['./packs.page.scss'],
})
export class PacksPage implements OnInit {
  packs = packs

  constructor() {}

  ngOnInit(): void {}
}
