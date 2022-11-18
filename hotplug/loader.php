<?php

if (!current_user_can('upload_plugins'))
{
	wp_die("Sorry, you can't upload plugins");
}

// default
$port = 8080;

if (isset($_REQUEST['port']))
{
	$port = $_REQUEST['port'];
	$ws_url = "http://localhost:$port"; // web server URL
}

?>

<h1>
	<?= esc_html( get_admin_page_title() ); ?>
</h1>

<?php
$server_package_url = plugins_url('/hotplug-server-0.1.0.tgz', __FILE__);
?>

<p>

Usage instructions:

<ol>

<li> <a
href="<?= plugins_url("/run_server.php?server_url=$server_package_url", __FILE__) ?>"
download="run_server.sh" > Download </a> this script to run the server
</li>

<li>
Once the server is running, click 'Listen' with the correct port
</li>

<li>
Leave this tab open to keep the connection open
</li>

<li>
When the plugins you specified when starting the server are updated, you'll see a log on this page when the plugins are updated on the wordpress server
</li>

</ol>
</p>

<form method="POST"
	action="<?php menu_page_url('hotplug_loader_page')?>">

	<input type="number" name="port" value="<?=$port?>"/>
	<input type="submit" value="Listen" />
</form>

<div id="log">
</div>

<?php if (isset($ws_url)): ?>

<script type="module" src="<?= "$ws_url/static/listen.js" ?>">
</script>

<?php else: ?>

<p> Enter a port to begin hotloading plugins... </p>

<?php endif; ?>
