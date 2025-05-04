import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import odeint
from lorenz import lorenz_derive
from matplotlib.animation import FuncAnimation

def simulate(initial_state, t_max=40, dt=0.01):
    t = np.arange(0, t_max, dt)
    trajectory = odeint(lorenz_derive, initial_state, t)
    return t, trajectory

def animate_trajectories():
    # Параметри симуляції
    t, traj1 = simulate([1.0, 1.0, 1.0])
    _, traj2 = simulate([1.001, 1.0, 1.0])

    fig = plt.figure(figsize=(10, 6))
    ax = fig.add_subplot(111, projection='3d')
    ax.set_xlim((-25, 25))
    ax.set_ylim((-35, 35))
    ax.set_zlim((5, 55))
    ax.set_title("Анімація атрактора Лоренца (2 траєкторії)")

    # Лінії та точки для кожної траєкторії
    line1, = ax.plot([], [], [], lw=1, color='blue', label='[1,1,1]')
    dot1, = ax.plot([], [], [], 'o', color='blue')
    line2, = ax.plot([], [], [], lw=1, color='red', label='[1.001,1,1]')
    dot2, = ax.plot([], [], [], 'o', color='red')
    ax.legend()

    def update(num):
        # Перша траєкторія
        line1.set_data(traj1[:num, 0], traj1[:num, 1])
        line1.set_3d_properties(traj1[:num, 2])
        dot1.set_data([traj1[num, 0]], [traj1[num, 1]])
        dot1.set_3d_properties([traj1[num, 2]])

        # Друга траєкторія
        line2.set_data(traj2[:num, 0], traj2[:num, 1])
        line2.set_3d_properties(traj2[:num, 2])
        dot2.set_data([traj2[num, 0]], [traj2[num, 1]])
        dot2.set_3d_properties([traj2[num, 2]])

        return line1, dot1, line2, dot2

    ani = FuncAnimation(fig, update, frames=len(t), interval=20, blit=True)
    plt.show()

if __name__ == "__main__":
    animate_trajectories()
