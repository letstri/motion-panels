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

  return (
    <div
      // oxlint-disable-next-line react/no-danger -- shiki renders the markup
      dangerouslySetInnerHTML={{ __html: html }}
      className="[&_pre]:border-line mt-5 font-mono text-[13px] [&_pre]:m-0 [&_pre]:overflow-x-auto [&_pre]:rounded-[10px] [&_pre]:border [&_pre]:px-[18px] [&_pre]:py-4 [&_pre]:leading-[1.6]"
    />
  )
}
