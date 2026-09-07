export const AXES = {
  horizontal: {
    axis: 'Inline',
    cross: 'height',
    crossAxis: 'Block',
    cursor: 'col-resize',
    direction: 'row',
    extent: 'width',
    grow: 'ArrowRight',
    offset: 'offsetWidth',
    point: 'x',
    separator: 'vertical',
    shrink: 'ArrowLeft',
  },
  vertical: {
    axis: 'Block',
    cross: 'width',
    crossAxis: 'Inline',
    cursor: 'row-resize',
    direction: 'column',
    extent: 'height',
    grow: 'ArrowDown',
    offset: 'offsetHeight',
    point: 'y',
    separator: 'horizontal',
    shrink: 'ArrowUp',
  },
} as const

export type Orientation = keyof typeof AXES

export type Axes = (typeof AXES)[Orientation]

export type Side = 'end' | 'start'
