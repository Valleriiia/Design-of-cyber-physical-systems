import numpy as np

b = 0.208186

def thomas_attractor(x, y, z, dt):
    dx = (np.sin(y) - b * x) * dt
    dy = (np.sin(z) - b * y) * dt
    dz = (np.sin(x) - b * z) * dt
    return x + dx, y + dy, z + dz

def generate_trajectory(x, y, z, dt, steps):
    xs, ys, zs = [], [], []
    for _ in range(steps):
        x, y, z = thomas_attractor(x, y, z, dt)
        xs.append(x)
        ys.append(y)
        zs.append(z)
    return xs, ys, zs
