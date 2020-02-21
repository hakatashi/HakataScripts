#include <iostream>
#include <vector>

int main() {
  std::vector<int> ints = {0, 1};
  std::cout << &ints[0] << std::endl;
  std::cout << &ints[1] << std::endl;

  std::vector<bool> bools = {true, false};
  std::cout << &bools[0] << std::endl;
  std::cout << &bools[1] << std::endl;

  return 0;
}