<?php

$EM_CONF[$_EXTKEY] = [
    'title' => 'Ps14 Site',
    'description' => 'TYPO3 extension for customizing a TYPO3 installation to meet the specific requirements of a customer\'s website.',
    'category' => 'distribution',
    'author' => 'Christian Pschorr',
    'author_email' => 'pschorr.christian@gmail.com',
    'author_company' => '',
    'state' => 'beta',
    'version' => '14.0.0',
    'constraints' => [
        'depends' => [
            'typo3' => '14.0.0-14.99.99',
            'ps14_foundation' => '14.0.0-14.99.99',
        ],
        'conflicts' => [],
        'suggests' => [
            'ps14_modulor' => '2.0.0-2.9.99',
            'ps14_accordion' => '2.0.0-2.9.99',
            'ps14_downloads' => '2.0.0-2.9.99',
            'ps14_hero' => '2.0.0-2.9.99',
            'ps14_timeline' => '2.0.0-2.9.99',
            'ps14_kist_values' => '1.0.0-1.9.99',
            'ps14_marker' => '2.0.0-2.9.99',
            'ps14_container' => '2.0.0-2.9.99',
            'ps14_teaser' => '2.0.0-2.9.99',
            'ps14_address' => '1.0.0-1.9.99',
            'ps14_icon_text' => '1.0.0-1.9.99',
            'ps14_images' => '1.0.0-1.9.99',
        ],
    ],
];
