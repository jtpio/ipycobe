import * as React from "react";
import { createRender, useModelState } from "@anywidget/react";
import { useSpring } from "@react-spring/web";
import createGlobe from "cobe";
import type { Marker } from "cobe";
import "./widget.css";

interface GlobeProps {
	width: number;
	height: number;
	phi: number;
	theta: number;
	dark: number;
	diffuse: number;
	mapSamples: number;
	mapBrightness: number;
	baseColor: [number, number, number];
	markerColor: [number, number, number];
	glowColor: [number, number, number];
	markers: Marker[];
	scale: number;
	devicePixelRatio: number;
	autoRotate: boolean;
	autoRotateSpeed: number;
	draggable: boolean;
}

function Globe({
	width,
	height,
	phi: initialPhi,
	theta,
	dark,
	diffuse,
	mapSamples,
	mapBrightness,
	baseColor,
	markerColor,
	glowColor,
	markers,
	scale,
	devicePixelRatio,
	autoRotate,
	autoRotateSpeed,
	draggable,
}: GlobeProps) {
	const canvasRef = React.useRef<HTMLCanvasElement>(null);
	const phiRef = React.useRef(initialPhi);
	const pointerInteracting = React.useRef<number | null>(null);
	const pointerInteractionMovement = React.useRef(0);

	const [{ r }, api] = useSpring(() => ({
		r: 0,
		config: {
			mass: 1,
			tension: 280,
			friction: 40,
			precision: 0.001,
		},
	}));

	React.useEffect(() => {
		if (!canvasRef.current) return;

		phiRef.current = initialPhi;

		const globe = createGlobe(canvasRef.current, {
			width: width * devicePixelRatio,
			height: height * devicePixelRatio,
			phi: initialPhi,
			theta,
			dark,
			diffuse,
			mapSamples,
			mapBrightness,
			baseColor,
			markerColor,
			glowColor,
			markers,
			scale,
			devicePixelRatio,
			onRender: (state) => {
				if (!pointerInteracting.current && autoRotate) {
					phiRef.current += autoRotateSpeed;
				}
				state.phi = phiRef.current + r.get();
				state.theta = theta;
			},
		});

		return () => {
			globe.destroy();
		};
	}, [
		width,
		height,
		initialPhi,
		theta,
		dark,
		diffuse,
		mapSamples,
		mapBrightness,
		baseColor,
		markerColor,
		glowColor,
		markers,
		scale,
		devicePixelRatio,
		autoRotate,
		autoRotateSpeed,
	]);

	const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
		if (!draggable) return;
		pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
		if (canvasRef.current) {
			canvasRef.current.setPointerCapture(e.pointerId);
			canvasRef.current.style.cursor = "grabbing";
		}
	};

	const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
		pointerInteracting.current = null;
		if (canvasRef.current) {
			canvasRef.current.releasePointerCapture(e.pointerId);
			canvasRef.current.style.cursor = "grab";
		}
	};

	const handlePointerCancel = (e: React.PointerEvent<HTMLCanvasElement>) => {
		pointerInteracting.current = null;
		if (canvasRef.current) {
			canvasRef.current.releasePointerCapture(e.pointerId);
			canvasRef.current.style.cursor = "grab";
		}
	};

	const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
		if (!draggable) return;
		if (pointerInteracting.current !== null) {
			const delta = e.clientX - pointerInteracting.current;
			pointerInteractionMovement.current = delta;
			const divisor = e.pointerType === "touch" ? 100 : 200;
			api.start({ r: delta / divisor });
		}
	};

	return (
		<canvas
			ref={canvasRef}
			width={width * devicePixelRatio}
			height={height * devicePixelRatio}
			style={{
				width: `${width}px`,
				height: `${height}px`,
				cursor: draggable ? "grab" : "default",
			}}
			onPointerDown={draggable ? handlePointerDown : undefined}
			onPointerMove={draggable ? handlePointerMove : undefined}
			onPointerUp={draggable ? handlePointerUp : undefined}
			onPointerCancel={draggable ? handlePointerCancel : undefined}
			onPointerLeave={draggable ? handlePointerCancel : undefined}
		/>
	);
}

const render = createRender(() => {
	const [width] = useModelState<number>("width");
	const [height] = useModelState<number>("height");
	const [phi] = useModelState<number>("phi");
	const [theta] = useModelState<number>("theta");
	const [dark] = useModelState<number>("dark");
	const [diffuse] = useModelState<number>("diffuse");
	const [mapSamples] = useModelState<number>("map_samples");
	const [mapBrightness] = useModelState<number>("map_brightness");
	const [baseColor] = useModelState<[number, number, number]>("base_color");
	const [markerColor] = useModelState<[number, number, number]>("marker_color");
	const [glowColor] = useModelState<[number, number, number]>("glow_color");
	const [markers] = useModelState<Marker[]>("markers");
	const [scale] = useModelState<number>("scale");
	const [devicePixelRatio] = useModelState<number>("device_pixel_ratio");
	const [autoRotate] = useModelState<boolean>("auto_rotate");
	const [autoRotateSpeed] = useModelState<number>("auto_rotate_speed");
	const [draggable] = useModelState<boolean>("draggable");

	return (
		<div className="ipycobe">
			<Globe
				width={width}
				height={height}
				phi={phi}
				theta={theta}
				dark={dark}
				diffuse={diffuse}
				mapSamples={mapSamples}
				mapBrightness={mapBrightness}
				baseColor={baseColor}
				markerColor={markerColor}
				glowColor={glowColor}
				markers={markers}
				scale={scale}
				devicePixelRatio={devicePixelRatio}
				autoRotate={autoRotate}
				autoRotateSpeed={autoRotateSpeed}
				draggable={draggable}
			/>
		</div>
	);
});

export default { render };
