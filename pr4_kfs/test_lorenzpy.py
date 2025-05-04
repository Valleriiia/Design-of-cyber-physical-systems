import unittest
from lorenz import lorenz_derive

class TestLorenz(unittest.TestCase):
    def test_deriv_shape(self):
        state = [1.0, 1.0, 1.0]
        t = 0
        deriv = lorenz_derive(state, t)
        self.assertEqual(len(deriv), 3)

    def test_zero_state(self):
        state = [0.0, 0.0, 0.0]
        t = 0
        dx, dy, dz = lorenz_derive(state, t)
        self.assertEqual((dx, dy, dz), (0.0, 0.0, 0.0))

if __name__ == "__main__":
    unittest.main()
