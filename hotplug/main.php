<?php
/**
 * Plugin Name: hotplug
 * Author: Nicholas Gulachek
 * Description: Hotload plugins
 */

function hotplug_loader_page_html() {
	include(__DIR__ . '/loader.php');
}

add_action( 'admin_menu', 'hotplug_loader_page' );
function hotplug_loader_page() {
	add_plugins_page(
		'hotplug',
		'hotplug',
		'upload_plugins',
		'hotplug_loader_page',
		'hotplug_loader_page_html'
	);
}

function hotplug_upload()
{
		if ( ! current_user_can( 'upload_plugins' ) ) {
			wp_die( __( 'Sorry, you are not allowed to install plugins on this site.' ) );
		}

		$file_upload = new File_Upload_Upgrader( 'pluginzip', 'package' );

		$title        = __( 'Hotplug Upload Plugin' );
		$parent_file  = 'plugins.php';
		$submenu_file = 'plugin-install.php';
		require_once ABSPATH . 'wp-admin/admin-header.php';

		/* translators: %s: File name. */
		$title = sprintf( __( 'Installing plugin from uploaded file: %s' ), esc_html( basename( $file_upload->filename ) ) );
		$nonce = 'plugin-upload';
		$url   = add_query_arg( array( 'package' => $file_upload->id ), 'update.php?action=hotplug_upload' );
		$type  = 'upload'; // Install plugin type, From Web or an Upload.
		$overwrite = 'update-plugin';

		$upgrader = new Plugin_Upgrader( new Plugin_Installer_Skin( compact( 'type', 'title', 'nonce', 'url', 'overwrite' ) ) );
		$result   = $upgrader->install( $file_upload->package, array( 'overwrite_package' => $overwrite ) );

		if ( $result || is_wp_error( $result ) ) {
			$file_upload->cleanup();
		}

		require_once ABSPATH . 'wp-admin/admin-footer.php';
}
add_action('update-custom_hotplug_upload', 'hotplug_upload');

?>
