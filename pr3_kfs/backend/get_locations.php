<?php
header('Content-Type: application/json');
require_once 'database.php';

$sql = "SELECT id, country, location_name FROM locations";
$stmt = $pdo->prepare($sql);
$stmt->execute();
$data = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($data);
?>
