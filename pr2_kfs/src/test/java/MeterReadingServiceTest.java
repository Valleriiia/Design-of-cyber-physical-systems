import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.example.entity.Meter;
import com.example.entity.MeterReading;
import com.example.repository.MeterReadingRepository;
import com.example.repository.MeterRepository;
import com.example.service.MeterReadingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public class MeterReadingServiceTest {
    @Mock
    private MeterReadingRepository meterReadingRepository;
    @Mock
    private MeterRepository meterRepository;

    @InjectMocks
    private MeterReadingService meterReadingService;

    private Meter meter;
    private MeterReading previousReading;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        meter = new Meter();
        meter.setId(1L);
        meter.setMeterNumber(String.valueOf(10));

        previousReading = new MeterReading();
        previousReading.setId(1L);
        previousReading.setMeter(meter);
        previousReading.setDayReading(100);
        previousReading.setNightReading(50);
        previousReading.setDateTime(LocalDateTime.now().minusDays(1));
    }

    @Test
    void testUpdateExistingMeterReading() {
        MeterReading newReading = new MeterReading();
        newReading.setMeter(meter);
        newReading.setDayReading(120);
        newReading.setNightReading(70);
        newReading.setDateTime(LocalDateTime.now());

        when(meterRepository.findByMeterNumber(String.valueOf(10))).thenReturn(Optional.of(meter));
        when(meterReadingRepository.findByMeterId(1L)).thenReturn(List.of(previousReading));

        boolean result = meterReadingService.saveMeterReading(newReading);

        assertTrue(result);
        verify(meterReadingRepository, times(1)).save(any(MeterReading.class));
    }

    @Test
    void testSaveReadingForNewMeter() {
        Meter newMeter = new Meter();
        newMeter.setId(2L);
        newMeter.setMeterNumber(String.valueOf(20));

        MeterReading newReading = new MeterReading();
        newReading.setMeter(newMeter);
        newReading.setDayReading(50);
        newReading.setNightReading(30);
        newReading.setDateTime(LocalDateTime.now());

        when(meterRepository.findByMeterNumber(String.valueOf(20))).thenReturn(Optional.empty());
        when(meterRepository.save(any(Meter.class))).thenReturn(newMeter);

        boolean result = meterReadingService.saveMeterReading(newReading);

        assertTrue(result);
        verify(meterRepository, times(1)).save(any(Meter.class));
        verify(meterReadingRepository, times(1)).save(any(MeterReading.class));
    }

    @Test
    void testRejectLowerNightReading() {
        MeterReading newReading = new MeterReading();
        newReading.setMeter(meter);
        newReading.setDayReading(120);
        newReading.setNightReading(40); // Нижче попереднього
        newReading.setDateTime(LocalDateTime.now());

        when(meterRepository.findByMeterNumber(String.valueOf(10))).thenReturn(Optional.of(meter));
        when(meterReadingRepository.findByMeterId(1L)).thenReturn(List.of(previousReading));

        boolean result = meterReadingService.saveMeterReading(newReading);

        assertFalse(result);
        verify(meterReadingRepository, never()).save(any());
    }

    @Test
    void testRejectLowerDayReading() {
        MeterReading newReading = new MeterReading();
        newReading.setMeter(meter);
        newReading.setDayReading(90); // Нижче попереднього
        newReading.setNightReading(70);
        newReading.setDateTime(LocalDateTime.now());

        when(meterRepository.findByMeterNumber(String.valueOf(10))).thenReturn(Optional.of(meter));
        when(meterReadingRepository.findByMeterId(1L)).thenReturn(List.of(previousReading));

        boolean result = meterReadingService.saveMeterReading(newReading);

        assertFalse(result);
        verify(meterReadingRepository, never()).save(any());
    }

    @Test
    void testRejectLowerDayAndNightReading() {
        MeterReading newReading = new MeterReading();
        newReading.setMeter(meter);
        newReading.setDayReading(90);
        newReading.setNightReading(40);
        newReading.setDateTime(LocalDateTime.now());

        when(meterRepository.findByMeterNumber(String.valueOf(10))).thenReturn(Optional.of(meter));
        when(meterReadingRepository.findByMeterId(1L)).thenReturn(List.of(previousReading));

        boolean result = meterReadingService.saveMeterReading(newReading);

        assertFalse(result);
        verify(meterReadingRepository, never()).save(any());
    }

    @Test
    void testRejectSameReadings() {
        MeterReading newReading = new MeterReading();
        newReading.setMeter(meter);
        newReading.setDayReading(100);
        newReading.setNightReading(50);
        newReading.setDateTime(LocalDateTime.now());

        when(meterRepository.findByMeterNumber(String.valueOf(10))).thenReturn(Optional.of(meter));
        when(meterReadingRepository.findByMeterId(1L)).thenReturn(List.of(previousReading));

        boolean result = meterReadingService.saveMeterReading(newReading);

        assertFalse(result);
        verify(meterReadingRepository, never()).save(any());
    }
}
