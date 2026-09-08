export const AXES = {
  horizontal: {
    axis: 'Inline',
    client: 'clientWidth',
    cross: 'height',
    crossAxis: 'Block',
    cursor: 'col-resize',
    direction: 'row',
    edge: 'left',
    extent: 'width',
    grow: 'ArrowRight',
    point: 'x',
    separator: 'vertical',
    shrink: 'ArrowLeft',
  },
  vertical: {
    axis: 'Block',
    client: 'clientHeight',
    cross: 'width',
    crossAxis: 'Inline',
    cursor: 'row-resize',
    direction: 'column',
    edge: 'top',
    extent: 'height',
    grow: 'ArrowDown',
    point: 'y',
    separator: 'horizontal',
    shrink: 'ArrowUp',
  },
} as const

export type Orientation = keyof typeof AXES

export type Axes = (typeof AXES)[Orientation]

export type Side = 'end' | 'start'
