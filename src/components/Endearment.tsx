import { useEffect, useState } from "react";

const ENDEARMENTS = [
	{ word: "Àyà mí", anim: "endear-cube" },
	{ word: "Obim", anim: "endear-shards" },
	{ word: "Coconut head", anim: "endear-pop" },
	{ word: "Baby Mi", anim: "endear-fade" },
	{ word: "My Lady", anim: "endear-rise" },
	{ word: "Daddy's Girl", anim: "endear-glow" },
	{ word: "Breathe with me", anim: "endear-breathe" },
] as const;

const ROTATION_MS = 28000;

interface EndearmentProps {
	prefix: string;
	suffix: string;
}

export function Endearment({ prefix, suffix }: EndearmentProps) {
	const [index, setIndex] = useState(0);

	useEffect(() => {
		const id = window.setInterval(() => {
			setIndex((i) => (i + 1) % ENDEARMENTS.length);
		}, ROTATION_MS);
		return () => window.clearInterval(id);
	}, []);

	const { word, anim } = ENDEARMENTS[index]!;
	const showShards = anim === "endear-shards";

	return (
		<span className="endear-greeting">
			{ENDEARMENTS.map(({ word: measuredWord }) => (
				<span key={measuredWord} aria-hidden="true" className="endear-line invisible">
					{prefix}<span className="endear-ending"><span>{measuredWord}</span><span>{suffix}</span></span>
				</span>
			))}
			<span className="endear-line">
				{prefix}<span className="endear-ending">
					<span className="endear-word text-rose-deep">
						<span key={word} className={`endear-word-text ${anim}`}>{word}</span>
						{showShards && (
							<span className="endear-particles" aria-hidden="true">
								{Array.from({ length: 8 }).map((_, i) => (
									<span key={i} className="endear-shard" />
								))}
							</span>
						)}
					</span><span>{suffix}</span>
				</span>
			</span>
		</span>
	);
}
