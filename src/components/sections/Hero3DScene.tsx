"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

function createTurban() {
  const group = new THREE.Group();
  group.name = "turban";

  const body = new THREE.Mesh(
    new THREE.TorusGeometry(1.25, 0.34, 28, 120),
    new THREE.MeshStandardMaterial({
      color: "#7A2348",
      roughness: 0.72,
      metalness: 0.04,
    })
  );
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  [-0.55, -0.2, 0.18, 0.52].forEach((z, index) => {
    const fold = new THREE.Mesh(
      new THREE.TorusGeometry(1.02 - index * 0.06, 0.055, 12, 72),
      new THREE.MeshStandardMaterial({
        color: "#F1B5C8",
        roughness: 0.68,
        metalness: 0.02,
      })
    );
    fold.position.set(0, 0.05 + index * 0.03, z);
    fold.rotation.set(Math.PI / 2, 0.2 + index * 0.22, 0.65);
    fold.castShadow = true;
    group.add(fold);
  });

  const accent = new THREE.Mesh(
    new THREE.TorusGeometry(0.55, 0.06, 12, 72),
    new THREE.MeshStandardMaterial({
      color: "#C9A227",
      roughness: 0.32,
      metalness: 0.55,
    })
  );
  accent.position.set(0.06, -0.06, 0);
  accent.rotation.set(Math.PI / 2, 0, 0.1);
  group.add(accent);

  group.position.set(1.55, 0.65, 0);
  group.rotation.set(0.16, -0.35, -0.05);
  return group;
}

function createShades() {
  const group = new THREE.Group();
  group.name = "shades";
  group.position.set(3.15, -0.95, -0.45);
  group.rotation.set(-0.08, 0.35, 0.08);
  group.scale.setScalar(0.86);

  const frameMaterial = new THREE.MeshStandardMaterial({
    color: "#111111",
    roughness: 0.36,
    metalness: 0.44,
  });
  const lensMaterial = new THREE.MeshPhysicalMaterial({
    color: "#4C2B2F",
    roughness: 0.15,
    transmission: 0.18,
    transparent: true,
    opacity: 0.62,
  });

  [-0.58, 0.58].forEach((x) => {
    const frame = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.06, 18, 72), frameMaterial);
    frame.position.x = x;
    frame.castShadow = true;
    group.add(frame);

    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.39, 48), lensMaterial);
    lens.position.set(x, 0, 0.02);
    group.add(lens);
  });

  const bridge = new THREE.Mesh(
    new THREE.TorusGeometry(0.2, 0.035, 12, 48),
    new THREE.MeshStandardMaterial({
      color: "#C9A227",
      roughness: 0.24,
      metalness: 0.65,
    })
  );
  bridge.position.set(0, 0.03, 0);
  bridge.rotation.z = Math.PI / 2;
  group.add(bridge);

  [-1, 1].forEach((side) => {
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.025, 1.05, 12), frameMaterial);
    arm.position.set(side * 1.1, 0.05, -0.16);
    arm.rotation.set(0, side * -0.55, side * -0.18);
    group.add(arm);
  });

  return group;
}

function createVeil() {
  const geometry = new THREE.PlaneGeometry(2.7, 2.05, 34, 20);
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshPhysicalMaterial({
      color: "#F8D5DF",
      roughness: 0.52,
      transmission: 0.2,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
    })
  );
  mesh.name = "veil";
  mesh.position.set(0.7, -0.98, -1.15);
  mesh.rotation.set(-0.18, -0.55, 0.13);
  return mesh;
}

function createDress() {
  const group = new THREE.Group();
  group.name = "dress";
  group.position.set(2.55, 0.78, -1.25);
  group.rotation.set(0.04, -0.28, 0);

  const bodice = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.62),
    new THREE.MeshStandardMaterial({
      color: "#2E5339",
      roughness: 0.68,
      metalness: 0.03,
    })
  );
  bodice.position.y = 0.48;
  bodice.castShadow = true;
  group.add(bodice);

  const skirt = new THREE.Mesh(
    new THREE.ConeGeometry(0.82, 1.85, 48, 12, true),
    new THREE.MeshStandardMaterial({
      color: "#314A44",
      roughness: 0.72,
      metalness: 0.02,
      side: THREE.DoubleSide,
    })
  );
  skirt.position.y = -0.36;
  skirt.scale.set(0.78, 1.2, 0.42);
  skirt.castShadow = true;
  group.add(skirt);

  const belt = new THREE.Mesh(
    new THREE.TorusGeometry(0.39, 0.035, 12, 64),
    new THREE.MeshStandardMaterial({
      color: "#C9A227",
      roughness: 0.26,
      metalness: 0.55,
    })
  );
  belt.position.set(0, 0.13, 0.03);
  belt.rotation.z = Math.PI / 2;
  group.add(belt);

  return group;
}

