<?php
header('Content-Type: application/json');
require_once 'database.php';

$locationId = isset($_GET['location_id']) ? (int)$_GET['location_id'] : 1;

$sql = "SELECT w.last_updated, w.temperature_celsius, w.feels_like_celsius, wd.wind_mph
        FROM weather_data w
        JOIN wind_data wd ON w.id = wd.weather_id
        WHERE w.location_id = :loc
        ORDER BY w.last_updated DESC
        LIMIT 60";

$stmt = $pdo->prepare($sql);
$stmt->execute(['loc' => $locationId]);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

$data = array_reverse(array_map(function ($r) {
    return [
        'date' => $r['last_updated'],
        'temperature' => (float)$r['temperature_celsius'],
        'feels_like' => (float)$r['feels_like_celsius'],
        'wind' => (float)$r['wind_mph']
    ];
}, $rows));

echo json_encode($data);
