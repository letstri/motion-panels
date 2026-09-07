import { Code } from './code'
import { readRegion } from './source'

export interface SourceBlock {
  file: string
  lang?: 'css' | 'tsx'
  region: string
}

export const Source = async ({
  blocks,
  note,
}: {
  blocks: SourceBlock[]
  note?: string
}) => {
  const rendered = await Promise.all(
    blocks.map(async (block) => ({
      ...block,
      code: await readRegion(block.file, block.region),
    }))
  )

  return (
    <details className="group border-line bg-sunken mt-4 rounded-xl border px-3.5 open:pb-3.5">
      <summary className="text-muted hover:text-text cursor-pointer list-none py-2.5 text-[13px] before:mr-2 before:inline-block before:transition-transform before:duration-150 before:content-['\25B8'] group-open:before:rotate-90 [&::-webkit-details-marker]:hidden">
        Source of this demo
      </summary>
      {note ? (
        <p className="border-line-strong text-muted mb-1 max-w-[68ch] border-l-2 pl-3.5 text-pretty">
          {note}
        </p>
      ) : null}
      {rendered.map((block) => (
        <div key={`${block.file}#${block.region}`}>
          <p className="text-muted mt-3.5 -mb-3 font-mono text-[12px]">
            {block.file}
            <span> #{block.region}</span>
          </p>
          <Code code={block.code} lang={block.lang ?? 'tsx'} twoslash={false} />
        </div>
      ))}
    </details>
  )
}
