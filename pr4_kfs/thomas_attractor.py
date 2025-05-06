import numpy as np

b = 0.208186

def thomas_attractor(x, y, z, dt):
    dx = np.sin(y) - b * x
    dy = np.sin(z) - b * y
    dz = np.sin(x) - b * z
    return x + dx * dt, y + dy * dt, z + dz * dt

def generate_trajectory(x0, y0, z0, dt, steps):
    xs, ys, zs = [], [], []
    x, y, z = x0, y0, z0
    for _ in range(steps):
        x, y, z = thomas_attractor(x, y, z, dt)
        xs.append(x)
        ys.append(y)
        zs.append(z)
    return xs, ys, zs
