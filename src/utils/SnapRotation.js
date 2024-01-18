import { useController, useXR } from '@react-three/xr'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export default function SnapRotation({ hand = 'right', increment = Math.PI / 4, threshold = 0.6 }) {
  const controller = useController(hand)
  const { player } = useXR()
  const snapping = useRef(false)
  useFrame(() => {
    if (controller?.inputSource?.gamepad) {
      const [, , ax] = controller.inputSource.gamepad.axes
      if (Math.abs(ax) > threshold) {
        !snapping.current && player.rotateY(-increment * Math.sign(ax))
        snapping.current = true
      } else {
        snapping.current = false
      }
    }
  })
  return null
}
