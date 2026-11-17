import { maths } from './maths'
import { physique } from './physique'
import { si } from './si'
import { logique } from './logique'
import { ensembles } from './ensembles'
import { structures } from './structures'
import { mesures } from './mesures'
import { circuits } from './circuits'
import { topologie } from './topologie'
import { mathsApprofondissement } from './maths-approfondissement'
import { physiqueApprofondissement } from './physique-approfondissement'
import { siApprofondissement } from './si-approfondissement'
import type { CourseContent } from './format'

const approfondissements: Record<string, Pick<CourseContent, 'sections' | 'exercises'>> = {
  ...mathsApprofondissement,
  ...physiqueApprofondissement,
  'modelisation-systemes-asservis': siApprofondissement,
}

export const coursePrototype = [
  logique, ensembles, structures, topologie, mesures, circuits,
  ...[...maths, ...physique, si].map(course => {
    const { sections, exercises } = approfondissements[course.slug]
    return {
      ...course,
      minutes: course.minutes + 65,
      sections: [...course.sections.slice(0, -1), ...sections, course.sections[course.sections.length - 1]],
      exercises: [...course.exercises, ...exercises],
    }
  }),
]
