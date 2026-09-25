"use client";

// ─────────────────────────────────────────────────────────────
// AvatarStage — prefers a real 3D VRM avatar, falls back to the
// SVG face automatically.
//
// Drop your avatar at  public/avatar.vrm  (see docs/CREATE-VRM.md)
// and Shanti appears as a full 3D model with:
//   • lip-sync — the same Web Audio amplitude drives the VRM
//     "aa" (jaw-open) expression, so no paid avatar service
//   • organic blinking — VRM "blink" expression on a random timer
//   • calm idle motion — gentle breathing sway + camera look-at
// If /avatar.vrm is missing or fails to load, the proven SVG
// avatar renders instead — the app never breaks.
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import { TalkingAvatar, type AvatarProps } from "@/components/relax/avatar";

export function AvatarStage(props: AvatarProps) {
  const [hasVrm, setHasVrm] = useState<boolean | null>(null); // null = checking

  useEffect(() => {
    let alive = true;
    fetch("/avatar.vrm", { method: "HEAD" })
      .then((r) => {
        if (alive) setHasVrm(r.ok);
      })
      .catch(() => {
        if (alive) setHasVrm(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (hasVrm) return <VrmCanvas {...props} />;
  if (hasVrm === false) return <TalkingAvatar {...props} />;
  // brief checking state — render the halo frame so layout doesn't jump
  return <div style={{ width: props.size ?? 230, height: props.size ?? 230 }} />;
}

function VrmCanvas({ size = 230, speaking, mouthOpen, breathPhase }: AvatarProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  // latest props readable from the animation loop without re-mounting the scene
  const live = useRef({ speaking, mouthOpen, breathPhase });
  live.current = { speaking, mouthOpen, breathPhase };
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let disposed = false;
    let cleanup: () => void = () => {};

    (async () => {
      const THREE = await import("three");
      const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
      const { VRMLoaderPlugin, VRMUtils } = await import("@pixiv/three-vrm");
      type VRM = import("@pixiv/three-vrm").VRM;

      if (disposed || !mountRef.current) return;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(size, size);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      mountRef.current.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);

      const key = new THREE.DirectionalLight(0xfff2dc, 1.8);
      key.position.set(0.8, 1.6, 2.2);
      const fill = new THREE.AmbientLight(0xbfd8c8, 1.1);
      scene.add(key, fill);

      const loader = new GLTFLoader();
      loader.register((parser) => new VRMLoaderPlugin(parser));

      let vrm: VRM | null = null;
      let raf = 0;
      const clock = new THREE.Clock();
      let smoothMouth = 0;
      let blinkTimer = 2.4; // seconds until next blink
      let blinkT = -1; // -1 = not blinking, else 0..π progress

      loader.load(
        "/avatar.vrm",
        (gltf) => {
          if (disposed) return;
          vrm = gltf.userData.vrm as VRM;
          VRMUtils.removeUnnecessaryVertices(gltf.scene);
          VRMUtils.combineSkeletons(gltf.scene);
          vrm.scene.rotation.set(0, Math.PI, 0); // VRM faces +Z, turn toward camera
          scene.add(vrm.scene);

          // frame the head
          const head = vrm.humanoid?.getNormalizedBoneNode("head");
          if (head) {
            const p = new THREE.Vector3();
            head.getWorldPosition(p);
            camera.position.set(p.x, p.y + 0.08, p.z + 0.72);
            camera.lookAt(p.x, p.y + 0.02, p.z);
          } else {
            camera.position.set(0, 1.32, 0.8);
            camera.lookAt(0, 1.28, 0);
          }
          if (vrm.lookAt) vrm.lookAt.target = camera;
        },
        undefined,
        (e) => {
          console.error("VRM load failed:", e);
          setFailed(true);
        }
      );

      const setExpr = (name: string, alt: string, value: number) => {
        const em = vrm?.expressionManager;
        if (!em) return;
        // VRM 1.0 uses "aa"/"blink"; VRM 0.x models use "a"/"blink" — try both
        if (em.getExpression(name)) em.setValue(name, value);
        else if (alt && em.getExpression(alt)) em.setValue(alt, value);
      };

      const tick = () => {
        raf = requestAnimationFrame(tick);
        const dt = Math.min(clock.getDelta(), 0.1);
        const t = clock.elapsedTime;

        if (vrm) {
          const s = live.current;

          // lip-sync: amplitude -> jaw-open expression
          smoothMouth += ((s.speaking ? s.mouthOpen : 0) - smoothMouth) * 0.4;
          setExpr("aa", "a", Math.min(1, smoothMouth * 1.15));
          setExpr("oh", "o", Math.min(1, smoothMouth * 0.25)); // slight rounding for realism

          // organic blinking
          blinkTimer -= dt;
          if (blinkTimer <= 0 && blinkT < 0) {
            blinkT = 0;
            blinkTimer = 2.4 + Math.random() * 3.4;
          }
          if (blinkT >= 0) {
            blinkT += dt * 8;
            const v = Math.sin(Math.min(blinkT, Math.PI));
            setExpr("blink", "blink", v);
            if (blinkT >= Math.PI) {
              blinkT = -1;
              setExpr("blink", "blink", 0);
            }
          }

          // calm presence — soft breathing sway, slightly deeper on guided inhale
          const sway = Math.sin(t * 0.85) * 0.008 + (s.breathPhase === 1 ? 0.012 : 0);
          vrm.scene.position.y = sway;

          vrm.update(dt);
        }
        renderer.render(scene, camera);
      };
      tick();

      cleanup = () => {
        cancelAnimationFrame(raf);
        scene.traverse((obj) => {
          const mesh = obj as unknown as {
            geometry?: { dispose(): void };
            material?: { dispose(): void } | { dispose(): void }[];
          };
          mesh.geometry?.dispose?.();
          const m = mesh.material;
          if (Array.isArray(m)) m.forEach((mm) => mm.dispose?.());
          else m?.dispose?.();
        });
        renderer.dispose();
        renderer.domElement.remove();
      };
    })().catch((e) => {
      console.error("VRM init failed:", e);
      setFailed(true);
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, [size]);

  if (failed) {
    return (
      <TalkingAvatar size={size} speaking={speaking} mouthOpen={mouthOpen} breathPhase={breathPhase} />
    );
  }
  return <div ref={mountRef} style={{ width: size, height: size }} aria-hidden="true" />;
}
