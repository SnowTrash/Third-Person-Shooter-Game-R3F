import type { JumpParams } from './types';

export function handleJump({
  jumpPressed,
  isGrounded,
  wait,
  isJumping,
  actions,
  controls,
  setAction,
  setIsJumping,
  setWait,
  jumpBoostMultiplier = 1.0,
}: JumpParams & { jumpBoostMultiplier?: number }): void {
  // Handle jump on single press
  if (jumpPressed && isGrounded && !wait && !isJumping) {
    setAction(actions[8]); // Play jump animation
    setIsJumping(true);
    setWait(true);
    
    const jumpDuration = actions[8].getClip().duration; // Get jump animation duration

    if (controls.current) {
      // Base jump impulse increased from 1.3 to 1.8, with zone boost applied
      const jumpForce = 1.8 * jumpBoostMultiplier;
      controls.current.applyImpulse({ x: 0, y: jumpForce, z: 0 }, true);
    }
    
    // Set jump animation duration (adjust based on your animation length)
    setTimeout(() => {
      setIsJumping(false);
    }, jumpDuration * 1000); // Convert to milliseconds
  }

  if (isGrounded && wait && !isJumping) {
    setWait(false);
  }
}
