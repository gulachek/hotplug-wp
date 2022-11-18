#!/bin/sh

VERSION=0.1.0

(
	cd hotplug-server
	npm pack
)

mv "hotplug-server/hotplug-server-$VERSION.tgz" hotplug

ZIP="hotplug.$VERSION.zip"
rm $ZIP
zip -R $ZIP hotplug/*
