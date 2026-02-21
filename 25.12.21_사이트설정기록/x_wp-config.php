<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the web site, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * Localized language
 * * ABSPATH
 *
 * @link https://wordpress.org/support/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define('WP_CACHE', true);
define( 'WPCACHEHOME', '/mandu799/www/wp-content/plugins/wp-super-cache/' );
define( 'DB_NAME', 'mandu799' );

/** Database username */
define( 'DB_USER', 'mandu799' );

/** Database password */
define( 'DB_PASSWORD', 'Ca*kcw1004' );

/** Database hostname */
define( 'DB_HOST', 'localhost' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */

define('WP_HOME','http://mandu799.mycafe24.com');
define('WP_SITEURL','http://mandu799.mycafe24.com');

define( 'AUTH_KEY',          '9NUd:AEw1_~/5At~b]<<e|8g9Rp}a|JkK?7V!{i3dz4_rPPu.[cq6|E6ED,{hH@d' );
define( 'SECURE_AUTH_KEY',   '-1x`}*GW^6j>&;&XQCLvr9uZdaj)e)Eul{r)ROwanp&77;INS- EtX=@m_uhA32y' );
define( 'LOGGED_IN_KEY',     'K,H 0r;Woc)m4zZ<hJF3HM#=){L2wH9wiwru]_y|j&P_/_W[,THfva`D ^/C1XF]' );
define( 'NONCE_KEY',         '>dprr?o^G=[ t|tkbD6JTj`bm`nw8[.>/kQ(9OpF9*pR?=52]<!-b vl)-_rmGx_' );
define( 'AUTH_SALT',         '8(,DjIN-F==_g:4{$s`-R=Y(K-q,O@$4fP@a$qRMm~Wj%;u,611vWEd:5XH2-$t~' );
define( 'SECURE_AUTH_SALT',  '85!}>L%d--X)sn+/YYGUp!MZH2{&rz-gIaUhvJ;tyamm@P%k7I|ySbw8|Qo1pQU!' );
define( 'LOGGED_IN_SALT',    'ffl25&8hpP^n9!>{QO2oHhisX{S_)C[si[i+edZ[x? wjz(#4c-h{!ad#9k/js{m' );
define( 'NONCE_SALT',        '%aIs^}Ky g(LxB3-MkLl~OdBf M5t~MGh[xRb1NHm^Lz#mh_o8I$ A!wN9):x5&N' );
define( 'WP_CACHE_KEY_SALT', '~OL-{${_.r0qA(jJdVU8M2{?>|kzh]{R Y`Kg7AS^hp>]_R+~o?;isl*^ZW/.Yy?' );


/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';


/* Add any custom values between this line and the "stop editing" line. */

// 사이트 기본 언어 설정
define( 'WPLANG', 'ko_KR' );

// 디버그 설정
define( 'WP_DEBUG', false );

/* Add any custom values between this line and the "stop editing" line. */

/* custom security setting */
define('DISALLOW_FILE_EDIT', true);
define('IMAGE_EDIT_OVERWRITE', true);
define('EMPTY_TRASH_DAYS', 7);


/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/support/article/debugging-in-wordpress/
 */
if ( ! defined( 'WP_DEBUG' ) ) {
	define( 'WP_DEBUG', false );
}

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
