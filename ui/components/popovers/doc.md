# Popover

A popover is a non-modal dialog. The component should be paired with a clickable trigger element and contain at least one focusable element.

A popover is used to display contextual information to the user.

## Nubbins

Nubbins are indicators that inform the user of the direction of the content associated with the popover.

A popover can accept the following nubbin position classes, `.nds-nubbin_left`, `.nds-nubbin_left-top`, `.nds-nubbin_left-bottom`, `.nds-nubbin_top-left`, `.nds-nubbin_top-right`, `.nds-nubbin_right-top`, `.nds-nubbin_right-bottom`, `.nds-nubbin_bottom-left`, `.nds-nubbin_bottom-right`.

## Themes

A `.nds-popover` can accept theme modifiers. Adding a theme class such as `.nds-theme_error` to the `.nds-popover` will apply that theme.

## Accessibility

### Notable features

- Popovers*must** come with a triggering button
- They*must** have at least one focusable element inside
- They*should** be implemented as a keyboard focus trap
- When triggered, user focus should be placed on the first focusable element that isn't the close button. If the close button is the only focusable element, focus should be placed there
- Pressing the Escape the key as well as clicking the close button should close the Popover
- User focus should be placed back on the triggering button when the popover is closed

Panel Popovers can be shown on mouse hover but for keyboard or screen reader users, a button should be present*in addition** and next to the hover trigger.
This is due to the focus moving and trapping nature of non-modal dialogs. You*should not** move a user's focus without their expressed intent.

### Notable attributes

- The Popover element should have `role="dialog"` applied
- The `dialog` should be labelled, this can be achieved in two ways:
  - Apply the `aria-labelledby` attribute to the `dialog` element and set the value to be the ID of the main Heading element in the Popover (if it provides a good and meaningful title to the `dialog`)
  - If no Heading element is present, use the `aria-label` attribute and set the value to be a meaningful title of the `dialog`
- The `dialog` should be described where possible. This can be achieved by applying the `aria-describedby` attribute to the `dialog` element and set the value to be the id of the Popover body