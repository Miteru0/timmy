import React from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function Model({ animationName, ...props }) {
  const { scene, animations } = useGLTF('/timmy.gltf');
  const mixer = React.useMemo(() => new THREE.AnimationMixer(scene), [scene]);

  // Reference to the current animation action
  const [currentAction, setCurrentAction] = React.useState(null);

  React.useEffect(() => {
    if (animations.length > 0) {
      // Find the new animation by name
      const newAction = mixer.clipAction(animations.find(anim => anim.name === animationName) || animations[0]);

      // Stop the current animation if there's one
      if (currentAction && currentAction !== newAction) {
        currentAction.stop();
      }

      // Play the new animation and set it as the current one
      newAction.play();
      setCurrentAction(newAction);
    }
  }, [animationName, animations, mixer, currentAction]);

  // Update animation on each frame
  useFrame((state, delta) => mixer.update(delta));

  return <primitive object={scene} {...props} />;
}
