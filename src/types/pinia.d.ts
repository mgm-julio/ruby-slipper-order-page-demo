import type { MongoAbility } from '@casl/ability'
import 'pinia'
import type { Router } from 'vue-router'

declare module 'pinia' {
  export interface PiniaCustomProperties {
    $router: Router
    $ability: MongoAbility
  }
}
