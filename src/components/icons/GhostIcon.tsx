import * as React from 'react'
import type { ColorValue } from 'react-native'
import Svg, { Path } from 'react-native-svg'

// Source: https://free-icons.github.io/free-icons/

interface GhostIconProps {
  width: number
  height: number
  color: ColorValue
}

const GhostIcon = (props: GhostIconProps) => (
  <Svg fill={props.color} viewBox="0 0 512 512" width={props.width} height={props.height}>
    <Path d="M307 506q5 6 13 6t13-6l30-33q9-10 22-11 12 0 22 9l2 2q7 7 16 7 21-2 23-23V192q-2-82-56-136T256 0q-82 2-136 56T64 192v265q2 21 23 23 9 0 16-7l2-2q10-9 22-9 13 1 22 11l30 33q5 6 13 6t13-6l27-30q10-11 24-11t24 11l27 30ZM91 462q-2 2-4 2-6-1-7-7V192q2-75 52-124 49-50 124-52 75 2 124 52 50 49 52 124v265q-1 6-7 7-2 0-4-2l-3-2q-15-14-34-14-19 1-33 16l-30 34h-2l-27-31q-15-16-36-16t-36 16l-27 31h-2l-29-34q-15-15-34-16t-34 14l-3 2Zm101-246q-22-2-24-24 2-22 24-24 22 2 24 24-2 22-24 24Zm-40-24q1 23 20 35 20 10 40 0 19-12 20-35-1-23-20-35-20-10-40 0-19 12-20 35Zm192 0q-2 22-24 24-22-2-24-24 2-22 24-24 22 2 24 24Zm-24-40q-23 1-35 20-10 20 0 40 12 19 35 20 23-1 35-20 10-20 0-40-12-19-35-20Z" />
  </Svg>
)

export default GhostIcon
