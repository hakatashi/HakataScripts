def extended_gcd(a, b)
  last_remainder, remainder = a.abs, b.abs
  x, last_x, y, last_y = 0, 1, 1, 0
  while remainder != 0
    new_last_remainder = remainder
    quotient, remainder = last_remainder.divmod(remainder)
    last_remainder = new_last_remainder
    x, last_x = last_x - quotient * x, x
    y, last_y = last_y - quotient * y, y
  end
  return last_remainder, (last_x * (a < 0 ? -1 : 1)) % b
end

def to_contfrac(a, b)
  ret = []
  while a % b != 0
    ret << a / b
    a, b = b, a % b
  end
  ret << a / b
  ret
end

def to_rational(q)
  as = [1]
  bs = [0]
  q.each_with_index do |c, i|
    if i == 0
      as << c
      bs << 1
    else
      as << c * as[-1] + as[-2]
      bs << c * bs[-1] + bs[-2]
    end
  end
  [as.last, bs.last, bs]
end

p0 = 248482352524281435261019953257012498723
q0 = 12457873625683070043093230422819168151
n = p0 * q0
phi = (p0 - 1) * (q0 - 1)

d = 1145141
_, e = extended_gcd(d, phi)

near_q = q0 + 26460

p to_rational(to_contfrac(e, n))