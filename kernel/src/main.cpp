// The REPL goes here (next branch). Tests live in tests/ and run with `make test`.
#include <iostream>

#include "fs.h"

int main() {
  FileSystem fs;
  std::cout << fs.pwd() << '\n';
  return 0;
}
