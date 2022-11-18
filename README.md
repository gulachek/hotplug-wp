# hotplug-wp
Plugin for hot reloading wordpress plugins, useful for containerized wordpress.

## Purpose

If a wordpress server is running in a container and a plugin is being developed
on the container's host machine, it's frustrating to need to manually zip and
upload the plugin for every update to the plugin code to test changes.  This
plugin allows for hot reloading a plugin into the containerized server when
there are updates to plugin zip files on the development machine.

## Usage
*This plugin is inappropriate for production servers and the author assumes
you're only using this for rapid plugin development.*

1. Clone this repo
1. Run 'zip.sh' in the repo's directory
1. Install the zipped plugin on your wordpress **DEVELOPMENT** site
1. Go to the 'hotplug' submenu of the 'Plugins' admin page
1. Follow the instructions on the page to hot reload your plugins
	 machine
