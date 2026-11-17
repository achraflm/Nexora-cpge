function chapterLatexBody(source: string) {
  const text = source.replace(/(?<!\\)%[^\r\n]*/g, '')
  const document = text.match(/\\begin\s*\{document\}([\s\S]*?)(?:\\end\s*\{document\}|$)/)
  return (document?.[1] ?? text).replace(/\\(?:maketitle|tableofcontents|newpage|clearpage)\b/g, '').trim()
}

export function chapterLatexSections(source: string) {
  const body = chapterLatexBody(source)
    .replace(/\\begin\{(equation|align|gather|multline)(\*?)\}([\s\S]*?)\\end\{\1\2\}/g,
      (_, kind, _star, math) => {
        const expression = math.replace(/\\(?:label|tag)\{[^{}]*\}/g, '')
        if (kind === 'equation') return '$$' + expression + '$$'
        const environment = kind === 'align' ? 'aligned' : 'gathered'
        return '$$\\begin{' + environment + '}' + expression + '\\end{' + environment + '}$$'
      })
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, math) => '$$' + math + '$$')
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, math) => '$' + math.replace(/\s*\r?\n\s*/g, ' ') + '$')
  const blocks = body.split(/\\(?:sub(?:sub)?)?section\*?\s*\{([^{}\r\n]+)\}/g)
  const sections = [{ title: '', content: readableText(blocks[0]) }]
  for (let index = 1; index < blocks.length; index += 2) {
    sections.push({ title: readableText(blocks[index]), content: readableText(blocks[index + 1]) })
  }
  return sections.filter(section => section.title || section.content)
}

function readableText(source: string) {
  return source.split(/(\$\$[\s\S]+?\$\$|\$[^$\r\n]+\$)/g).map((part, index) => index % 2 ? part : part
    .replace(/\\(?:begin|end)\{(?:itemize|enumerate|description|center|quote)\}/g, '')
    .replace(/\\item(?:\[([^\]\r\n]+)\])?[ \t]*/g, (_, label) => '• ' + (label ? label + ' ' : ''))
    .replace(/\\(?:text|textbf|textit|emph|underline|texttt)\{([^{}]*)\}/g, '$1')
    .replace(/\\(?:label|pagestyle|thispagestyle)\{[^{}]*\}/g, '')
    .replace(/\\(?:noindent|smallskip|medskip|bigskip)\b/g, '')
    .replace(/\\(?:par\b|newline\b|\\)/g, '\n')
    .replace(/\\([%&#_])/g, '$1')
    .replace(/~/g, '\u00a0')).join('').trim()
}
