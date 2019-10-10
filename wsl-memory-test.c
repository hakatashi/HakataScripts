#include <stdlib.h>
#include <stdio.h>
#define STR_MAX 10000000000

int main() {
  char *str = (char *)malloc(STR_MAX);
  printf("%p\n", str);
  return 0;
}

