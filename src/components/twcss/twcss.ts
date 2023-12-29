import React from 'react'
import { createTools, type Tailwindest } from 'tailwindest'

const tw = createTools<Tailwindest>()

export interface TwProps {
  twCss?: Tailwindest
}

export interface WidgetProps<T extends HTMLElement> extends React.HTMLAttributes<T>, TwProps {}

export function twCompose (tw1?: Tailwindest, tw2?: Tailwindest) {
  if (tw1 == null) {
    return tw2
  }
  if (tw2 == null) {
    return tw1
  }
  return tw.style(tw1).compose(tw2).style
}

// Class name takes preference over style
export function twClassName (style?: Tailwindest, className?: string) {
  if (style == null) {
    return className
  }

  const twClass = tw.style(style).class
  if (!className) {
    return twClass
  }
  return `${twClass} ${className}`
}
