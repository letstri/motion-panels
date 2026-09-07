export const API: {
  name: string
  note?: string
  props: [string, string, string][]
}[] = [
  {
    name: 'Group',
    props: [
      [
        'orientation',
        `'horizontal' | 'vertical'`,
        'Axis the panels split on. Groups nest.',
      ],
      [
        'layoutDependency',
        'unknown',
        'Set it to whatever decides the order of the children. Reordering them then animates instead of jumping.',
      ],
      [
        'transition',
        'Transition',
        'Timing of the reorder trip. Defaults to the house curve.',
      ],
    ],
  },
  {
    name: 'Panel',
    props: [
      [
        'size',
        'number',
        'Current size in pixels. Omit it and the panel fills what is left.',
      ],
      [
        'onSizeChange',
        '(size: number) => void',
        'Called with the new size as a drag or key press lands.',
      ],
      [
        'defaultSize',
        'number',
        'Size a double-click on the separator resets to.',
      ],
      [
        'minSize / maxSize',
        'number',
        'Drag and keyboard bounds. Max defaults to the group extent.',
      ],
      [
        'collapsed',
        'boolean',
        'Folds the panel to zero. Dragging below half of minSize sets it too.',
      ],
      [
        'onCollapsedChange',
        '(collapsed: boolean) => void',
        'Required for drag-to-collapse and Enter-to-toggle.',
      ],
      [
        'transition',
        'Transition',
        'Motion transition for the fold. Defaults to a 250ms ease.',
      ],
      [
        'initial / animate / exit',
        'motion props',
        'Applied to the content while the panel folds.',
      ],
      [
        'pin',
        'boolean',
        'Filling panels only. Lays the content out once per fold instead of once per frame.',
      ],
    ],
  },
  {
    name: 'Separator',
    note: 'No props of its own beyond transition. Optional: rendered between two panels it resizes the sized one, sits over its edge without taking flow space, and puts the panel size on aria-valuenow.',
    props: [],
  },
  {
    name: 'motion-panels',
    note: 'The core, for an adapter or for plain DOM. Nothing here imports React.',
    props: [
      [
        'createPanelGroup',
        '(orientation?) => PanelGroup',
        'The shared registry: axes, the filling panel motion values, the sized panels by side.',
      ],
      [
        'createPanel',
        '(group, options) => PanelController',
        'One panel state machine: bounds, drag, keyboard, folds, collapse.',
      ],
      [
        'controller.attach',
        '(element) => () => void',
        'Reads the panel place in the group and registers it. Returns the detach.',
      ],
      [
        'controller.sync',
        '(options) => void',
        'Feeds new options in. Changing the target starts a fold.',
      ],
      [
        'controller.motion',
        '{ content, size }',
        'MotionValues for the panel and its content. Bind size to width or height.',
      ],
      [
        'controller.state',
        '{ bare, dragging, end, folding }',
        'Read it through subscribe. A frozen object, replaced only when it changes.',
      ],
      [
        'controller.drag',
        '{ start, move, end, cancel }',
        'Pointer drag, in the units your gesture layer reports.',
      ],
      [
        'controller.resizeByKey',
        '(event) => void',
        'Arrows, Shift, PageUp / PageDown, Home / End, Enter. Takes any KeyboardEvent.',
      ],
      [
        'grips',
        'registry',
        'Rect-cached hit testing behind crossings: register, at, mark, partners.',
      ],
    ],
  },
]