function addSparkles(scene: THREE.Scene) {
  const geometry = new THREE.BufferGeometry();
  const vertices: number[] = [];
  const colors: number[] = [];
  const color = new THREE.Color("#C9A227");

  for (let i = 0; i < 65; i++) {
    vertices.push(
      THREE.MathUtils.randFloatSpread(7),
      THREE.MathUtils.randFloatSpread(3.1),
      THREE.MathUtils.randFloat(-1.8, 1.2)
    );
    colors.push(color.r, color.g, color.b);
  }

  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  const points = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
    })
  );
  points.name = "sparkles";
  scene.add(points);
  return points;
}

export default function Hero3DScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
    renderer.shadowMap.enabled = true;
    renderer.setClearColor("#f6bdcc", 1);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#f6bdcc");
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0.15, 6.8);

    const ambient = new THREE.AmbientLight("#ffffff", 1.2);
    const key = new THREE.DirectionalLight("#ffffff", 2.4);
    key.position.set(4, 5, 5);
    key.castShadow = true;
    const fill = new THREE.PointLight("#F8F4EE", 1.4);
    fill.position.set(-3, 1.5, 3);
    const gold = new THREE.PointLight("#C9A227", 0.95);
    gold.position.set(2.5, -1.4, 3);
    scene.add(ambient, key, fill, gold);

    const turban = createTurban();
    const shades = createShades();
    const veil = createVeil();
    const dress = createDress();
    const sparkles = addSparkles(scene);
    const heroGroup = new THREE.Group();
    heroGroup.rotation.y = -0.05;
    heroGroup.add(turban, shades, veil, dress);
    scene.add(heroGroup);

    const resize = () => {
      const width = canvas.clientWidth || 1;
      const height = canvas.clientHeight || 1;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      if (width < 640) {
        camera.position.z = 8.9;
        heroGroup.position.set(1.18, -0.12, 0);
        heroGroup.scale.setScalar(0.76);
      } else {
        camera.position.z = 6.8;
        heroGroup.position.set(0, 0, 0);
        heroGroup.scale.setScalar(1);
      }
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    let frameId = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      const t = clock.getElapsedTime();

      if (!reducedMotion.matches) {
        turban.rotation.y = Math.sin(t * 0.32) * 0.28;
        turban.rotation.z = -0.05 + Math.sin(t * 0.22) * 0.08;
        turban.position.y = 0.65 + Math.sin(t * 0.75) * 0.08;

        shades.rotation.x = -0.08 + Math.sin(t * 0.4) * 0.04;
        shades.rotation.y = 0.35 + Math.cos(t * 0.35) * 0.22;
        shades.position.y = -0.95 + Math.sin(t * 0.9 + 1.1) * 0.07;

        dress.rotation.y = -0.28 + Math.sin(t * 0.28) * 0.22;
        dress.position.y = 0.78 + Math.sin(t * 0.62 + 2) * 0.06;

        sparkles.rotation.y = t * 0.035;

        const veilGeometry = (veil as THREE.Mesh<THREE.PlaneGeometry>).geometry;
        const positions = veilGeometry.attributes.position;
        for (let i = 0; i < positions.count; i++) {
          const x = positions.getX(i);
          const y = positions.getY(i);
          positions.setZ(
            i,
            Math.sin(x * 3.2 + t * 1.15) * 0.09 +
              Math.cos(y * 4.4 + t * 0.8) * 0.05
          );
        }
        positions.needsUpdate = true;
        veilGeometry.computeVertexNormals();
      }

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(frameId);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
          object.geometry.dispose();
          const material = object.material;
          if (Array.isArray(material)) material.forEach((item) => item.dispose());
          else material.dispose();
        }
      });
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="block h-full w-full"
      aria-hidden="true"
    />
  );
}
