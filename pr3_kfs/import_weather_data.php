<?php

require_once 'backend/database/database.php';

$csvFile = fopen('data/GlobalWeatherRepository.csv', 'r');
if (!$csvFile) {
    die("Не вдалося відкрити CSV-файл.");
}

$header = fgetcsv($csvFile); 

while (($row = fgetcsv($csvFile)) !== false) {
    list(
        $country, $location_name, $latitude, $longitude, $timezone,
        $last_updated_epoch, $last_updated,
        $temperature_celsius, , ,
        $wind_mph, , $wind_degree, $wind_direction,
        , , , , $humidity, ,
        $feels_like_celsius, , , , , $gust_mph
    ) = $row;

    $stmt = $conn->prepare("SELECT id FROM locations WHERE location_name = ? AND country = ?");
    $stmt->bind_param("ss", $location_name, $country);
    $stmt->execute();
    $stmt->bind_result($location_id);
    if (!$stmt->fetch()) {
        $stmt->close();
        $stmt = $conn->prepare("INSERT INTO locations (country, location_name, latitude, longitude, timezone) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("sssds", $country, $location_name, $latitude, $longitude, $timezone);
        $stmt->execute();
        $location_id = $stmt->insert_id;
    } else {
        $stmt->close();
    }

    $stmt = $conn->prepare("INSERT INTO weather_data (location_id, last_updated, temperature_celsius, feels_like_celsius, humidity) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("isddi", $location_id, $last_updated, $temperature_celsius, $feels_like_celsius, $humidity);
    $stmt->execute();
    $weather_id = $stmt->insert_id;

    $stmt = $conn->prepare("INSERT INTO wind_data (weather_id, wind_mph, wind_degree, wind_direction, gust_mph) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("idisd", $weather_id, $wind_mph, $wind_degree, $wind_direction, $gust_mph);
    $stmt->execute();
    $stmt->close();
}

fclose($csvFile);
echo "Імпорт завершено!\n";
?>
