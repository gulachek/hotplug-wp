function log(s) {
	const elem = document.getElementById('log');
	const entry = document.createElement('code');
	const br = document.createElement('br');
	const now = new Date();
	entry.innerText = `[${now}] ${s}`;
	elem.appendChild(entry);
	elem.appendChild(br);
}

class ZipListener {
	#url;
	#base;
	#src;
	#zipDirty;
	#zipInProgress;

	constructor(url, base) {
		this.#url = url; // url for this web server
		this.#base = base; // base for wordpress web server
		this.#zipDirty = {};
		this.#zipInProgress = {};
	}

	listen() {
		const url = this.#url;
		log(`Connecting to ${url}`);
		const src = new EventSource(`${url}/events`);
		this.#src = src;
		src.addEventListener('error', this.srcError.bind(this));
		src.addEventListener('open', this.srcOpen.bind(this));
		src.addEventListener('message', this.srcMsg.bind(this));
	}

	srcError() {
		log(`Connection error...`);
		this.#src.close();
	}

	srcOpen() {
		log('Connection opened');
	}

	srcMsg(e) {
		log('Received update');
		const zipIndex = parseInt(e.data);
		this.updateZip(zipIndex);
	}

	async loadZipFile(zipIndex) {
		const url = this.#url;
		const xhr = new XMLHttpRequest();
		xhr.responseType = 'json';
		xhr.open('GET', `${url}/zip/${zipIndex}`);
		return new Promise((res,rej) => {
			xhr.onload = () => {
				res(xhr.response);
			};

			xhr.onerror = rej;

			xhr.send();
		});
	}

	async updateZip(zipIndex) {
		if (this.#zipInProgress[zipIndex]) {
			this.#zipDirty[zipIndex] = true;
			return;
		}

		delete this.#zipDirty[zipIndex];
		this.#zipInProgress[zipIndex] = true;

		const fdata = await this.loadZipFile(zipIndex);

		const file = new File(
			[Uint8Array.from(fdata.contents.data)],
			fdata.name,
			{ type: 'application/zip' }
		);

		const fname = fdata.name;

		const form = new FormData();
		form.append('pluginzip', file);
		const xhr = new XMLHttpRequest();
		xhr.open('POST', `${this.#base}/wp-admin/update.php?action=hotplug_upload`);
		xhr.onload = () => {
			log(`Updated ${fname}`);
			this.pumpZip(zipIndex);
		};
		xhr.onerror = () => {
			log(`Error updating ${fname}. See console.`);
			this.pumpZip(zipIndex);
		};
		xhr.send(form);
	}

	pumpZip(zipIndex) {
		delete this.#zipInProgress[zipIndex];
		if (this.#zipDirty[zipIndex]) {
			this.updateZip(zipIndex);
		}
	}
}

const { origin } = new URL(import.meta.url);
const base = (new URL(window.location.href)).origin;

const listener = new ZipListener(origin, base);
listener.listen();
