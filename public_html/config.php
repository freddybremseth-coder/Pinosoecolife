<?php
$localConfig = dirname(__DIR__) . '/config.local.php';

if (file_exists($localConfig)) {
    return require $localConfig;
}

return [
    'db_host' => getenv('PINOSO_DB_HOST') ?: 'localhost',
    'db_user' => getenv('PINOSO_DB_USER') ?: '',
    'db_pass' => getenv('PINOSO_DB_PASS') ?: '',
    'db_name' => getenv('PINOSO_DB_NAME') ?: '',

    'site_name' => 'Pinoso Eco Life',
    'realtyflow_brand_id' => getenv('REALTYFLOW_BRAND_ID') ?: 'pinosoecolife',
    'realtyflow_contacts_endpoint' => getenv('REALTYFLOW_CONTACTS_ENDPOINT') ?: 'https://realtyflow.chatgenius.pro/api/contacts',
    'realtyflow_properties_endpoint' => getenv('REALTYFLOW_PROPERTIES_ENDPOINT') ?: 'https://realtyflow.chatgenius.pro/api/properties',

    'gemini_api_key' => getenv('GEMINI_API_KEY') ?: '',
    'replicate_api_key' => getenv('REPLICATE_API_KEY') ?: '',
];
