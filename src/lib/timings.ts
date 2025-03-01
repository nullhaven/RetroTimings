export type Report = {
	version: string;
	entities: number;
	living: number;
	time: number;
	records: Array<Record>;
};

type Record = {
	source: Source;
	timings: Timing[];
	time: number;
};

type Source = Plugin | Game;

type Plugin = { name: string; version: string };
type Game = "Minecraft";

type Timing = EventTiming | TaskTiming | NamedTiming;

type BaseTiming = {
	time: number;
	count: number;
	average: number;
	violations: number;
};

export type EventTiming = BaseTiming & { name: string; group: boolean };
export type TaskTiming = BaseTiming & { source: Source; interval: number | null };
export type NamedTiming = BaseTiming & { name: string };

const sourcePattern = /(?:(.*) (.*))|(Minecraft)/;
const eventTimingPattern =
	/^\s*([^(]+)(?: (\(and others\)))? Time: (\d+) Count: (\d+) Avg: (\d+) Violations: (\d+)/;
const taskTimingPattern =
	/^\s*Task: (.*) (.*) Id:\((?:interval:(\d+)|Single)\) Time: (\d+) Count: (\d+) Avg: (\d+) Violations: (\d+)/;
const namedTimingPattern =
	/^\s*(?:\*\* )?(.*) Time: (\d+) Count: (\d+) Avg: (\d+) Violations: (\d+)/;
const totalTimePattern = /^\s*Total time (\d+)/;

const versionPattern = /^# Version (.*)/;
const entitiesPattern = /^# Entities (\d+)/;
const livingPattern = /^# LivingEntities (\d+)/;
const sampleTimePattern = /^Sample time (\d+)/;

export async function parseTimings(file: File): Promise<Report> {
	const text = await readFileText(file);
	const report: Partial<Report> = { records: [] };
	let record: Partial<Record> = { timings: [] };

	for (const line of text.replaceAll("\r", "").split("\n")) {
		let match: RegExpMatchArray | null;

		if (line.startsWith(" ")) {
			// Timing entry

			if (record.source === "Minecraft") {
				if ((match = taskTimingPattern.exec(line)) != null) {
					record.timings?.push({
						source: { name: match[1], version: match[2] },
						interval: match[3] ? +match[3] : null,
						time: +match[4],
						count: +match[5],
						average: +match[6],
						violations: +match[7]
					} satisfies TaskTiming);
				} else if ((match = namedTimingPattern.exec(line)) != null) {
					record.timings?.push({
						name: match[1],
						time: +match[2],
						count: +match[3],
						average: +match[4],
						violations: +match[5]
					} satisfies NamedTiming);
					continue;
				}
			}

			if ((match = eventTimingPattern.exec(line)) != null) {
				record.timings?.push({
					name: match[1],
					group: !!match[2],
					time: +match[3],
					count: +match[4],
					average: +match[5],
					violations: +match[6]
				} satisfies EventTiming);
			} else if ((match = totalTimePattern.exec(line)) != null) {
				record.time = +match[1];
				report.records?.push(record as Record);
				record = { timings: [] };
			}
		} else if (line.startsWith("#")) {
			// Metadata entry

			if (record.source != null) {
				report.records?.push(record as Record);
				record = { timings: [] };
			}

			if ((match = versionPattern.exec(line)) != null) {
				report.version = match[1];
			} else if ((match = entitiesPattern.exec(line)) != null) {
				report.entities = +match[1];
			} else if ((match = livingPattern.exec(line)) != null) {
				report.living = +match[1];
			}
		} else {
			// Source entry OR sample time

			if ((match = sourcePattern.exec(line)) != null) {
				if (match[3]) record.source = "Minecraft";
				else record.source = { name: match[1], version: match[2] };
			} else if ((match = sampleTimePattern.exec(line)) != null) {
				record.time = +match[1];
			}
		}
	}

	return report as Report;
}

function readFileText(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = () => reject(reader.error);
		reader.readAsText(file);
	});
}
