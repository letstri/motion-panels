import { rendererRich, transformerTwoslash } from '@shikijs/twoslash'
import { createHighlighter } from 'shiki'
import { createTwoslasher } from 'twoslash'
import ts from 'typescript'

import { CopyButton } from './copy-button'

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

const LABEL = { css: 'css', sh: 'shell', tsx: 'tsx' }

export const Code = async ({
  code,
  lang = 'tsx',
  title,
  twoslash = true,
}: {
  code: string
  lang?: 'css' | 'sh' | 'tsx'
  title?: string
  twoslash?: boolean
}) => {
  const shiki = await highlighter
  const source = code.trim()
  const html = shiki.codeToHtml(source, {
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
    <div className="bg-code mt-6 overflow-hidden border">
      <div className="text-muted-foreground flex h-9 items-center justify-between gap-2 border-b pr-1 pl-3.5">
        <span className="kicker">{title ?? LABEL[lang]}</span>
        <CopyButton text={source} />
      </div>
      <div
        // oxlint-disable-next-line react/no-danger -- shiki renders the markup
        dangerouslySetInnerHTML={{ __html: html }}
        className="font-mono text-[13px] [&_pre]:m-0 [&_pre]:overflow-x-auto [&_pre]:px-4 [&_pre]:py-4 [&_pre]:leading-[1.7]"
      />
    </div>
  )
}
