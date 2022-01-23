import { Component, OnInit } from '@angular/core'
import * as roadmap from '../../data/roadmap.data'

@Component({
  selector: 'app-roadmap',
  templateUrl: './roadmap.page.html',
  styleUrls: ['./roadmap.page.scss'],
})
export class RoadmapPage implements OnInit {
  phases = roadmap.phases

  constructor() {}

  ngOnInit(): void {}
}
