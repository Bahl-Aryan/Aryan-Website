#include "fs.h"
#include <iostream>
#include <string>

int main() {
  FileSystem fs;
  std::string line;
  while (true) {
    std::cout << "aryanOS:" << fs.pwd() << " $ ";
    if (!std::getline(std::cin, line)) {
      std::cout << "\nsee you next time :)\n";
      break;
    }
    if (line == "exit") {
      break;
    }
    if (line.empty()) {
      continue;
    }
    std::cout << "typed " << line << "\n";
  }
  return 0;
}
