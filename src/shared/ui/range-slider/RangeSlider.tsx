"use client";

type RangeValue = {
	min: number;
	max: number;
};

type RangeSliderProps = {
	min: number;
	max: number;
	value: RangeValue;
	onChange: (value: RangeValue) => void;
	onChangeEnd?: (value: RangeValue) => void;
	step?: number;
};

const thumbClasses =
	"[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[4px] [&::-webkit-slider-thumb]:border-[var(--accent-primary)] [&::-webkit-slider-thumb]:bg-[var(--bg-primary)] [&::-webkit-slider-thumb]:shadow-[var(--shadow-primary)] [&::-webkit-slider-thumb]:cursor-pointer";

export function RangeSlider({
	min,
	max,
	value,
	onChange,
	onChangeEnd,
	step = 1,
}: RangeSliderProps) {
	const minPercent = Math.min(
		100,
		Math.max(0, ((value.min - min) / (max - min)) * 100),
	);

	const maxPercent = Math.min(
		100,
		Math.max(0, ((value.max - min) / (max - min)) * 100),
	);

	const handleMinChange = (newMin: number) => {
		onChange({
			min: Math.min(newMin, value.max - step),
			max: value.max,
		});
	};

	const handleMaxChange = (newMax: number) => {
		onChange({
			min: value.min,
			max: Math.max(newMax, value.min + step),
		});
	};

	const handleChangeEnd = () => {
		onChangeEnd?.(value);
	};

	return (
		<div className="space-y-3">
			<div className="relative h-6">
				<div
					className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[var(--bg-secondary)]"
					style={{
						left: "9px",
						right: "9px",
					}}
				>
					<div
						className="absolute top-0 h-full rounded-full bg-[var(--accent-primary)]"
						style={{
							left: `${minPercent}%`,
							right: `${100 - maxPercent}%`,
						}}
					/>
				</div>

				<input
					type="range"
					min={min}
					max={max}
					step={step}
					value={value.min}
					onChange={(event) => handleMinChange(Number(event.target.value))}
					onMouseUp={handleChangeEnd}
					onTouchEnd={handleChangeEnd}
					className={`pointer-events-none absolute inset-0 z-30 h-6 w-full appearance-none bg-transparent ${thumbClasses}`}
				/>

				<input
					type="range"
					min={min}
					max={max}
					step={step}
					value={value.max}
					onChange={(event) => handleMaxChange(Number(event.target.value))}
					onMouseUp={handleChangeEnd}
					onTouchEnd={handleChangeEnd}
					className={`pointer-events-none absolute inset-0 z-20 h-6 w-full appearance-none bg-transparent ${thumbClasses}`}
				/>
			</div>
		</div>
	);
}