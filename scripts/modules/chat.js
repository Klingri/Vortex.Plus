(function() {
  const char = window._vortex.getCharacter();
  if (!char) { console.warn("Character not loaded yet!"); return; }

  const bones = {};
  char.traverse(c => { if (c.isBone || c.type === 'Bone') bones[c.name] = c; });

  const rest = window._vortex.getAnimRest();
  const r = (name, axis) => rest[name]?.[axis] ?? 0;
  let t = 0;

  window._mpUpdate = (dt) => {
    t += dt * 5;

    // Raise the roof arms — both pump up together with slight alternation
    const pump = Math.sin(t * 2) * 0.4;
    if (bones['Left_Arm']) {
      bones['Left_Arm'].rotation.x = r('Left_Arm','x') - Math.PI * 0.85 + pump;
      bones['Left_Arm'].rotation.z = r('Left_Arm','z') + 0.5;
      bones['Left_Arm'].rotation.y = r('Left_Arm','y');
    }
    if (bones['Right_Arm']) {
      bones['Right_Arm'].rotation.x = r('Right_Arm','x') - Math.PI * 0.85 - pump;
      bones['Right_Arm'].rotation.z = r('Right_Arm','z') - 0.5;
      bones['Right_Arm'].rotation.y = r('Right_Arm','y');
    }

    // Legs do a side-step bounce, not a walk
    const step = Math.abs(Math.sin(t));
    if (bones['Left_Leg']) {
      bones['Left_Leg'].rotation.x = r('Left_Leg','x') + step * 0.4;
      bones['Left_Leg'].rotation.z = r('Left_Leg','z');
      bones['Left_Leg'].rotation.y = r('Left_Leg','y');
    }
    if (bones['Right_Leg']) {
      bones['Right_Leg'].rotation.x = r('Right_Leg','x') - step * 0.4;
      bones['Right_Leg'].rotation.z = r('Right_Leg','z');
      bones['Right_Leg'].rotation.y = r('Right_Leg','y');
    }

    // Torso: slight bounce up on the beat
    if (bones['Torso']) {
      bones['Torso'].rotation.x = r('Torso','x') + Math.sin(t * 2) * 0.08;
      bones['Torso'].rotation.y = r('Torso','y');
      bones['Torso'].rotation.z = r('Torso','z');
    }

    if (bones['Head']) {
      bones['Head'].rotation.x = r('Head','x');
      bones['Head'].rotation.y = r('Head','y') + Math.sin(t) * 0.15;
      bones['Head'].rotation.z = r('Head','z');
    }
  };

  console.log("🕺 Raise the roof! stopDance() to stop.");
  window.stopDance = () => { window._mpUpdate = null; console.log("Stopped."); };
})();