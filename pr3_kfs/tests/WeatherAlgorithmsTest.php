<?php
use PHPUnit\Framework\TestCase;

class WeatherAlgorithmsTest extends TestCase
{
    private function getJsonFrom(string $script, array $params = []): ?array
{
    $query = http_build_query($params);
    $url = "http://localhost/dashboard/kfs_pr3_2.0/backend/{$script}.php?$query";  
    $response = @file_get_contents($url);
    if ($response === false) return null;
    return json_decode($response, true);
}
    public function testForecastStructure()
    {
        $data = $this->getJsonFrom('forecast', ['location_id' => 1]);

        $this->assertArrayHasKey('history', $data);
        $this->assertArrayHasKey('forecast', $data);
        $this->assertCount(15, $data['forecast']);
        $this->assertLessThanOrEqual(60, count($data['history']));

        $this->assertArrayHasKey('date', $data['forecast'][0]);
        $this->assertArrayHasKey('wind_mph', $data['forecast'][0]);
    }

    public function testForecastContinuity()
    {
        $data = $this->getJsonFrom('forecast', ['location_id' => 1]);
        $lastHistDate = end($data['history'])['date'];
        $firstForecastDate = $data['forecast'][0]['date'];
        $expected = (new DateTime($lastHistDate))->modify('+1 day')->format('Y-m-d');
        $this->assertEquals($expected, $firstForecastDate);
    }

    public function testImpactData()
    {
        $data = $this->getJsonFrom('impact', ['location_id' => 1]);
        $this->assertNotEmpty($data);
        $row = $data[0];

        $this->assertArrayHasKey('date', $row);
        $this->assertArrayHasKey('temperature', $row);
        $this->assertArrayHasKey('feels_like', $row);
        $this->assertArrayHasKey('wind', $row);

        $this->assertIsFloat($row['temperature']);
        $this->assertIsFloat($row['feels_like']);
    }

    public function testDeltaValues()
    {
        $data = $this->getJsonFrom('feel_delta', ['location_id' => 2]);
        $this->assertNotEmpty($data);
        $row = $data[0];

        $this->assertArrayHasKey('date', $row);
        $this->assertArrayHasKey('delta', $row);
        $this->assertIsFloat($row['delta']);
    }
}
