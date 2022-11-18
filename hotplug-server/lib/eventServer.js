const fs = require('node:fs');
const { readFile } = require('node:fs/promises');
const path = require('node:path');

const express = require('express');

class EventServer {
	#port;
	#docroot;
	#zips;
	#zipTimeouts;
	#http;
	#app;
	#listeners;
	#watchers;

	constructor(config) {
		this.#port = config.port;
		this.#zips = config.zips;
		this.#docroot = config.docroot;
		this.#zipTimeouts = {};

		this.#listeners = [];
		this.#watchers = [];

		this.#app = express();
		this.initServer();
	}

	setHeaders(res)
	{
		res.set('Access-Control-Allow-Origin', '*');
		res.set('Cache-Control', 'no-store');
	}

	initServer()
	{
		this.#app.use('/static', express.static(this.#docroot, {
			setHeaders: (res) => this.setHeaders(res)
		}));

		this.#app.get('/events', (req, res) => {
			res.status(200);
			res.type('text/event-stream');
			this.setHeaders(res);
			this.#listeners.push(res);
		});

		this.#app.get('/zip/:index', async (req, res) => {
			this.setHeaders(res);

			const zipIndex = parseInt(req.params.index || 'nan');
			if (isNaN(zipIndex) || !this.#zips[zipIndex])
			{
				res.status(404).send('Bad index');
				return;
			}

			const zipPath = this.#zips[zipIndex];
			let contents;
			try {
				contents = await readFile(zipPath);
			} catch (err) {
				res.status(500).send('Unable to read zip file');
				return;
			}

			res.send({
				name: path.basename(zipPath),
				contents: contents
			});
		});
	}

	broadcast(msg) {
		for (const l of this.#listeners)
		{
			l.write(
`data: ${msg}

`);
		}
	}

	listen() {
		const port = this.#port;
		this.#http = this.#app.listen(port, () => {
			console.log(`Listening at http://localhost:${port}`);
		});

		for (let i = 0; i < this.#zips.length; ++i) {
			const zip = this.#zips[i];
			const dir = path.dirname(zip);
			const w = fs.watch(dir);
			this.#watchers.push(w);
			w.on('change', this.fileChange.bind(this, i, dir));
		}
	}

	async shutdown() {
		for (const w of this.#watchers) {
			w.close();
		}

		console.log('Shutting down server');
		const promises = [];
		for (const l of this.#listeners) {
			promises.push(new Promise((res) => {
				l.end(res);
			}));
		}

		await Promise.all(promises);
		return new Promise((res)=>{
			this.#http.close(res);
		});
	}

	fileChange(zipIndex, dirName, eventType, fileName) {
		if (
			path.resolve(this.#zips[zipIndex]) !==
			path.resolve(dirName, fileName)
		)
		{
			return;
		}

		console.log(`${eventType}: ${fileName}`);

		if (this.#zipTimeouts[zipIndex]) {
			clearTimeout(this.#zipTimeouts[zipIndex]);
		}

		this.#zipTimeouts[zipIndex] = setTimeout(() => {
			delete this.#zipTimeouts[zipIndex];
			console.log(`Broadcasting ${fileName}`);
			this.broadcast(zipIndex);
		}, 100);
	}
}

module.exports = {
	EventServer
};
