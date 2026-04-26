export type ExampleDialogueTurn = { role: 'user' | 'assistant'; content: string }

export type Persona = {
  id: string
  slug: string
  displayName?: string | null
  isSystem: boolean
  visible?: boolean
  updatedAt: string
}

export type PersonaVersionStatus = 'draft' | 'published' | 'archived'

export type PersonaVersion = {
  id: string
  personaId: string
  version: number
  status: PersonaVersionStatus
  label?: string | null
  displayName?: string | null
  bio?: string | null
  viewersLabel?: string | null
  isOnline?: boolean
  systemPrompt: string
  styleTone: string
  traits: string[]
  hardBoundaries: string[]
  exampleDialogue: ExampleDialogueTurn[]
  createdAt: string
  avatarUrl?: string | null
}

export type CreatePersonaInput = {
  displayName: string
  bio: string
  viewersLabel: string
  isOnline: boolean
  systemPrompt: string
  styleTone?: string
  traits: string[]
  hardBoundaries: string[]
  isSystem?: boolean
  exampleDialogue?: ExampleDialogueTurn[]
}
