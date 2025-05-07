import unittest
import numpy as np
from thomas_attractor import generate_trajectory

class TestThomasAttractor(unittest.TestCase):
    def test_no_nan_or_inf(self):
        xs, ys, zs = generate_trajectory(0.1, 0, 0, 0.01, 10000)
        for series in (xs, ys, zs):
            self.assertFalse(any(np.isnan(series)))
            self.assertFalse(any(np.isinf(series)))

    def test_repeatability(self):
        traj1 = generate_trajectory(0.1, 0, 0, 0.01, 1000)
        traj2 = generate_trajectory(0.1, 0, 0, 0.01, 1000)
        for a, b in zip(traj1, traj2):
            np.testing.assert_array_almost_equal(a, b)

    def test_chaos_sensitivity(self):
        dt = 0.01
        steps = 50000
        xs1, ys1, zs1 = generate_trajectory(0.1, 0, 0, dt, steps)
        xs2, ys2, zs2 = generate_trajectory(0.10001, 0, 0, dt, steps)

        distance = np.sqrt((xs1[-1] - xs2[-1]) ** 2 +
                           (ys1[-1] - ys2[-1]) ** 2 +
                           (zs1[-1] - zs2[-1]) ** 2)

        self.assertGreater(distance, 1)

    def test_length_of_output(self):
        steps = 1234
        xs, ys, zs = generate_trajectory(0.1, 0, 0, 0.01, steps)
        self.assertEqual(len(xs), steps)
        self.assertEqual(len(ys), steps)
        self.assertEqual(len(zs), steps)