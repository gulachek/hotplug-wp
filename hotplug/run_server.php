curl -o server.tgz "<?= $_REQUEST['server_url'] ?>"
tar xfvz server.tgz
mv package server
cd server
npm i
echo Start the server with "'cd server && npm start /path/to/plugin.zip' "
