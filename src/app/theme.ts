import { createTheme, type MantineColorsTuple } from '@mantine/core'

const wb: MantineColorsTuple = [
  '#fde8f8',
  '#f9c2ec',
  '#f599e0',
  '#ed6ad0',
  '#e13bbe',
  '#cb11ab',
  '#a80e8d',
  '#860c71',
  '#640954',
  '#420638',
]

const wbAccent: MantineColorsTuple = [
  '#f3e8ff',
  '#e0c4ff',
  '#c99aff',
  '#b06bff',
  '#9640f5',
  '#7f26e8',
  '#681dbe',
  '#521696',
  '#3c106e',
  '#260a46',
]

export const appTheme = createTheme({
  primaryColor: 'wb',
  colors: {
    wb,
    wbAccent,
  },
})
