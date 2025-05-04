def lorenz_derive(state, t, sigma=10.0, rho=28.0, beta=8.0 / 3.0):
    x, y, z = state
    dx = sigma * (y - x)
    dy = x * (rho - z) - y
    dz = x * y - beta * z
    return [dx, dy, dz]
