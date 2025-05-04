<?php
header('Content-Type: application/json');
require_once 'database.php';

$locationId = isset($_GET['location_id']) ? (int)$_GET['location_id'] : 1;

$sql = "SELECT wd.wind_mph, w.last_updated
        FROM wind_data wd
        JOIN weather_data w ON wd.weather_id = w.id
        WHERE w.location_id = :loc
        ORDER BY w.last_updated ASC";

$stmt = $pdo->prepare($sql);
$stmt->execute(['loc' => $locationId]);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (count($rows) < 30) {
    echo json_encode(['error' => 'Недостатньо даних для прогнозу']);
    exit;
}

$data = [];
foreach ($rows as $r) {
    $data[] = [
        'date' => $r['last_updated'],
        'wind_mph' => (float)$r['wind_mph']
    ];
}
$history = array_slice($data, -60);

$lastDate = new DateTime(end($data)['date']);
$hi = array_column($data, 'wind_mph');
$daysBack = [7, 14, 21];

$forecast = [];
for ($i = 1; $i <= 15; $i++) {
    $similarValues = [];
    foreach ($daysBack as $offset) {
        $index = count($hi) - $offset + $i - 1;
        if (isset($hi[$index])) {
            $similarValues[] = $hi[$index];
        }
    }

    $avg = count($similarValues) ? array_sum($similarValues) / count($similarValues) : end($hi);
    $noise = rand(-2, 2);
    $wind = round(max(0, $avg + $noise), 2);

    $date = clone $lastDate;
    $date->modify("+$i days");
    $forecast[] = [
        'date' => $date->format('Y-m-d'),
        'wind_mph' => $wind
    ];
}

echo json_encode([
    'history' => $history,
    'forecast' => $forecast
]);
