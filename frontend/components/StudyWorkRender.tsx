import type { CompiledStudyWork } from '@/lib/study-work-latex'

type Sections = Extract<CompiledStudyWork['blocks'][number], { sections: unknown }>['sections']

function Parts({ parts }: { parts: Sections[number]['content'] }) {
  return parts.map((part, index) => {
    if ('text' in part) return part.text
    if ('error' in part) return <span key={index} className="text-amber-800 dark:text-amber-200">[Passage LaTeX à corriger]</span>
    return <span key={index} className={'math-render ' + (part.display ? 'my-2 block overflow-x-auto py-1 text-center' : 'inline')}
      dangerouslySetInnerHTML={{ __html: part.html }} />
  })
}

function LatexSections({ sections }: { sections: Sections }) {
  return sections.map((section, index) => <div key={index} className="space-y-2">
    {section.title.length > 0 && <h3 className="font-semibold"><Parts parts={section.title} /></h3>}
    {section.content.length > 0 && <div className="whitespace-pre-line break-words text-sm leading-relaxed"><Parts parts={section.content} /></div>}
  </div>)
}

export function StudyWorkRender({ rendering }: { rendering: CompiledStudyWork }) {
  return <div className="space-y-4">{rendering.blocks.map((block, index) => {
    if ('sections' in block) return <LatexSections key={index} sections={block.sections} />
    return <div className="overflow-x-auto" key={index}><table className="w-full border-collapse text-sm">
      <tbody>{block.rows.map((row, rowNumber) => <tr key={rowNumber}>
        {row.map((cell, column) => {
          const Cell = rowNumber === 0 ? 'th' : 'td'
          return <Cell key={column} scope={rowNumber === 0 ? 'col' : undefined}
            className="border border-slate-300 px-3 py-2 text-left dark:border-white/20"><LatexSections sections={cell} /></Cell>
        })}
      </tr>)}</tbody>
    </table></div>
  })}</div>
}
