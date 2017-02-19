x = 0
for n from 1 til Infinity
  x += 1 / (n * n)
  pi = Math.sqrt 6 * x
  console.log n, pi
  if pi > 3.05
    break
