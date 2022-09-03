import { Worker } from 'node:worker_threads';

const buf = new SharedArrayBuffer(2048);
const lock = new Int32Array(buf, 0, 4);

// request / response memory space
const data = new Uint8Array(buf, 4, 2044);

const worker = new Worker('./worker.mjs', {	workerData: { buf } });

await new Promise(resolve => worker.on('message', resolve));

export function importMetaResolve(specifier) {
	data.fill(0);
	new TextEncoder().encodeInto(specifier, data);
	Atomics.store(lock, 0, 1);
	Atomics.notify(lock, 0);
	Atomics.wait(lock, 0, 1);
	return new TextDecoder().decode(data);
}
