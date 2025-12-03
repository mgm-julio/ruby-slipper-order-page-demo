import type { IconAliases, IconProps } from 'vuetify'

import checkboxChecked from '@images/svg/checkbox-checked.svg'
import checkboxIndeterminate from '@images/svg/checkbox-indeterminate.svg'
import checkboxUnchecked from '@images/svg/checkbox-unchecked.svg'
import radioChecked from '@images/svg/radio-checked.svg'
import radioUnchecked from '@images/svg/radio-unchecked.svg'

const customIcons: Record<string, unknown> = {
  'mdi-checkbox-blank-outline': checkboxUnchecked,
  'mdi-checkbox-marked': checkboxChecked,
  'mdi-minus-box': checkboxIndeterminate,
  'mdi-radiobox-marked': radioChecked,
  'mdi-radiobox-blank': radioUnchecked,
}

const aliases: Partial<IconAliases> = {
  calendar: 'tabler-calendar',
  collapse: 'tabler-chevron-up',
  complete: 'tabler-check',
  cancel: 'tabler-x',
  close: 'tabler-x',
  delete: 'tabler-trash',
  clear: 'tabler-x-circle',
  success: 'tabler-circle-check',
  info: 'tabler-info-circle',
  warning: 'tabler-exclamation-circle',
  error: 'tabler-exclamation-circle-circle',
  prev: 'tabler-chevron-left',
  ratingEmpty: 'tabler-star',
  ratingFull: 'tabler-star',
  ratingHalf: 'tabler-star-half',
  next: 'tabler-chevron-right',
  delimiter: 'tabler-circle',
  sort: 'tabler-arrow-up',
  expand: 'tabler-chevron-down',
  menu: 'tabler-menu-2',
  subgroup: 'tabler-trucket-down',
  dropdown: 'tabler-chevron-down',
  edit: 'tabler-pencil',
  loading: 'tabler-refresh',
  first: 'tabler-arrow-bar-to-left',
  last: 'tabler-arrow-bar-to-right',
  unfold: 'tabler-fold',
  file: 'tabler-paperclip',
  plus: 'tabler-plus',
  minus: 'tabler-minus',
  sortAsc: 'tabler-arrow-up',
  sortDesc: 'tabler-arrow-down',
}

export const iconify = {
  component: (props: IconProps) => {
    // Load custom SVG directly instead of going through icon component
    if (typeof props.icon === 'string') {
      const iconComponent = customIcons[props.icon]

      if (iconComponent)
        return h(iconComponent)
    }

    return h(
      props.tag,
      {
        ...props,

        // As we are using class based icons
        class: [props.icon],

        // Remove used props from DOM rendering
        tag: undefined,
        icon: undefined,
      },
    )
  },
}

export const icons = {
  defaultSet: 'iconify',
  aliases,
  sets: {
    iconify,
  },
}
