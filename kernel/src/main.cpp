// this file AI generated because I didn't want to write this stuff lmao
#include <iostream>
#include <string>

#include "fs.h"

// Prints PASS/FAIL for one check and counts failures
static int failures = 0;
static void check(bool ok, const std::string &what) {
  std::cout << (ok ? "PASS  " : "FAIL  ") << what << '\n';
  if (!ok) {
    failures++;
  }
}

int main() {
  FileSystem fs;

  // slice 1
  check(fs.pwd() == "/", "pwd at root is /");

  // slice 2: mkdir + ls
  check(fs.ls().empty(), "ls on a fresh filesystem is empty");

  check(fs.mkdir("b") == Status::Ok, "mkdir b");
  check(fs.mkdir("a") == Status::Ok, "mkdir a");
  check(fs.ls() == std::vector<std::string>{"a/", "b/"},
        "ls shows a/ b/ in alphabetical order");

  check(fs.mkdir("a") == Status::AlreadyExists,
        "mkdir a again -> AlreadyExists");
  check(fs.mkdir("") == Status::InvalidName, "mkdir \"\" -> InvalidName");
  check(fs.mkdir("x/y") == Status::InvalidName, "mkdir x/y -> InvalidName");
  check(fs.mkdir(".") == Status::InvalidName, "mkdir . -> InvalidName");
  check(fs.mkdir("..") == Status::InvalidName, "mkdir .. -> InvalidName");
  check(fs.ls().size() == 2, "failed mkdirs didn't add anything");

  std::cout << "\nls:\n";
  for (const auto &entry : fs.ls()) {
    std::cout << "  " << entry << '\n';
  }

  std::cout << '\n'
            << (failures == 0 ? "all checks passed"
                              : std::to_string(failures) + " check(s) failed")
            << '\n';
  return failures == 0 ? 0 : 1;
}
