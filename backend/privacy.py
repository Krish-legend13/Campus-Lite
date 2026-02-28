import random

def apply_laplace_noise(value: float, epsilon: float = 1.0, sensitivity: float = 1.0) -> int:
    # A simplified differential privacy noise mechanism using random(-2, +2) as requested
    noise = random.randint(-2, 2)
    new_val = int(value + noise)
    return max(0, new_val) # Prevent negative stats
