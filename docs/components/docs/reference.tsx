import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { CHIP } from './prose'

export const Reference = ({
  head,
  rows,
}: {
  head?: string[]
  rows: readonly (readonly string[])[]
}) => (
  <Table className="mt-5 text-[14px] max-sm:[&_tbody]:block">
    {head ? (
      <TableHeader className="max-sm:hidden">
        <TableRow className="hover:bg-transparent">
          {head.map((cell, index) => (
            <TableHead
              key={cell}
              className={`kicker text-muted-foreground/60 h-auto pt-0 pb-2.5 ${
                index === head.length - 1
                  ? 'w-full pr-0 pl-4'
                  : 'px-0 first:pr-4 [&+th]:pr-4'
              }`}
            >
              {cell}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
    ) : null}
    <TableBody>
      {rows.map((cells) => (
        <TableRow
          key={cells[0]}
          className="hover:bg-transparent max-sm:block max-sm:py-2"
        >
          {cells.map((cell, index) =>
            index === cells.length - 1 ? (
              <TableCell
                key={cell}
                className="text-muted-foreground w-full py-2.5 pr-0 pl-4 align-top whitespace-normal max-sm:block max-sm:w-auto max-sm:pt-1 max-sm:pl-0"
              >
                {cell}
              </TableCell>
            ) : (
              <TableCell
                key={cell}
                className="px-0 py-2.5 align-top first:pr-4 max-sm:block max-sm:py-1 max-sm:pr-0 max-sm:first:pr-0 [&+td]:pr-4"
              >
                <code className={CHIP}>{cell}</code>
              </TableCell>
            )
          )}
        </TableRow>
      ))}
    </TableBody>
  </Table>
)
