'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson-client';
import type { Topology } from 'topojson-specification';

type GeoGeometry = {
  type: string;
  coordinates: unknown;
};

const CITIES: [number, number][] = [
  [-74.0, 40.7],
  [-0.13, 51.5],
  [2.35, 48.86],
  [13.4, 52.52],
  [-122.42, 37.77],
  [139.69, 35.69],
  [103.82, 1.35],
  [151.21, -33.87],
  [-46.63, -23.55],
  [77.21, 28.61],
  [55.27, 25.2],
  [126.98, 37.57],
  [18.42, -33.92],
  [24.94, 60.17],
];

function pointInPolygon(point: [number, number], polygon: number[][]) {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function pointInFeature(point: [number, number], geometry: GeoGeometry) {
  if (geometry.type === 'Polygon') {
    const rings = geometry.coordinates as number[][][];
    return pointInPolygon(point, rings[0]);
  }
  if (geometry.type === 'MultiPolygon') {
    const polys = geometry.coordinates as number[][][][];
    return polys.some((polygon) => pointInPolygon(point, polygon[0]));
  }
  return false;
}

function generateDots(geometry: GeoGeometry, step = 1.45) {
  const dots: [number, number][] = [];
  const collect = (ring: number[][]) => {
    let minLng = 180;
    let maxLng = -180;
    let minLat = 90;
    let maxLat = -90;
    for (const [lng, lat] of ring) {
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
    }
    for (let lng = minLng; lng <= maxLng; lng += step) {
      for (let lat = minLat; lat <= maxLat; lat += step) {
        const pt: [number, number] = [lng, lat];
        if (pointInFeature(pt, geometry)) dots.push(pt);
      }
    }
  };

  if (geometry.type === 'Polygon') {
    collect((geometry.coordinates as number[][][])[0]);
  } else if (geometry.type === 'MultiPolygon') {
    for (const polygon of geometry.coordinates as number[][][][]) collect(polygon[0]);
  }
  return dots;
}

function facingZ(lng: number, lat: number, rotate: (p: [number, number]) => [number, number]) {
  const [rlng, rlat] = rotate([lng, lat]);
  const latR = (rlat * Math.PI) / 180;
  const lngR = (rlng * Math.PI) / 180;
  return Math.cos(latR) * Math.cos(lngR);
}

export default function RotatingEarth({
  width,
  height,
  className = '',
}: {
  width?: number;
  height?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    let dots: [number, number][] = [];
    let lambda = 24;
    const phi = -14;
    let raf = 0;
    let running = true;
    let visible = true;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const layout = () => {
      const rect = wrap.getBoundingClientRect();
      const w = width || Math.max(320, rect.width);
      const h = height || Math.max(320, rect.height);
      const dpr = window.devicePixelRatio || 1;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { w, h, radius: Math.min(w, h) * 0.46 };
    };

    let { w, h, radius } = layout();

    const projection = d3.geoOrthographic().clipAngle(90);
    const path = d3.geoPath().projection(projection).context(context);
    const graticule = d3.geoGraticule().step([18, 18]);

    const render = () => {
      const rotate = d3.geoRotation([lambda, phi]);
      projection.scale(radius).translate([w / 2, h / 2]).rotate([lambda, phi]);
      context.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      const halo = context.createRadialGradient(cx, cy, radius * 0.92, cx, cy, radius * 1.18);
      halo.addColorStop(0, 'rgba(255,92,0,0.16)');
      halo.addColorStop(0.45, 'rgba(255,92,0,0.05)');
      halo.addColorStop(1, 'rgba(255,92,0,0)');
      context.beginPath();
      context.arc(cx, cy, radius * 1.18, 0, Math.PI * 2);
      context.fillStyle = halo;
      context.fill();

      context.beginPath();
      context.arc(cx, cy, radius, 0, Math.PI * 2);
      const ball = context.createRadialGradient(cx - radius * 0.28, cy - radius * 0.34, radius * 0.08, cx, cy, radius);
      ball.addColorStop(0, '#1a1a1a');
      ball.addColorStop(0.55, '#0b0b0b');
      ball.addColorStop(1, '#050505');
      context.fillStyle = ball;
      context.fill();

      context.beginPath();
      path(graticule());
      context.strokeStyle = 'rgba(255,255,255,0.07)';
      context.lineWidth = 0.6;
      context.stroke();

      const size = Math.max(0.7, radius / 260);
      for (const [lng, lat] of dots) {
        const projected = projection([lng, lat]);
        if (!projected) continue;
        const z = facingZ(lng, lat, rotate);
        if (z < 0.08) continue;
        const lit = 0.22 + z * 0.78;
        context.fillStyle = `rgba(236,236,236,${lit.toFixed(3)})`;
        context.beginPath();
        context.arc(projected[0], projected[1], size * (0.75 + z * 0.45), 0, Math.PI * 2);
        context.fill();
      }

      for (const [lng, lat] of CITIES) {
        const projected = projection([lng, lat]);
        if (!projected) continue;
        const z = facingZ(lng, lat, rotate);
        if (z < 0.18) continue;
        context.beginPath();
        context.arc(projected[0], projected[1], 2.1 * z, 0, Math.PI * 2);
        context.fillStyle = `rgba(255,92,0,${0.35 + z * 0.55})`;
        context.fill();
        context.beginPath();
        context.arc(projected[0], projected[1], 7 * z, 0, Math.PI * 2);
        context.fillStyle = `rgba(255,92,0,${0.08 * z})`;
        context.fill();
      }

      context.beginPath();
      context.arc(cx, cy, radius, 0, Math.PI * 2);
      const shade = context.createRadialGradient(cx - radius * 0.32, cy - radius * 0.38, radius * 0.05, cx, cy, radius);
      shade.addColorStop(0, 'rgba(255,255,255,0.1)');
      shade.addColorStop(0.35, 'rgba(255,255,255,0.02)');
      shade.addColorStop(0.72, 'rgba(0,0,0,0)');
      shade.addColorStop(1, 'rgba(0,0,0,0.55)');
      context.fillStyle = shade;
      context.fill();

      context.beginPath();
      context.arc(cx, cy, radius, 0, Math.PI * 2);
      context.strokeStyle = 'rgba(255,255,255,0.12)';
      context.lineWidth = 1;
      context.stroke();
    };

    const tick = () => {
      if (!running) return;
      if (visible && !prefersReduced) lambda -= 0.045;
      render();
      raf = requestAnimationFrame(tick);
    };

    const ro = new ResizeObserver(() => {
      const next = layout();
      w = next.w;
      h = next.h;
      radius = next.radius;
      render();
    });
    ro.observe(wrap);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.12 },
    );
    io.observe(wrap);

    void fetch('/marketing/land-110m.json')
      .then((res) => res.json())
      .then((topology: Topology) => {
        const land = feature(topology, topology.objects.land);
        const geometries =
          land.type === 'FeatureCollection'
            ? land.features.map((item) => item.geometry as GeoGeometry)
            : [land.geometry as GeoGeometry];
        dots = geometries.flatMap((geo) => generateDots(geo));
        raf = requestAnimationFrame(tick);
      });

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [height, width]);

  return (
    <div ref={wrapRef} className={`pointer-events-none relative h-full w-full ${className}`}>
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
