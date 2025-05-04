<?php
header('Content-Type: application/json');
require_once 'database.php';

$locationId = isset($_GET['location_id']) ? (int)$_GET['location_id'] : 1;

$sql = "SELECT DATE(w.last_updated) AS date,
               AVG(w.temperature_celsius) AS temp,
               AVG(w.feels_like_celsius) AS feels
        FROM weather_data w
        WHERE w.location_id = :loc
        GROUP BY DATE(w.last_updated)
        ORDER BY DATE(w.last_updated) DESC
        LIMIT 60";

$stmt = $pdo->prepare($sql);
$stmt->execute(['loc' => $locationId]);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

$data = array_reverse(array_map(function ($r) {
    $diff = round($r['feels'] - $r['temp'], 2);
    return [
        'date' => $r['date'],
        'delta' => $diff
    ];
}, $rows));

echo json_encode($data);
