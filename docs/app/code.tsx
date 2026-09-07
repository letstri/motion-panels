import { rendererRich, transformerTwoslash } from '@shikijs/twoslash'
import { createHighlighter } from 'shiki'
import { createTwoslasher } from 'twoslash'
import ts from 'typescript'

const THEMES = {
  dark: 'github-dark-default',
  light: 'github-light-default',
}

const highlighter = createHighlighter({
  langs: ['css', 'sh', 'tsx'],
  themes: Object.values(THEMES),
})

const twoslasher = createTwoslasher({
  compilerOptions: {
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.Preserve,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    strict: true,
    target: ts.ScriptTarget.ESNext,
  },
})

export const Code = async ({
  code,
  lang = 'tsx',
  twoslash = true,
}: {
  code: string
  lang?: 'css' | 'sh' | 'tsx'
  twoslash?: boolean
}) => {
  const shiki = await highlighter
  const html = shiki.codeToHtml(code.trim(), {
    defaultColor: false,
    lang,
    themes: THEMES,
    transformers:
      lang === 'tsx' && twoslash
        ? [
            transformerTwoslash({
              renderer: rendererRich({ queryRendering: 'line' }),
              twoslasher,
            }),
          ]
        : [],
  })

  // oxlint-disable-next-line react/no-danger -- shiki renders the markup
  return <div className="code" dangerouslySetInnerHTML={{ __html: html }} />
}
