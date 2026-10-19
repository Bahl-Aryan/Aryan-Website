#include "shell.h"
#include <iostream>
#include <string>

int main() {
  Shell shell;
  std::string line;
  while (true) {
    std::cout << shell.prompt();
    if (!std::getline(std::cin, line)) {
      std::cout << "\nsee you next time :)\n";
      break;
    }
    // execute handles blank lines and exit itself; output already ends in \n
    std::cout << shell.execute(line);
    if (shell.shouldExit()) {
      break;
    }
  }
  return 0;
}
