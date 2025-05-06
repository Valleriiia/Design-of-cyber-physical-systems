import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
from thomas_attractor import generate_trajectory

dt = 0.01
steps = 50000

xs1, ys1, zs1 = generate_trajectory(0.1, 0, 0, dt, steps)
xs2, ys2, zs2 = generate_trajectory(0.10001, 0, 0, dt, steps)

fig = plt.figure()
ax = fig.add_subplot(111, projection='3d')
line1, = ax.plot([], [], [], lw=1, color='blue', label='x=0.1')
line2, = ax.plot([], [], [], lw=1, color='red', label='x=0.10001')
point1, = ax.plot([], [], [], 'bo')
point2, = ax.plot([], [], [], 'ro')

ax.set_xlim(-10, 10)
ax.set_ylim(-10, 10)
ax.set_zlim(-10, 10)
ax.set_title("Анімація атрактора Томаса")
ax.legend()

def update(num):
    line1.set_data(xs1[:num], ys1[:num])
    line1.set_3d_properties(zs1[:num])
    point1.set_data(xs1[num - 1:num], ys1[num - 1:num])
    point1.set_3d_properties(zs1[num - 1:num])

    line2.set_data(xs2[:num], ys2[:num])
    line2.set_3d_properties(zs2[:num])
    point2.set_data(xs2[num - 1:num], ys2[num - 1:num])
    point2.set_3d_properties(zs2[num - 1:num])

    return line1, line2, point1, point2

ani = FuncAnimation(fig, update, frames=range(100, steps, 20), interval=30, blit=True)
plt.show()
