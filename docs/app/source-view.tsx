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
    <details className="source">
      <summary>Source of this demo</summary>
      {note ? <p className="note">{note}</p> : null}
      {rendered.map((block) => (
        <div key={`${block.file}#${block.region}`}>
          <p className="source-file">
            <code>
              {block.file}
              <span> #{block.region}</span>
            </code>
          </p>
          <Code code={block.code} lang={block.lang ?? 'tsx'} twoslash={false} />
        </div>
      ))}
    </details>
  )
}
