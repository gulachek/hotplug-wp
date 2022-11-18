#!/usr/bin/env node

const { EventServer } = require('./lib/eventServer');

const { Command } = require('commander');

const path = require('node:path');


async function main(pluginZipPaths, opts)
{
	const { port } = opts;
	const docroot = path.resolve(__dirname, 'docroot');

	const server = new EventServer({
		port,
		docroot,
		zips: pluginZipPaths.map(p => path.resolve(p))
	});

	server.listen();

	console.log('Press Ctrl+D to attempt graceful shutdown');
	// consume this
	process.stdin.on('data', (e) => { });

	// stop server when done
	process.stdin.on('end', async (e) => {
		await server.shutdown();
	});
}

const hotplug = new Command('hotplug');
hotplug
	.description('wordpress plugin hot reloader server')
	.argument('<plugin-zip-paths...>', 'The plugins to watch')
	.option('-p, --port <port>', "The webserver's port", '8080')
	.action(main)
;

hotplug.parse();
