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
        'transition',
        'Transition',
        'Timing of the reorder trip: keyed children rendered in a new order travel there. Defaults to the house curve.',
      ],
    ],
  },
  {
    name: 'Panel',
    props: [
      [
        'size',
        'number | percent string',
        'Current size, in pixels or as a percentage of the group extent. A percentage follows the group as it resizes. Omit it and the panel fills what is left.',
      ],
      [
        'onSizeChange',
        '(size: number) => void',
        'Called with the new size as a drag or key press lands, in the form size was given: a number reports pixels, a percent string reports a percentage.',
      ],
      [
        'defaultSize',
        'number | percent string',
        'Size a double-click on the separator resets to. Defaults to the size the panel mounted with.',
      ],
      [
        'minSize / maxSize',
        'number | percent string',
        'Drag and keyboard bounds, in pixels or as a percentage of the group extent. Both clamp to the room the other panels leave, and max defaults to all of it.',
      ],
      [
        'collapsed',
        'boolean',
        'Folds the panel to zero. Dragging below half of minSize sets it too, once onCollapsedChange is there to hear it.',
      ],
      [
        'onCollapsedChange',
        '(collapsed: boolean) => void',
        'Required for drag-to-collapse and Enter-to-toggle.',
      ],
      [
        'keepMounted',
        'boolean (default true)',
        'Keeps the content mounted once the panel has been open, clipped at zero while collapsed, so reopening costs no mount: the fold animates it between initial (or exit) and animate. A panel that has never been open mounts nothing, and one that mounts open skips its entrance. Pass false to unmount on every close instead.',
      ],
      [
        'transition',
        'Transition',
        'Timing of the fold. Defaults to the house curve.',
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
    note: "No props of its own beyond transition; the rest reaches a motion div, and aria-label defaults to 'Resize panel'. Optional: rendered between two panels it resizes the sized one and sits over its edge without taking flow space. It keeps aria-valuenow, aria-valuetext and aria-valuemin current, adds aria-valuemax once the panel has a maxSize, and marks itself with data-resizing and data-crossing.",
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
        'controller.bounds',
        '() => { min, max }',
        'The bounds in pixels, percentages resolved and clamped to the room the other panels leave.',
      ],
      [
        'controller.target',
        'number',
        'The size the panel is settling on, 0 while collapsed. What a separator reports as aria-valuenow.',
      ],
      [
        'controller.reset',
        '() => void',
        'Calls onSizeChange with defaultSize, or the size the panel mounted with. The double-click.',
      ],
      [
        'controller.state',
        '{ bare, dragging, end, folding }',
        'Read it through subscribe. A frozen object, replaced only when it changes.',
      ],
      [
        'controller.subscribe',
        '(listener) => () => void',
        'Fires when the state or the target changes. This is the store useSyncExternalStore reads.',
      ],
      [
        'controller.destroy',
        '() => void',
        'Drops the listeners and any body lock the panel still holds. Call it after the detach.',
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
        'attachSeparator',
        '(element, group, own?) => () => void',
        'Wires a separator element: pointer drags and crossings, keyboard, double-click reset, live aria-value and data attributes. Without own it resizes the panel its slot sits beside. Returns the detach.',
      ],
      [
        'reorder',
        '{ measure, play }',
        'The reorder trip for plain DOM: measure the group children before the order changes, play the slide after.',
      ],
      [
        'timing / TRANSITION',
        '(transition?) => Transition',
        'The house curve — 250ms on a custom ease — or instant under prefers-reduced-motion.',
      ],
      [
        'FILL_ATTRIBUTE / SEPARATOR_ATTRIBUTE',
        'string',
        'Mark the filling panel and a separator slot. Sized panels read the first one to find the edge they drag.',
      ],
      [
        'edgeSize',
        '() => number',
        'Thickness of the drag area a bare panel puts on its edge: 8px for a mouse, 20px for a finger.',
      ],
      [
        'coarsePointer / reducedMotion',
        '{ get, subscribe }',
        'The two media queries the panels watch, as stores you can read from a component.',
      ],
      [
        'grips',
        'registry',
        'Rect-cached hit testing behind crossings, used by attachSeparator: register, at, mark, partners, state, invalidate, subscribe.',
      ],
    ],
  },
]
