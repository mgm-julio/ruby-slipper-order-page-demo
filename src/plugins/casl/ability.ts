import { createMongoAbility } from '@casl/ability'

export type Actions = 'create' | 'read' | 'update' | 'delete' | 'manage' | 'write'


export type Subjects = 'calls' | 'sms' | 'integrations' | 'knowledge-base' | 'dashboard' | 'users' | 'assistants' | 'restaurant-demo' | 'all' | 'Post' | 'Comment' | 'User' | 'AclDemo'

export interface Rule { 
  action: Actions
  subject: Subjects
}

export const ability = createMongoAbility<[Actions, Subjects]>()
