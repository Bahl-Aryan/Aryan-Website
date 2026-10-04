#include <iostream>

#include "fs.h"

int main() {
  FileSystem fs;
  std::cout << fs.pwd() << '\n';
  return 0;
}
