/**
 * @fileOverview Custom React hook `useIsMobile`.
 * This hook determines if the current viewport width corresponds to a mobile screen size.
 * It listens to window resize events to update its state.
 *
 * @exports useIsMobile - A hook that returns `true` if the screen is considered mobile, `false` otherwise.
 */
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
