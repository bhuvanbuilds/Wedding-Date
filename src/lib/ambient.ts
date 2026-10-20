/**
 * Ambient decoration (petals, glowing motes) can be paused while the guest is
 * doing something that needs every frame — like scratching the invitation.
 * Paused canvases simply keep their last frame on screen.
 */
export const ambient = { paused: false }

export function pauseAmbient(paused: boolean) {
  ambient.paused = paused
}
